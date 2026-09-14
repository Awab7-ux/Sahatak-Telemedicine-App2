/**
 * Patient Journey — canonical single source of truth for stage derivation.
 * Pure logic only: no React, no API, no navigation. Stage/step state is
 * ADVISORY/derived — the backend's authorization and appointment status remain
 * the real gate for everything a patient can actually do.
 */

export type JourneyStageId =
  | 'DISCOVER'
  | 'BOOK'
  | 'PREPARE'
  | 'WAIT'
  | 'CONSULT'
  | 'COMPLETE'
  | 'UNDERSTAND'
  | 'FOLLOW_UP';

export type StageState =
  | 'not_started'
  | 'current'
  | 'completed'
  | 'skipped'
  | 'unavailable'
  | 'cancelled';

export interface JourneyStage {
  id: JourneyStageId;
  state: StageState;
}

export type AppointmentRawStatus =
  | 'scheduled'
  | 'confirmed'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'canceled'
  | 'none';

export interface JourneyInput {
  /** Raw backend appointment status; 'none' when the patient has no appointment. */
  appointmentStatus: AppointmentRawStatus;
  /**
   * ISO datetime of the appointment (undefined/invalid when unknown). Only
   * used to split upcoming appointments into PREPARE (>24h) vs WAIT (<24h).
   */
  appointmentDateTime?: string;
  /** Consultation notes / diagnosis / prescription availability flags. */
  hasNotes?: boolean;
  hasDiagnosis?: boolean;
  hasPrescription?: boolean;
  /** True when the patient already booked a follow-up for this consultation. */
  followUpBooked?: boolean;
}

export interface JourneyResult {
  /** True when the whole journey is cancelled (no next-step suggestion). */
  cancelled: boolean;
  stages: JourneyStage[];
}

/** Order is fixed: DISCOVER → BOOK → PREPARE → WAIT → CONSULT → COMPLETE → UNDERSTAND → FOLLOW UP */
export const JOURNEY_STAGE_ORDER: JourneyStageId[] = [
  'DISCOVER',
  'BOOK',
  'PREPARE',
  'WAIT',
  'CONSULT',
  'COMPLETE',
  'UNDERSTAND',
  'FOLLOW_UP',
];

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function buildStages(
  current: JourneyStageId,
  completedUpTo: JourneyStageId | null,
): JourneyStage[] {
  const currentIdx = JOURNEY_STAGE_ORDER.indexOf(current);
  const completedIdx = completedUpTo === null ? -1 : JOURNEY_STAGE_ORDER.indexOf(completedUpTo);
  return JOURNEY_STAGE_ORDER.map((id) => {
    const idx = JOURNEY_STAGE_ORDER.indexOf(id);
    if (idx <= completedIdx) return { id, state: 'completed' as StageState };
    if (id === current) return { id, state: 'current' as StageState };
    return { id, state: 'not_started' as StageState };
  });
}

/**
 * Derives the patient journey from a real mobile `Appointment` object.
 * The mobile app pre-maps backend statuses to 'upcoming' | 'completed' |
 * 'cancelled', so we re-classify: 'upcoming' → 'scheduled'. Clinical flags
 * come only from fields the backend actually returns (notes / prescriptionId).
 */
export function deriveJourneyFromAppointment(
  apt: {
    status: 'upcoming' | 'completed' | 'cancelled';
    appointmentDate?: string;
    date?: string;
    timeSlot?: string;
    notes?: string;
    prescriptionId?: string;
  } | null | undefined,
  options?: { hasDiagnosis?: boolean; followUpBooked?: boolean },
): JourneyResult {
  if (!apt) return deriveJourney({ appointmentStatus: 'none' });

  let rawStatus: AppointmentRawStatus = 'none';
  if (apt.status === 'cancelled') rawStatus = 'cancelled';
  else if (apt.status === 'completed') rawStatus = 'completed';
  else if (apt.status === 'upcoming') rawStatus = 'scheduled';

  let dateTime: string | undefined = apt.appointmentDate ?? apt.date;
  // Combine date + time slot when the ISO date is missing or date-only.
  if (dateTime && apt.timeSlot && !/t\d{2}:\d{2}/i.test(dateTime)) {
    const hhmm = apt.timeSlot.match(/\d{1,2}:\d{2}/)?.[0];
    if (hhmm) dateTime = `${dateTime}T${hhmm}:00`;
  }

  return deriveJourney({
    appointmentStatus: rawStatus,
    appointmentDateTime: dateTime,
    hasNotes: Boolean(apt.notes),
    hasPrescription: Boolean(apt.prescriptionId),
    hasDiagnosis: options?.hasDiagnosis,
    followUpBooked: options?.followUpBooked,
  });
}

/**
 * Derives the patient journey from an appointment object plus consultation /
 * diagnosis / prescription availability flags. Never invents clinical data —
 * the flags are expected to come from real API fields only.
 */
export function deriveJourney(input: JourneyInput): JourneyResult {
  const status = input.appointmentStatus ?? 'none';

  if (status === 'cancelled' || status === 'canceled') {
    return {
      cancelled: true,
      stages: JOURNEY_STAGE_ORDER.map((id) => ({ id, state: 'cancelled' as StageState })),
    };
  }

  // No appointment at all → start of the journey.
  if (status === 'none') {
    const stages = buildStages('DISCOVER', null);
    // BOOK is "up next" conceptually; keep it not_started (DISCOVER is current).
    return { cancelled: false, stages };
  }

  // In progress → live consultation.
  if (status === 'in_progress') {
    return { cancelled: false, stages: buildStages('CONSULT', 'WAIT') };
  }

  // Upcoming (scheduled / confirmed / pending).
  if (status === 'scheduled' || status === 'confirmed' || status === 'pending') {
    const ts = input.appointmentDateTime ? Date.parse(input.appointmentDateTime) : NaN;
    const within24h =
      !Number.isNaN(ts) && ts - Date.now() <= TWENTY_FOUR_HOURS_MS;

    if (within24h) {
      // PREPARE completed, WAIT current.
      return { cancelled: false, stages: buildStages('WAIT', 'PREPARE') };
    }
    // BOOK completed, PREPARE current.
    return { cancelled: false, stages: buildStages('PREPARE', 'BOOK') };
  }

  // Completed appointment.
  if (status === 'completed') {
    const notesReady = Boolean(input.hasNotes || input.hasDiagnosis || input.hasPrescription);
    if (!notesReady) {
      // COMPLETE done, doctor hasn't added notes yet → UNDERSTAND current.
      return { cancelled: false, stages: buildStages('UNDERSTAND', 'COMPLETE') };
    }
    if (input.followUpBooked) {
      // Journey complete: every stage (including FOLLOW UP) is completed.
      return {
        cancelled: false,
        stages: JOURNEY_STAGE_ORDER.map((id) => ({ id, state: 'completed' as StageState })),
      };
    }
    // UNDERSTAND done (notes present), follow-up not booked → FOLLOW UP current.
    return { cancelled: false, stages: buildStages('FOLLOW_UP', 'UNDERSTAND') };
  }

  // Unknown status — treat defensively as no-appointment-equivalent DISCOVER.
  return { cancelled: false, stages: buildStages('DISCOVER', null) };
}
