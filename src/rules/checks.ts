import type { Character } from '../types';
import { SKILL_CHECK_DIE_SIDES } from './constants';
import { getSkillTotal } from './skills';

export function rollDie(sides = SKILL_CHECK_DIE_SIDES): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function isSkillCheckSuccess(
  roll: number,
  skillTotal: number,
  difficultyClass: number,
): boolean {
  return roll + skillTotal >= difficultyClass;
}

export function parseDifficultyClass(raw: string): number | null {
  if (raw.trim() === '') {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return null;
  }
  return value;
}

export function chooseCharacterForPartyCheck(
  characters: Character[],
  skillName: string,
): { characterIndex: number; skillTotal: number } | null {
  if (characters.length === 0) {
    return null;
  }
  let characterIndex = 0;
  let skillTotal = getSkillTotal(characters[0], skillName);
  for (let i = 1; i < characters.length; i += 1) {
    const total = getSkillTotal(characters[i], skillName);
    if (total > skillTotal) {
      skillTotal = total;
      characterIndex = i;
    }
  }
  return { characterIndex, skillTotal };
}
