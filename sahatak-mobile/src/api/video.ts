/**
 * video.ts
 * --------
 * Real Jitsi video consultation API, matching the ACTUAL production backend
 * (backend/routes/appointments.py + services/video_conf_service.py) and the
 * website's own join approach (frontend/assets/js/components/video-consultation.js).
 *
 * CONFIRMED facts from source inspection + live API:
 *  - GET /appointments/:id/video/config is PUBLIC (no auth) and returns
 *    { jitsi_domain, app_id, room_prefix, max_duration_minutes, config,
 *      interface_config, features }.
 *  - The website joins room `sahatak_appointment_{appointmentId}` (deterministic,
 *    PUBLIC, no JWT) on the backend-provided jitsi_domain, bypassing the
 *    session_id/JWT path. Mobile MUST use the same room convention so a
 *    patient on mobile lands in the SAME room the doctor opened from the site.
 *  - POST video/start (doctor only) creates the backend session record;
 *    video/join requires it; video/end, video/status, video/heartbeat are
 *    participant-authenticated keep-alive/lifecycle calls.
 */

import apiClient, { ApiEnvelope, unwrap } from './client';

export interface RawVideoConfig {
  jitsi_domain: string;
  app_id: string;
  room_prefix: string;
  max_duration_minutes: number;
  config: Record<string, unknown>;
  interface_config: Record<string, unknown>;
  features: Record<string, unknown>;
}

export interface RawVideoSession {
  room_name: string;
  jitsi_domain: string;
  participant_role: 'moderator' | 'participant';
  config: Record<string, unknown>;
  interface_config: Record<string, unknown>;
  session_started: string;
  jwt_token?: string;
}

/** GET /appointments/:id/video/config — public, no auth required. */
export async function getVideoConfigApi(appointmentId: number | string): Promise<RawVideoConfig> {
  const response = await apiClient.get<ApiEnvelope<RawVideoConfig>>(
    `/appointments/${appointmentId}/video/config`,
  );
  return unwrap(response);
}

/** POST /appointments/:id/video/start — doctor only; creates the session record. */
export async function startVideoSessionApi(appointmentId: number | string): Promise<Record<string, unknown>> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/appointments/${appointmentId}/video/start`,
  );
  return unwrap(response);
}

/**
 * POST /appointments/:id/video/join — join the backend session. Requires the
 * doctor to have called video/start (session_id set); 422 otherwise. The
 * website bypasses this for the room join itself (public room), so callers
 * should tolerate failure and still connect to the public room.
 */
export async function joinVideoSessionApi(
  appointmentId: number | string,
): Promise<RawVideoSession> {
  const response = await apiClient.post<ApiEnvelope<RawVideoSession>>(
    `/appointments/${appointmentId}/video/join`,
  );
  return unwrap(response);
}

/** POST /appointments/:id/video/end — end the session (participant). */
export async function endVideoSessionApi(appointmentId: number | string): Promise<Record<string, unknown>> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/appointments/${appointmentId}/video/end`,
  );
  return unwrap(response);
}

/** GET /appointments/:id/video/status — current session status. */
export async function getVideoStatusApi(appointmentId: number | string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(
    `/appointments/${appointmentId}/video/status`,
  );
  return unwrap(response);
}

/** POST /appointments/:id/video/heartbeat — keep-alive while the call is active. */
export async function sendVideoHeartbeatApi(appointmentId: number | string): Promise<Record<string, unknown>> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/appointments/${appointmentId}/video/heartbeat`,
  );
  return unwrap(response);
}