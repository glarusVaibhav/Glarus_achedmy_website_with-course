import prisma from '@/lib/db';
import { emitDomainEvent } from '@/lib/notifications/eventDispatcher';
import { DOMAIN_EVENT_TYPES } from '@/lib/notifications/events';

export interface CheckoutItemInput {
  id: string;
  type: 'SELF_PACED_COURSE' | 'LIVE_COURSE' | 'BUNDLE';
}

export interface BillingDetailsInput {
  name?: string;
  email?: string;
}

export class PurchaseService {
  /**
   * Processes a verified purchase and enrollment atomically.
   * Authoritative price is looked up from DB. Client-supplied prices are NEVER trusted.
   */
  static async processCheckout(
    userId: string,
    items: CheckoutItemInput[],
    paymentMethod = 'CARD',
    billingDetails?: BillingDetailsInput,
    transactionId?: string
  ) {
    if (!items || items.length === 0) {
      throw new Error('Cart cannot be empty.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const billingName = billingDetails?.name || user.name || 'Student Learner';
    const billingEmail = billingDetails?.email || user.email;

    // 1. Authoritative Validation & Price Lookup for all items
    const resolvedItems: Array<{
      id: string;
      title: string;
      isLive: boolean;
      price: number;
      instructorId?: string | null;
    }> = [];

    for (const item of items) {
      const isLive = item.type === 'LIVE_COURSE';

      if (isLive) {
        // Find in LiveCourse
        const liveCourse = await prisma.liveCourse.findUnique({
          where: { id: item.id },
        });

        if (!liveCourse) {
          throw new Error(`Live course with ID ${item.id} not found.`);
        }

        // Check if student is already actively enrolled
        const alreadyEnrolled = await prisma.liveCourseEnrollment.findUnique({
          where: { userId_liveCourseId: { userId, liveCourseId: item.id } },
        });

        if (alreadyEnrolled && alreadyEnrolled.status === 'ACTIVE') {
          throw new Error(`You are already enrolled in "${liveCourse.title}".`);
        }

        resolvedItems.push({
          id: liveCourse.id,
          title: liveCourse.title,
          isLive: true,
          price: liveCourse.price || 14999,
          instructorId: liveCourse.leadInstructorId,
        });
      } else {
        // Find in Course (Self-Paced)
        const course = await prisma.course.findUnique({
          where: { id: item.id },
        });

        if (!course) {
          // If not in Course table, check if it's the flagship Generative AI course
          if (
            item.id === 'Generative_AI_Application_Engineer' ||
            item.id === 'course-1' ||
            item.id === '2'
          ) {
            resolvedItems.push({
              id: item.id,
              title: 'Generative AI Application Engineering',
              isLive: false,
              price: 4999,
              instructorId: null,
            });
            continue;
          }
          throw new Error(`Course with ID ${item.id} not found.`);
        }

        const alreadyEnrolled = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: item.id } },
        });

        if (alreadyEnrolled) {
          throw new Error(`You are already enrolled in "${course.title}".`);
        }

        resolvedItems.push({
          id: course.id,
          title: course.title,
          isLive: false,
          price: course.price || 4999,
          instructorId: course.instructorId,
        });
      }
    }

    // 2. Perform Atomic Database Transaction
    const txnPrefix = transactionId || `TXN_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const createdPurchases: any[] = [];
    const createdInvoices: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < resolvedItems.length; i++) {
        const item = resolvedItems[i];
        const itemTxnId = `${txnPrefix}_${i + 1}`;

        // Ensure course exists in DB before linking if self-paced
        if (!item.isLive) {
          await tx.course.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              title: item.title,
              description: `${item.title} curriculum and video modules`,
              price: item.price,
              instructorId: item.instructorId || userId,
              status: 'APPROVED',
              type: 'SELF_PACED',
            },
          });
        }

        // a) Create Purchase
        const purchase = await tx.purchase.create({
          data: {
            userId,
            itemType: item.isLive ? 'LIVE_COURSE' : 'SELF_PACED_COURSE',
            courseId: !item.isLive ? item.id : null,
            liveCourseId: item.isLive ? item.id : null,
            amount: item.price,
            currency: 'INR',
            paymentMethod,
            transactionId: itemTxnId,
            paymentStatus: 'COMPLETED',
          },
        });
        createdPurchases.push(purchase);

        // b) Generate Invoice
        const invoiceNum = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}${i + 1}`;
        const subtotal = Math.round(item.price / 1.18);
        const taxAmount = Math.round(item.price - subtotal);

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber: invoiceNum,
            purchaseId: purchase.id,
            subtotal,
            taxAmount,
            totalAmount: item.price,
            billingName,
            billingEmail,
            gstin: '29AAACG1234F1Z5',
          },
        });
        createdInvoices.push(invoice);

        // c) Create Respective Enrollment
        if (item.isLive) {
          await tx.liveCourseEnrollment.upsert({
            where: { userId_liveCourseId: { userId, liveCourseId: item.id } },
            update: { status: 'ACTIVE' },
            create: {
              userId,
              liveCourseId: item.id,
              batchName: 'Main Cohort',
              status: 'ACTIVE',
              progress: 0,
            },
          });

          await tx.liveCourse
            .update({
              where: { id: item.id },
              data: { enrolledCount: { increment: 1 } },
            })
            .catch(() => {});
        } else {
          await tx.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: item.id } },
            update: {},
            create: {
              userId,
              courseId: item.id,
              progress: 0,
            },
          });
        }
      }
    });

    // 3. Dispatch Notification Events for Course Instructors (Outside DB Transaction)
    for (const item of resolvedItems) {
      if (item.instructorId) {
        emitDomainEvent({
          eventType: DOMAIN_EVENT_TYPES.STUDENT_ENROLLED,
          actorId: userId,
          payload: {
            courseId: item.id,
            courseTitle: item.title,
            studentId: userId,
            studentName: billingName,
            instructorId: item.instructorId,
          },
        }).catch(() => {});
      }
    }

    return {
      success: true,
      purchasesCount: createdPurchases.length,
      purchases: createdPurchases,
      invoices: createdInvoices,
    };
  }

  /**
   * Retrieves official payment history and invoices for the student.
   */
  static async getStudentPaymentHistory(userId: string) {
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true } },
        liveCourse: { select: { id: true, title: true } },
        invoice: true,
        refund: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const transactions = purchases.map((p) => {
      const courseTitle =
        p.course?.title ||
        p.liveCourse?.title ||
        (p.itemType === 'LIVE_COURSE' ? 'Live Training Cohort' : 'Generative AI Course');

      const category =
        p.itemType === 'LIVE_COURSE' ? 'Live Training Cohort' : 'Self-Paced Course';

      return {
        id: p.id,
        invoiceNumber: p.invoice?.invoiceNumber || `INV-${p.id.slice(0, 8).toUpperCase()}`,
        course: courseTitle,
        category,
        date: new Date(p.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.paymentMethod === 'CARD' ? 'Credit / Debit Card' : p.paymentMethod,
        status: p.paymentStatus,
        invoice: p.invoice
          ? {
              id: p.invoice.id,
              invoiceNumber: p.invoice.invoiceNumber,
              subtotal: p.invoice.subtotal,
              taxAmount: p.invoice.taxAmount,
              totalAmount: p.invoice.totalAmount,
              billingName: p.invoice.billingName,
              billingEmail: p.invoice.billingEmail,
              gstin: p.invoice.gstin,
              issuedAt: p.invoice.issuedAt,
            }
          : null,
      };
    });

    return { transactions };
  }
}
