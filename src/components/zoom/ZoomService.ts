const API_BASE = 'http://192.168.1.17:8000/meetings';

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
  session_id: string;
  meeting_id: string;
  minio_url: string;
}

/**
 * Fetch Zoom Video SDK signature directly from backend.
 * Endpoint: http://192.168.1.17:8000/meetings/signature
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
 * Endpoint: http://192.168.1.17:8000/meetings/leave
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
 * Endpoint: http://192.168.1.17:8000/meetings/end (PATCH method)
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
 * Endpoint: http://192.168.1.17:8000/meetings/{session_id}/recordings/sync (POST method)
 */
export const syncSessionRecording = async (
  sessionId: string
): Promise<RecordingSyncResponse | null> => {
  try {
    console.log(`[Zoom Recording] Triggering recording sync for session: ${sessionId}`);
    const response = await fetch(`${API_BASE}/${sessionId}/recordings/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[Zoom Recording] Sync recording failed with status ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Zoom Recording] Recording synced successfully:', data);
    return data;
  } catch (error) {
    console.error('[Zoom Recording] Error syncing session recording:', error);
    return null;
  }
};
