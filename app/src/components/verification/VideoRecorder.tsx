import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../Icon';
import { colors, spacing, borderRadius, typography, touchTargets, shadows } from '../../constants/theme';

interface VideoRecorderProps {
  videoUri?: string;
  onVideoRecorded: (uri: string) => void;
  error?: string;
  maxDuration?: number;
}

export function VideoRecorder({
  videoUri,
  onVideoRecorded,
  error,
  maxDuration = 60,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minDuration = 30;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRecord = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in settings to record a video.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setIsRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= maxDuration) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRecording(false);
        }
        return prev + 1;
      });
    }, 1000);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: maxDuration,
      quality: 0.7,
      allowsEditing: false,
    });

    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (!result.canceled && result.assets[0]) {
      onVideoRecorded(result.assets[0].uri);
    }
  };

  const handleRetake = () => {
    setElapsed(0);
    handleRecord();
  };

  const progressPercent = Math.min((elapsed / maxDuration) * 100, 100);
  const isUnderMin = elapsed < minDuration;
  const progressColor = elapsed >= minDuration ? colors.primary : colors.accent;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error ? styles.labelError : null]}>
        Video Introduction
      </Text>

      {videoUri ? (
        <View style={styles.recordedContainer}>
          <View style={styles.successBadge}>
            <Icon name="check-circle" size={32} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Video recorded!</Text>
          <Text style={styles.successSubtitle}>
            Duration: {formatTime(elapsed)}
          </Text>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={18} color={colors.primary} />
            <Text style={styles.retakeButtonText}>Re-record Video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.recordArea, error ? styles.recordAreaError : null]}>
          {/* Duration indicator */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {minDuration}–{maxDuration}s
            </Text>
          </View>

          {/* Timer display during recording */}
          {isRecording && (
            <View style={styles.timerContainer}>
              <View style={styles.recordingIndicator} />
              <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
            </View>
          )}

          {/* Progress bar */}
          {isRecording && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: progressColor },
                ]}
              />
              {/* Min marker */}
              <View
                style={[
                  styles.minMarker,
                  { left: `${(minDuration / maxDuration) * 100}%` },
                ]}
              />
            </View>
          )}

          {/* Record button */}
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={handleRecord}
            disabled={isRecording}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <Icon name="video" size={32} color={colors.white} />
            )}
          </TouchableOpacity>

          <Text style={styles.recordHint}>
            {isRecording
              ? isUnderMin
                ? `Keep going — ${minDuration - elapsed}s minimum`
                : 'Recording... tap to stop'
              : 'Tap to start recording'}
          </Text>
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.tipsContainer}>
          <View style={styles.tipRow}>
            <Icon name="sparkles" size={14} color={colors.accent} />
            <Text style={styles.tipText}>
              Introduce yourself in {minDuration}–{maxDuration} seconds
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="check-circle" size={14} color={colors.accent} />
            <Text style={styles.tipText}>
              Share your interests and what you enjoy on dates
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  labelError: {
    color: colors.error,
  },
  recordArea: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.black,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  recordAreaError: {
    borderColor: colors.error,
  },
  durationBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.black,
  },
  durationText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },
  timerText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.xl,
    color: colors.text,
    letterSpacing: 2,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  minMarker: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 12,
    backgroundColor: colors.accentDark,
    borderRadius: borderRadius.full,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonPink,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.white,
  },
  recordHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  recordedContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.black,
    marginBottom: spacing.sm,
  },
  successBadge: {
    marginBottom: spacing.xs,
  },
  successTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  successSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: touchTargets.minimum,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.black,
    marginTop: spacing.xs,
  },
  retakeButtonText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  tipsContainer: {
    gap: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tipText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    flex: 1,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
  },
});

export default VideoRecorder;
