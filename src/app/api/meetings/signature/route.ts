import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { requireSessionEnrollment } from '@/lib/services/studentAuthService';
import { LiveSessionService } from '@/lib/services/liveSessionService';
import crypto from 'crypto';

/**
 * Generates a standard Zoom Video SDK JWT signature if external microservice is offline
 */
function generateLocalZoomSignature(
  sdkKey: string,
  sdkSecret: string,
  meetingId: string,
  role: number,
  userIdentity: string,
  passcode: string
): string {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours validity

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    app_key: sdkKey,
    tpc: meetingId,
    role_type: role,
    version: 1,
    iat,
    exp,
    user_identity: userIdentity,
    pwd: passcode,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', sdkSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawSessionId = body.sessionId || body.session_id;
    const requestedRole = typeof body.role === 'number' ? body.role : 0;

    if (!rawSessionId) {
      return NextResponse.json({ error: 'sessionId (or session_id) is required.' }, { status: 400 });
    }

    // 1. Fetch LiveSession by ID
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: rawSessionId },
      include: {
        liveCourse: {
          select: { id: true, title: true, leadInstructorId: true }
        }
      }
    });

    if (!liveSession) {
      return NextResponse.json(
        { error: `LiveSession with ID "${rawSessionId}" not found.` },
        { status: 404 }
      );
    }

    // 2. Ensure deterministic meetingId & passcode are stored
    let meetingId = liveSession.meetingId;
    let passcode = liveSession.meetingPasscode;

    if (!meetingId || !passcode) {
      meetingId = meetingId || crypto.randomUUID();
      passcode = passcode || crypto.randomBytes(4).toString('hex').toUpperCase();

      await prisma.liveSession.update({
        where: { id: rawSessionId },
        data: {
          meetingId,
          meetingPasscode: passcode
        }
      });
    }

    // 3. Object-level authorization & role check
    let authorizedRole = 0; // default student attendee

    if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
      // Instructor is permitted to request role = 1 (Host) or role = 0
      authorizedRole = requestedRole === 1 ? 1 : 0;
    } else {
      // Student must have active enrollment
      await requireSessionEnrollment(user.id, rawSessionId);

      // Student is gated by 15-minute pre-join window
      const computed = LiveSessionService.computeSessionStatus(
        liveSession.date,
        liveSession.startTime,
        liveSession.duration
      );

      if (!computed.canJoin && computed.status !== 'ONGOING') {
        return NextResponse.json(
          {
            error: 'Class has not started yet. The live classroom unlocks 15 minutes before session start.',
            sessionStart: computed.sessionStart?.toISOString()
          },
          { status: 403 }
        );
      }

      authorizedRole = 0;

      // Automatically log student attendance
      await prisma.liveSessionAttendance.upsert({
        where: { sessionId_userId: { sessionId: liveSession.id, userId: user.id } },
        update: {
          status: 'PRESENT',
          joinedAt: new Date()
        },
        create: {
          sessionId: liveSession.id,
          userId: user.id,
          status: 'PRESENT',
          joinedAt: new Date()
        }
      }).catch(() => {});
    }

    // 4. Request Zoom Video SDK Signature from Python backend
    const zoomServiceUrl =
      process.env.ZOOM_SIGNATURE_SERVICE_URL || 'http://192.168.1.14:8000/meetings/signature';
    const fallbackSdkKey = process.env.ZOOM_SDK_KEY || '1YeeUCULQD7tJesoWxT8h7dTVf3umwu29RBA';
    const fallbackSdkSecret = process.env.ZOOM_SDK_SECRET || 'ZOOM_DEV_FALLBACK_SECRET_KEY_12345';

    let sdkKey = fallbackSdkKey;
    let signature = '';

    try {
      const sigResponse = await fetch(zoomServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meetingId,
          passcode: passcode,
          role: authorizedRole,
          user_identity: user.name || user.id
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (sigResponse.ok) {
        const sigData = await sigResponse.json();
        sdkKey = sigData.sdk_key || fallbackSdkKey;
        signature = sigData.signature;
      } else {
        throw new Error(`Signature service returned HTTP ${sigResponse.status}`);
      }
    } catch (svcErr: any) {
      // Local fallback token generation for offline dev / test environments
      console.warn(`[Zoom Signature Service] Primary service at ${zoomServiceUrl} unavailable (${svcErr.message}). Using fallback signer.`);
      signature = generateLocalZoomSignature(
        fallbackSdkKey,
        fallbackSdkSecret,
        meetingId,
        authorizedRole,
        user.name || user.id,
        passcode
      );
    }

    // Telemetry log (sanitizing signature token)
    console.log(
      `[Zoom Video SDK Signature Granted] user="${user.name}" (id: ${user.id}) session_id="${rawSessionId}" meeting_id="${meetingId}" role=${authorizedRole}`
    );

    return NextResponse.json({
      success: true,
      sdk_key: sdkKey,
      meeting_id: meetingId,
      passcode: passcode,
      signature: signature,
      role: authorizedRole,
      userName: user.name || 'Participant',
      sessionTitle: liveSession.title,
      courseTitle: liveSession.liveCourse?.title || 'Live Cohort'
    });

  } catch (err: any) {
    console.error('[Zoom Signature Error]:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to generate Zoom Video SDK signature.' },
      { status: 400 }
    );
  }
}
