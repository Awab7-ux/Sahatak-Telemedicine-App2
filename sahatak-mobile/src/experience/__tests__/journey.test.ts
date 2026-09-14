import {
  deriveJourney,
  JOURNEY_STAGE_ORDER,
  JourneyInput,
} from '../journey';
import { STAGE_TRANSITIONS } from '../rules/stageTransitions';

const NOW = Date.now();
const iso = (msFromNow: number) => new Date(NOW + msFromNow).toISOString();
const MORE_THAN_24H = 30 * 60 * 60 * 1000; // 30h out
const LESS_THAN_24H = 3 * 60 * 60 * 1000; // 3h out

const base: JourneyInput = {
  appointmentStatus: 'none',
};

function stateOf(stages: { id: string; state: string }[], id: string) {
  return stages.find((s) => s.id === id)?.state;
}

describe('deriveJourney', () => {
  test('no appointment → DISCOVER current, rest not_started', () => {
    const r = deriveJourney({ ...base });
    expect(r.cancelled).toBe(false);
    expect(stateOf(r.stages, 'DISCOVER')).toBe('current');
    for (const id of ['BOOK', 'PREPARE', 'WAIT', 'CONSULT', 'COMPLETE', 'UNDERSTAND', 'FOLLOW_UP']) {
      expect(stateOf(r.stages, id)).toBe('not_started');
    }
  });

  test('upcoming more than 24h out → BOOK completed, PREPARE current', () => {
    const r = deriveJourney({
      appointmentStatus: 'scheduled',
      appointmentDateTime: iso(MORE_THAN_24H),
    });
    expect(stateOf(r.stages, 'DISCOVER')).toBe('completed');
    expect(stateOf(r.stages, 'BOOK')).toBe('completed');
    expect(stateOf(r.stages, 'PREPARE')).toBe('current');
    expect(stateOf(r.stages, 'WAIT')).toBe('not_started');
  });

  test('upcoming within 24h → PREPARE completed, WAIT current', () => {
    const r = deriveJourney({
      appointmentStatus: 'confirmed',
      appointmentDateTime: iso(LESS_THAN_24H),
    });
    expect(stateOf(r.stages, 'BOOK')).toBe('completed');
    expect(stateOf(r.stages, 'PREPARE')).toBe('completed');
    expect(stateOf(r.stages, 'WAIT')).toBe('current');
    expect(stateOf(r.stages, 'CONSULT')).toBe('not_started');
  });

  test('in progress → CONSULT current', () => {
    const r = deriveJourney({ appointmentStatus: 'in_progress' });
    expect(stateOf(r.stages, 'WAIT')).toBe('completed');
    expect(stateOf(r.stages, 'CONSULT')).toBe('current');
    expect(stateOf(r.stages, 'COMPLETE')).toBe('not_started');
  });

  test('completed with no notes/diagnosis → COMPLETE completed, UNDERSTAND current', () => {
    const r = deriveJourney({ appointmentStatus: 'completed' });
    expect(stateOf(r.stages, 'CONSULT')).toBe('completed');
    expect(stateOf(r.stages, 'COMPLETE')).toBe('completed');
    expect(stateOf(r.stages, 'UNDERSTAND')).toBe('current');
    expect(stateOf(r.stages, 'FOLLOW_UP')).toBe('not_started');
  });

  test('completed with notes present → UNDERSTAND completed, FOLLOW UP current', () => {
    const r = deriveJourney({
      appointmentStatus: 'completed',
      hasDiagnosis: true,
    });
    expect(stateOf(r.stages, 'UNDERSTAND')).toBe('completed');
    expect(stateOf(r.stages, 'FOLLOW_UP')).toBe('current');
  });

  test('completed with notes AND follow-up already booked → FOLLOW UP completed', () => {
    const r = deriveJourney({
      appointmentStatus: 'completed',
      hasNotes: true,
      followUpBooked: true,
    });
    expect(stateOf(r.stages, 'UNDERSTAND')).toBe('completed');
    expect(stateOf(r.stages, 'FOLLOW_UP')).toBe('completed');
    // No stage left is 'current'
    expect(r.stages.some((s) => s.state === 'current')).toBe(false);
  });

  test('cancelled at any point → entire journey cancelled, no next step', () => {
    for (const status of ['cancelled', 'canceled'] as const) {
      const r = deriveJourney({ appointmentStatus: status });
      expect(r.cancelled).toBe(true);
      expect(r.stages.map((s) => s.id)).toEqual(JOURNEY_STAGE_ORDER);
      expect(r.stages.every((s) => s.state === 'cancelled')).toBe(true);
    }
  });

  test('rules table is consistent with the canonical stage order', () => {
    for (const key of Object.keys(STAGE_TRANSITIONS) as (keyof typeof STAGE_TRANSITIONS)[]) {
      const row = STAGE_TRANSITIONS[key];
      expect(JOURNEY_STAGE_ORDER).toContain(row.current);
      if (row.completedThrough) {
        expect(JOURNEY_STAGE_ORDER).toContain(row.completedThrough);
        expect(JOURNEY_STAGE_ORDER.indexOf(row.completedThrough)).toBeLessThan(
          JOURNEY_STAGE_ORDER.indexOf(row.current),
        );
      }
    }
  });
});
