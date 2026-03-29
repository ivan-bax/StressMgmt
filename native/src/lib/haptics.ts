import * as Haptics from 'expo-haptics';

export function phaseStart(action: string) {
  const a = action.toLowerCase();
  if (a.includes('in')) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else if (a.includes('out') || a.includes('exhale')) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } else if (a.includes('hold')) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function count(action: string) {
  const a = action.toLowerCase();
  if (a.includes('hold')) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
