import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { JourneyResult, JourneyStageId } from '../../experience/journey';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

/**
 * Patient Journey Tracker.
 * Renders deriveJourney() output. Compact by default on phone viewports:
 * "Step X of N — STAGE" + a progress bar, followed by a compact stage strip.
 * Purely advisory/derived UI — never a gate for anything.
 */

const STAGE_LABELS: Record<JourneyStageId, { en: string; ar: string }> = {
  DISCOVER: { en: 'Discover', ar: 'استكشف' },
  BOOK: { en: 'Book', ar: 'احجز' },
  PREPARE: { en: 'Prepare', ar: 'استعد' },
  WAIT: { en: 'Wait', ar: 'انتظر' },
  CONSULT: { en: 'Consult', ar: 'الاستشارة' },
  COMPLETE: { en: 'Complete', ar: 'الإكمال' },
  UNDERSTAND: { en: 'Understand', ar: 'افهم' },
  FOLLOW_UP: { en: 'Follow Up', ar: 'المتابعة' },
};

interface JourneyTrackerProps {
  journey: JourneyResult;
}

export const JourneyTracker: React.FC<JourneyTrackerProps> = ({ journey }) => {
  const { t, isRtl } = useApp();
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (journey.cancelled) {
    return (
      <View
        style={styles.container}
        accessibilityRole="text"
        accessibilityLabel={t('Journey: cancelled', 'المسار: ملغي')}
      >
        <Text style={[styles.stepText, { color: Colors.dangerDark }]}>
          {t('This appointment was cancelled.', 'تم إلغاء هذا الموعد.')}
        </Text>
      </View>
    );
  }

  const currentStage = journey.stages.find((s) => s.state === 'current') ?? null;
  const total = journey.stages.length;
  const actionStages = journey.stages.filter((s) => s.id !== 'DISCOVER');
  const actionIdx = currentStage ? actionStages.findIndex((s) => s.id === currentStage.id) : -1;
  const stepLabel =
    currentStage && currentStage.id !== 'DISCOVER'
      ? t(`Step ${actionIdx + 1} of ${actionStages.length}`, `الخطوة ${actionIdx + 1} من ${actionStages.length}`)
      : t('Get started', 'ابدأ الآن');
  const completedCount = journey.stages.filter((s) => s.state === 'completed').length;
  const progress = total > 0 ? completedCount / total : 0;
  const stageLabel = currentStage
    ? t(STAGE_LABELS[currentStage.id].en, STAGE_LABELS[currentStage.id].ar)
    : '';

  return (
    <View style={[styles.container, Shadows.sm]}>
      <View
        style={[styles.headerRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        accessibilityRole="text"
        accessibilityLabel={`${stepLabel} — ${stageLabel}`}
      >
        <Text style={styles.stepText}>
          {stepLabel} — {stageLabel}
        </Text>
      </View>

      {/* Progress bar — no animation; static tint always (reduce-motion safe) */}
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={`${Math.round(progress * 100)}%`}
      >
        <View style={[styles.fill, { width: `${Math.max(progress, 0.04) * 100}%` }]} />
      </View>

      {/* Compact stage strip — logical RTL ordering via flexDirection */}
      <View style={[styles.stagesRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        {journey.stages.map((stage) => (
          <View
            key={stage.id}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${t(STAGE_LABELS[stage.id].en, STAGE_LABELS[stage.id].ar)}: ${stage.state}`}
            accessibilityState={{
              selected: stage.state === 'current',
              disabled: stage.state === 'unavailable' || stage.state === 'cancelled',
            }}
            style={styles.stageItem}
          >
            <View
              style={[
                styles.dot,
                stage.state === 'completed' && styles.dotCompleted,
                stage.state === 'current' && styles.dotCurrent,
              ]}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.stageText,
                stage.state === 'current' && styles.stageTextCurrent,
                (stage.state === 'not_started' || stage.state === 'cancelled') &&
                  styles.stageTextMuted,
              ]}
            >
              {t(STAGE_LABELS[stage.id].en, STAGE_LABELS[stage.id].ar)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    padding: 12,
    gap: 8,
  },
  headerRow: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
    flexShrink: 1,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.slate[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  stagesRow: {
    gap: 4,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.slate[200],
  },
  dotCompleted: {
    backgroundColor: Colors.accent,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
  },
  stageText: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.slate[600],
    textAlign: 'center',
  },
  stageTextCurrent: {
    color: Colors.primary,
    fontWeight: '800',
  },
  stageTextMuted: {
    color: Colors.slate[400],
  },
});
