const API_BASE =
  process.env.NEXT_PUBLIC_ZOOM_API_URL || 'http://192.168.1.24:8000/meetings';

export interface ZoomSignatureResponse {
  sdk_key?: string;
  signature: string;
  meeting_id?: string;
  meetingId?: string;
  passcode?: string;
  role?: string | number;
  user_identity?: string;
}

export interface RecordingSyncResponse {
  session_id?: string;
  meeting_id?: string;
  minio_url?: string;
  recording_url?: string;
}

/**
 * Fetch Zoom Video SDK signature directly from backend.
 * Endpoint: http://192.168.1.24:8000/meetings/signature
 * 
 * Request payload:
 * {
 *   "role": "INSTRUCTOR",
 *   "session_id": "...",
 *   "user_id": "..."
 * }
 */
export const fetchZoomSignature = async (
  sessionId: string,
  userId: string,
  role: string = 'INSTRUCTOR'
): Promise<ZoomSignatureResponse> => {
  try {
    const response = await fetch(`${API_BASE}/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        role: role === 'INSTRUCTOR' || role === 'ADMIN' ? 1 : 0,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.signature) {
        return data;
      }
    }
  } catch (e) {
    console.warn('[ZoomService] Next.js signature route failed, attempting fallback to external API:', e);
  }

  // Fallback to external microservice if configured
  const response = await fetch(`${API_BASE}/signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      session_id: sessionId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `Signature fetch failed with status ${response.status}`
    );
  }

  return await response.json();
};

/**
 * Call backend leave endpoint
 * Endpoint: http://192.168.1.24:8000/meetings/leave
 */
export const leaveZoomMeeting = async (
  sessionId: string,
  userId: string,
  role: string = 'INSTRUCTOR'
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        session_id: sessionId,
        user_id: userId,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error in leaveZoomMeeting:', error);
    return false;
  }
};

/**
 * Call backend end endpoint
 * Endpoint: http://192.168.1.24:8000/meetings/end (PATCH method)
 */
export const endZoomMeeting = async (
  sessionId: string,
  userId: string,
  role: string = 'INSTRUCTOR'
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/end`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        session_id: sessionId,
        user_id: userId,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error in endZoomMeeting:', error);
    return false;
  }
};

/**
 * Sync recording from Zoom cloud to MinIO and store the URL in database.
 * Endpoint: http://192.168.1.24:8000/meetings/{meeting_id}/recordings/sync (POST method)
 * 
 * Note: The {session_id} URL parameter on the Python backend expects the Zoom MEETING ID.
 */
export const syncSessionRecording = async (
  meetingId: string,
  sessionId?: string
): Promise<RecordingSyncResponse | null> => {
  try {
    const targetSessionId = sessionId || meetingId;
    const requestUrl = `${API_BASE}/${meetingId}/recordings/sync`;

    console.log(`\n================== [ZOOM RECORDING SYNC] ==================`);
    console.log(`[Zoom Recording Sync] URL CALLED: ${requestUrl}`);
    console.log(`[Zoom Recording Sync] Passing meetingId as path param: "${meetingId}"`);
    console.log(`[Zoom Recording Sync] Internal DB Session ID: "${targetSessionId}"`);
    console.log(`===========================================================\n`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[Zoom Recording Sync] Request failed with HTTP ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Zoom Recording Sync] Response received from microservice:', data);

    const recordingUrl = data.minio_url || data.recording_url;
    if (recordingUrl) {
      console.log(`[Zoom Recording Sync] Persisting recordingUrl to Postgres DB: ${recordingUrl}`);
      const persistResponse = await fetch('/api/instructor/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: targetSessionId, recordingUrl }),
      });

      if (!persistResponse.ok) {
        const persistError = await persistResponse.text().catch(() => '');
        console.error(
          `[Zoom Recording Sync] Failed to update PostgreSQL DB (status ${persistResponse.status}):`,
          persistError
        );
      } else {
        console.log(`[Zoom Recording Sync] Successfully saved recordingUrl in Postgres for sessionId: ${targetSessionId}`);
      }
    } else {
      console.warn('[Zoom Recording Sync] Sync response did not contain minio_url or recording_url:', data);
    }

    return data;
  } catch (error) {
    console.error('[Zoom Recording Sync] Error syncing session recording:', error);
    return null;
  }
};
