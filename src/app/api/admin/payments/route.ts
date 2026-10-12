import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/dateTime";

export async function GET() {
  try {
    const session = await getSession();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [purchases, instructors, refunds] = await Promise.all([
      prisma.purchase.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, price: true } },
          liveCourse: { select: { id: true, title: true, price: true } },
          refund: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.findMany({
        where: { role: "INSTRUCTOR" },
        include: {
          courses: {
            include: {
              purchases: true
            }
          },
          instructorProfile: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.refund.findMany({
        include: {
          purchase: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              course: { select: { id: true, title: true } },
              liveCourse: { select: { id: true, title: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Transform purchases into TransactionItem format
    const transactions = purchases.map((p) => {
      const courseTitle = p.course?.title || p.liveCourse?.title || "Course Enrollment";
      const amt = p.amount || p.course?.price || p.liveCourse?.price || 0;
      const statusMap: Record<string, "COMPLETED" | "REFUNDED" | "FAILED" | "PENDING"> = {
        COMPLETED: "COMPLETED",
        REFUNDED: "REFUNDED",
        FAILED: "FAILED",
        PENDING: "PENDING"
      };

      return {
        id: p.transactionId || `TXN-${p.id.slice(-6).toUpperCase()}`,
        student: p.user?.name || "Student",
        email: p.user?.email || "student@glarus.edu",
        course: courseTitle,
        amount: amt,
        paymentMethod: (p.paymentMethod === "UPI" ? "UPI / Razorpay" : p.paymentMethod === "NET_BANKING" ? "Net Banking" : "Credit Card") as any,
        status: statusMap[p.paymentStatus] || "COMPLETED",
        date: formatDate(p.createdAt)
      };
    });

    // Transform instructors into InstructorPayoutItem format
    const payouts = instructors.map((inst) => {
      const totalEarned = inst.courses.reduce((acc, c) => acc + (c.purchases?.length || 0) * (c.price || 0), 0);
      const pendingAmt = Math.round(totalEarned * 0.85); // 85% instructor revenue share

      return {
        id: `PO-${inst.id.slice(-5).toUpperCase()}`,
        instructor: inst.name,
        email: inst.email,
        tasksCompleted: 4,
        coursesCount: inst.courses.length,
        pendingAmount: pendingAmt,
        totalPaid: Math.round(totalEarned * 0.15),
        payoutMethod: "Direct Bank Transfer (NEFT)",
        status: (pendingAmt > 0 ? "Pending" : "Paid") as "Pending" | "Processing" | "Paid",
        lastPayoutDate: formatDate(inst.updatedAt)
      };
    });

    // Transform refunds
    const transformedRefunds = refunds.map((r) => ({
      id: `RF-${r.id.slice(-5).toUpperCase()}`,
      student: r.purchase?.user?.name || "Student",
      email: r.purchase?.user?.email || "student@glarus.edu",
      course: r.purchase?.course?.title || r.purchase?.liveCourse?.title || "Course",
      amount: r.amount,
      reason: r.reason || "Student requested cancellation",
      requestedDate: formatDate(r.createdAt),
      status: (r.status === "APPROVED" ? "Approved" : r.status === "REJECTED" ? "Rejected" : "Pending") as "Pending" | "Approved" | "Rejected"
    }));

    return NextResponse.json({
      success: true,
      transactions,
      payouts,
      refunds: transformedRefunds
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/payments:", err);
    return NextResponse.json({ error: "Failed to fetch payments data", details: err?.message }, { status: 500 });
  }
}
