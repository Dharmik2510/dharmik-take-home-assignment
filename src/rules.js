import { ATTRIBUTE_LIST, SKILL_LIST } from './consts';

// README §3: "+1 for every 2 points above 10"
export const MODIFIER_BASELINE = 10;
export const POINTS_PER_MODIFIER = 2;

// README §4: "10 + (4 * Intelligence Modifier)"
export const BASE_SKILL_POINTS = 10;
export const SKILL_POINTS_PER_INTELLIGENCE_MODIFIER = 4;

// README §6: total across all 6 must not exceed 70
export const ATTRIBUTE_POINT_CAP = 70;

// README §8: random number 1–20
export const SKILL_CHECK_DIE_SIDES = 20;

export function getAbilityModifier(score) {
  return Math.floor((score - MODIFIER_BASELINE) / POINTS_PER_MODIFIER);
}

export function getSkillPointBudget(intelligenceScore) {
  return (
    BASE_SKILL_POINTS +
    SKILL_POINTS_PER_INTELLIGENCE_MODIFIER * getAbilityModifier(intelligenceScore)
  );
}

export function getSpentSkillPoints(skillPoints) {
  return Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
}

export function getSkillTotal(character, skillName) {
  const skill = SKILL_LIST.find((entry) => entry.name === skillName);
  if (!skill) {
    return 0;
  }
  const points = character.skillPoints[skillName] ?? 0;
  return points + getAbilityModifier(character.attributes[skill.attributeModifier]);
}

export function meetsClassMinimums(attributes, minimums) {
  return ATTRIBUTE_LIST.every((name) => attributes[name] >= minimums[name]);
}

export function getAttributeTotal(attributes) {
  return ATTRIBUTE_LIST.reduce((sum, name) => sum + attributes[name], 0);
}

export function nextAttributes(attributes, name, delta) {
  if (delta > 0 && getAttributeTotal(attributes) >= ATTRIBUTE_POINT_CAP) {
    return attributes;
  }
  return {
    ...attributes,
    [name]: attributes[name] + delta,
  };
}

export function nextSkillPoints(skillPoints, skillName, delta, intelligenceScore) {
  const nextValue = skillPoints[skillName] + delta;
  if (nextValue < 0) {
    return skillPoints;
  }
  const updated = { ...skillPoints, [skillName]: nextValue };
  if (getSpentSkillPoints(updated) > getSkillPointBudget(intelligenceScore)) {
    return skillPoints;
  }
  return updated;
}

export function rollDie(sides = SKILL_CHECK_DIE_SIDES) {
  return Math.floor(Math.random() * sides) + 1;
}

export function isSkillCheckSuccess(roll, skillTotal, difficultyClass) {
  return roll + skillTotal >= difficultyClass;
}

export function chooseCharacterForPartyCheck(characters, skillName) {
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

function initialAttributes() {
  return ATTRIBUTE_LIST.reduce((attributes, name) => {
    attributes[name] = 0;
    return attributes;
  }, {});
}

function initialSkillPoints() {
  return SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {});
}

let nextCharacterId = 1;

export function createCharacterId() {
  const id = `character-${nextCharacterId}`;
  nextCharacterId += 1;
  return id;
}

/** @returns {import('./types').Character} */
export function createCharacter() {
  return {
    id: createCharacterId(),
    attributes: initialAttributes(),
    skillPoints: initialSkillPoints(),
    selectedClass: null,
  };
}

/**
 * @param {import('./types').Character} character
 * @returns {import('./types').Character}
 */
export function ensureCharacterId(character) {
  if (character.id) {
    return character;
  }
  return { ...character, id: createCharacterId() };
}
