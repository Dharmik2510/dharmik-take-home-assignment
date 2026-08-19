import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from '../consts';
import type { Attributes, Class } from '../types';
import {
  BASE_SKILL_POINTS,
  SKILL_POINTS_PER_INTELLIGENCE_MODIFIER,
} from './constants';
import { getAbilityModifier } from './modifiers';

export function meetsClassMinimums(attributes: Attributes, minimums: Attributes): boolean {
  return ATTRIBUTE_LIST.every((name) => {
    const key = name as keyof Attributes;
    return attributes[key] >= minimums[key];
  });
}

export function getClassNames(): Class[] {
  return Object.keys(CLASS_LIST) as Class[];
}

export function getSkillPointBudget(intelligenceScore: number): number {
  const raw =
    BASE_SKILL_POINTS +
    SKILL_POINTS_PER_INTELLIGENCE_MODIFIER * getAbilityModifier(intelligenceScore);
  return Math.max(0, raw);
}

export function getSpentSkillPoints(skillPoints: Record<string, number>): number {
  return Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
}

export function getSkillTotal(
  character: { attributes: Attributes; skillPoints: Record<string, number> },
  skillName: string,
): number {
  const skill = SKILL_LIST.find((entry) => entry.name === skillName);
  if (!skill) {
    return 0;
  }
  const attribute = skill.attributeModifier as keyof Attributes;
  const points = character.skillPoints[skillName] ?? 0;
  return points + getAbilityModifier(character.attributes[attribute]);
}

export function nextSkillPoints(
  skillPoints: Record<string, number>,
  skillName: string,
  delta: number,
  intelligenceScore: number,
): Record<string, number> {
  const nextValue = (skillPoints[skillName] ?? 0) + delta;
  if (nextValue < 0) {
    return skillPoints;
  }
  const updated = { ...skillPoints, [skillName]: nextValue };
  if (getSpentSkillPoints(updated) > getSkillPointBudget(intelligenceScore)) {
    return skillPoints;
  }
  return updated;
}

export function clampSkillPointsToBudget(
  skillPoints: Record<string, number>,
  intelligenceScore: number,
): Record<string, number> {
  const budget = getSkillPointBudget(intelligenceScore);
  const next = { ...skillPoints };
  const names = [...SKILL_LIST.map((skill) => skill.name)].reverse();
  while (getSpentSkillPoints(next) > budget) {
    const skillWithPoints = names.find((name) => (next[name] ?? 0) > 0);
    if (!skillWithPoints) {
      break;
    }
    next[skillWithPoints] -= 1;
  }
  return next;
}
