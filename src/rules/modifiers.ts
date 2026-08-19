import { MODIFIER_BASELINE, POINTS_PER_MODIFIER } from './constants';

export function getAbilityModifier(score: number): number {
  return Math.floor((score - MODIFIER_BASELINE) / POINTS_PER_MODIFIER);
}
