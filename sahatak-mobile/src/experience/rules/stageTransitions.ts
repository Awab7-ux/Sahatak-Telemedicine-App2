import {
  AppointmentRawStatus,
  JourneyStageId,
  StageState,
} from '../journey';

/**
 * Stage-transition table — testable DATA, not inline logic.
 * Key: classification of the appointment; value: which stage is current and
 * which stages are completed. deriveJourney() looks up rows here.
 */
export type StageKey =
  | 'no_appointment'
  | 'upcoming_far'
  | 'upcoming_near'
  | 'in_progress'
  | 'completed_no_notes'
  | 'completed_notes_no_followup'
  | 'completed_notes_followup_booked'
  | 'cancelled';

export interface StageTransitionRow {
  /** Human-readable description (docs/tests only). */
  description: string;
  current: JourneyStageId;
  /** Stages at or before this index (in JOURNEY_STAGE_ORDER) are completed. */
  completedThrough: JourneyStageId | null;
  /** Whole-journey state override (only for cancelled). */
  journeyState?: StageState;
  /** Suggest a next step? False when cancelled. */
  suggestNextStep: boolean;
}

export const STAGE_TRANSITIONS: Record<StageKey, StageTransitionRow> = {
  no_appointment: {
    description: 'No appointment — DISCOVER is current, nothing completed.',
    current: 'DISCOVER',
    completedThrough: null,
    suggestNextStep: true,
  },
  upcoming_far: {
    description: 'Scheduled/confirmed more than 24h out — BOOK done, PREPARE current.',
    current: 'PREPARE',
    completedThrough: 'BOOK',
    suggestNextStep: true,
  },
  upcoming_near: {
    description: 'Scheduled/confirmed within 24h — PREPARE done, WAIT current.',
    current: 'WAIT',
    completedThrough: 'PREPARE',
    suggestNextStep: true,
  },
  in_progress: {
    description: 'In progress — WAIT done, CONSULT current.',
    current: 'CONSULT',
    completedThrough: 'WAIT',
    suggestNextStep: true,
  },
  completed_no_notes: {
    description: 'Completed, no notes/diagnosis yet — COMPLETE done, UNDERSTAND current.',
    current: 'UNDERSTAND',
    completedThrough: 'COMPLETE',
    suggestNextStep: true,
  },
  completed_notes_no_followup: {
    description: 'Completed with notes, no follow-up booked — UNDERSTAND done, FOLLOW UP current.',
    current: 'FOLLOW_UP',
    completedThrough: 'UNDERSTAND',
    suggestNextStep: true,
  },
  completed_notes_followup_booked: {
    description: 'Completed with notes and a booked follow-up — FOLLOW UP completed.',
    current: 'FOLLOW_UP',
    completedThrough: 'UNDERSTAND',
    suggestNextStep: true,
  },
  cancelled: {
    description: 'Cancelled — entire journey cancelled, no next-step suggestion.',
    current: 'DISCOVER',
    completedThrough: null,
    journeyState: 'cancelled',
    suggestNextStep: false,
  },
};

/** Map a raw backend status to a StageKey classification bucket. */
export function classifyAppointmentStatus(status: AppointmentRawStatus): StageKey {
  switch (status) {
    case 'none':
      return 'no_appointment';
    case 'scheduled':
    case 'confirmed':
    case 'pending':
      // far/near split by the 24h rule happens in deriveJourney (time-based).
      return 'upcoming_far';
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed_no_notes';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    default:
      return 'no_appointment';
  }
}
