import { ATTRIBUTE_LIST, SKILL_LIST } from '../consts';
import type { Attributes, Character, Class } from '../types';
import { nextAttributes } from './attributes';
import { INITIAL_ATTRIBUTE_SCORE } from './constants';
import { clampSkillPointsToBudget } from './skills';

function initialAttributes(): Attributes {
  return ATTRIBUTE_LIST.reduce((attributes, name) => {
    attributes[name as keyof Attributes] = INITIAL_ATTRIBUTE_SCORE;
    return attributes;
  }, {} as Attributes);
}

function initialSkillPoints(): Record<string, number> {
  return SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {} as Record<string, number>);
}

let nextCharacterId = 1;

export function createCharacterId(): string {
  const id = `character-${nextCharacterId}`;
  nextCharacterId += 1;
  return id;
}

export function createCharacter(): Character {
  return {
    id: createCharacterId(),
    attributes: initialAttributes(),
    skillPoints: initialSkillPoints(),
    selectedClass: null,
  };
}

export function ensureCharacterId(character: Character): Character {
  if (character.id) {
    return character;
  }
  return { ...character, id: createCharacterId() };
}

export function applyAttributeChange(
  character: Character,
  name: keyof Attributes,
  delta: number,
): Character {
  const attributes = nextAttributes(character.attributes, name, delta);
  if (attributes === character.attributes) {
    return character;
  }
  return {
    ...character,
    attributes,
    skillPoints: clampSkillPointsToBudget(character.skillPoints, attributes.Intelligence),
  };
}

export function isValidCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Partial<Character>;
  if (!record.attributes || !record.skillPoints) {
    return false;
  }
  const hasAllAttributes = ATTRIBUTE_LIST.every(
    (name) => typeof record.attributes?.[name as keyof Attributes] === 'number',
  );
  if (!hasAllAttributes) {
    return false;
  }
  const selected = record.selectedClass;
  const selectedOk =
    selected === null ||
    selected === undefined ||
    selected === 'Barbarian' ||
    selected === 'Wizard' ||
    selected === 'Bard';
  return selectedOk;
}

export function normalizeCharacter(value: Character): Character {
  return ensureCharacterId({
    ...value,
    selectedClass: (value.selectedClass ?? null) as Class | null,
    skillPoints: { ...initialSkillPoints(), ...value.skillPoints },
  });
}
