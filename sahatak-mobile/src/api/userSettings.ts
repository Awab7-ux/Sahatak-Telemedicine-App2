import apiClient, { unwrap } from './client';
import type { ApiEnvelope } from './client';

/**
 * Calm Mode UI preferences.
 * Stored INSIDE the existing `patient.notification_preferences` JSON column
 * under a `ui` key — persisted via the existing
 * PUT /api/user-settings/patient/preferences endpoint. ZERO schema change.
 */
export interface CalmUiPrefs {
  calm_mode: boolean;
  reduce_animations: boolean;
  reduce_clutter: boolean;
  reduce_notifications: boolean;
  simplified_layout: boolean;
}

export const DEFAULT_CALM_UI_PREFS: CalmUiPrefs = {
  calm_mode: false,
  reduce_animations: false,
  reduce_clutter: false,
  reduce_notifications: false,
  simplified_layout: false,
};

export interface PatientPreferencesResponse {
  preferred_contact_method?: string;
  notification_preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

/** GET /api/user-settings/patient/preferences */
export async function fetchPatientPreferencesApi(): Promise<PatientPreferencesResponse | null> {
  const response = await apiClient.get<ApiEnvelope<PatientPreferencesResponse>>(
    '/user-settings/patient/preferences',
  );
  return unwrap(response) ?? null;
}

/** Extract the `ui` calm-mode object from notification_preferences safely. */
export function extractCalmUiPrefs(prefs: PatientPreferencesResponse | null): CalmUiPrefs {
  const np = (prefs?.notification_preferences ?? {}) as Record<string, unknown>;
  const ui = (np.ui ?? {}) as Partial<CalmUiPrefs>;
  return {
    calm_mode: Boolean(ui.calm_mode),
    reduce_animations: Boolean(ui.reduce_animations),
    reduce_clutter: Boolean(ui.reduce_clutter),
    reduce_notifications: Boolean(ui.reduce_notifications),
    simplified_layout: Boolean(ui.simplified_layout),
  };
}

/**
 * PUT /api/user-settings/patient/preferences — merges the `ui` object into the
 * existing notification_preferences payload without disturbing other keys.
 */
export async function updateCalmUiPrefsApi(
  currentNotificationPreferences: Record<string, unknown> | undefined,
  ui: CalmUiPrefs,
): Promise<void> {
  const merged = { ...(currentNotificationPreferences ?? {}), ui };
  await apiClient.put<ApiEnvelope<unknown>>('/user-settings/patient/preferences', {
    notification_preferences: merged,
  });
}
