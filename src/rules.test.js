import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import {
  ATTRIBUTE_POINT_CAP,
  chooseCharacterForPartyCheck,
  clampSkillPointsToBudget,
  createCharacter,
  ensureCharacterId,
  getAbilityModifier,
  getAttributeTotal,
  getSkillPointBudget,
  getSkillTotal,
  getSpentSkillPoints,
  isSkillCheckSuccess,
  meetsClassMinimums,
  nextAttributes,
  nextSkillPoints,
  parseDifficultyClass,
  rollDie,
} from './rules';

function attributesWith(overrides) {
  return ATTRIBUTE_LIST.reduce((attributes, name) => {
    attributes[name] = overrides[name] ?? 0;
    return attributes;
  }, {});
}

function characterWith({ attributes = {}, skillPoints = {} } = {}) {
  const character = createCharacter();
  return {
    ...character,
    attributes: { ...character.attributes, ...attributes },
    skillPoints: { ...character.skillPoints, ...skillPoints },
  };
}

describe('getAbilityModifier', () => {
  // README §3: "+1 for every 2 points above 10" (negative below 10).
  // Example: 12 → +1, 14 → +2, 7 → -2.
  test('matches the README examples', () => {
    expect(getAbilityModifier(12)).toBe(1);
    expect(getAbilityModifier(14)).toBe(2);
    expect(getAbilityModifier(7)).toBe(-2);
  });

  test('is 0 at the baseline of 10 and for 11 (only one point above 10)', () => {
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
  });
});

describe('getSkillPointBudget', () => {
  // README §4: "10 + (4 * Intelligence Modifier)"
  test('is 10 when Intelligence modifier is 0', () => {
    expect(getSkillPointBudget(10)).toBe(10);
  });

  test('scales by 4 times the Intelligence modifier and never goes below 0', () => {
    expect(getSkillPointBudget(14)).toBe(18);
    expect(getSkillPointBudget(7)).toBe(2);
    expect(getSkillPointBudget(0)).toBe(0);
  });
});

describe('getSkillTotal', () => {
  // README §4: "Total skill value = points spent + related attribute modifier."
  test('adds spent points to the related attribute modifier', () => {
    const character = characterWith({
      attributes: { Dexterity: 14 },
      skillPoints: { Acrobatics: 3 },
    });
    expect(getSkillTotal(character, 'Acrobatics')).toBe(5);
  });

  test('returns 0 for an unknown skill', () => {
    expect(getSkillTotal(createCharacter(), 'Not A Skill')).toBe(0);
  });
});

describe('meetsClassMinimums', () => {
  test('is true when every attribute is at least the class minimum', () => {
    expect(meetsClassMinimums(CLASS_LIST.Barbarian, CLASS_LIST.Barbarian)).toBe(true);
  });

  test('is false when any attribute is below the minimum', () => {
    const almost = { ...CLASS_LIST.Barbarian, Strength: 13 };
    expect(meetsClassMinimums(almost, CLASS_LIST.Barbarian)).toBe(false);
  });
});

describe('nextAttributes', () => {
  test('increments and decrements one attribute independently', () => {
    const start = attributesWith({ Strength: 5, Dexterity: 3 });
    expect(nextAttributes(start, 'Strength', 1).Strength).toBe(6);
    expect(nextAttributes(start, 'Strength', 1).Dexterity).toBe(3);
    expect(nextAttributes(start, 'Dexterity', -1).Dexterity).toBe(2);
  });

  test('does not decrement below 0', () => {
    const start = attributesWith({ Strength: 0 });
    expect(nextAttributes(start, 'Strength', -1)).toBe(start);
  });

  test('prevents incrementing when the six attributes already sum to 70', () => {
    const atCap = attributesWith({
      Strength: 20,
      Dexterity: 10,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    });
    expect(getAttributeTotal(atCap)).toBe(ATTRIBUTE_POINT_CAP);
    expect(nextAttributes(atCap, 'Strength', 1)).toBe(atCap);
    expect(nextAttributes(atCap, 'Strength', -1).Strength).toBe(19);
  });
});

describe('nextSkillPoints', () => {
  const empty = SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {});

  test('does not go below 0', () => {
    expect(nextSkillPoints(empty, 'Acrobatics', -1, 10)).toBe(empty);
  });

  test('does not spend more than the Intelligence-based budget', () => {
    const spent = { ...empty, Acrobatics: 10 };
    expect(getSpentSkillPoints(spent)).toBe(10);
    expect(nextSkillPoints(spent, 'Athletics', 1, 10)).toBe(spent);
    expect(nextSkillPoints(empty, 'Acrobatics', 1, 10).Acrobatics).toBe(1);
  });

  test('clamps spent points when the budget shrinks', () => {
    const spent = { ...empty, Acrobatics: 8, Athletics: 2 };
    const clamped = clampSkillPointsToBudget(spent, 10);
    expect(getSpentSkillPoints(clamped)).toBe(10);
    const reduced = clampSkillPointsToBudget(spent, 0);
    expect(getSpentSkillPoints(reduced)).toBe(0);
  });
});

describe('skill check', () => {
  test('succeeds when roll + skill total is at least DC', () => {
    expect(isSkillCheckSuccess(15, 5, 20)).toBe(true);
    expect(isSkillCheckSuccess(15, 4, 20)).toBe(false);
  });

  test('rejects an empty DC', () => {
    expect(parseDifficultyClass('')).toBeNull();
    expect(parseDifficultyClass('12')).toBe(12);
  });

  test('rollDie is inclusive 1–20', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0);
    expect(rollDie()).toBe(1);
    Math.random.mockReturnValueOnce(0.999);
    expect(rollDie()).toBe(20);
    Math.random.mockRestore();
  });
});

describe('chooseCharacterForPartyCheck', () => {
  test('returns null when there are no characters', () => {
    expect(chooseCharacterForPartyCheck([], 'Acrobatics')).toBeNull();
  });

  test('picks the character with the highest skill total', () => {
    const low = characterWith({
      attributes: { Dexterity: 10 },
      skillPoints: { Acrobatics: 1 },
    });
    const high = characterWith({
      attributes: { Dexterity: 14 },
      skillPoints: { Acrobatics: 3 },
    });
    expect(chooseCharacterForPartyCheck([low, high], 'Acrobatics')).toEqual({
      characterIndex: 1,
      skillTotal: 5,
    });
  });

  test('keeps the first character on a tie', () => {
    const first = characterWith({
      attributes: { Dexterity: 12 },
      skillPoints: { Acrobatics: 2 },
    });
    const second = characterWith({
      attributes: { Dexterity: 12 },
      skillPoints: { Acrobatics: 2 },
    });
    expect(chooseCharacterForPartyCheck([first, second], 'Acrobatics').characterIndex).toBe(0);
  });
});

describe('createCharacter', () => {
  test('starts every ATTRIBUTE_LIST entry at 10 and each skill at 0', () => {
    const character = createCharacter();
    ATTRIBUTE_LIST.forEach((name) => {
      expect(character.attributes[name]).toBe(10);
    });
    SKILL_LIST.forEach((skill) => {
      expect(character.skillPoints[skill.name]).toBe(0);
    });
    expect(character.selectedClass).toBeNull();
    expect(character.id).toEqual(expect.any(String));
  });

  test('ensureCharacterId keeps an existing id', () => {
    const character = { id: 'kept', attributes: {}, skillPoints: {}, selectedClass: null };
    expect(ensureCharacterId(character).id).toBe('kept');
  });
});
