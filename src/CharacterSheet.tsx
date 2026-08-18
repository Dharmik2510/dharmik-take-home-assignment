import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';
import type { Attributes, Character, Class } from './types';

// README §1: "Create state and controls for each of the 6 attributes (`ATTRIBUTE_LIST`)."
function initialAttributes(): Attributes {
  return ATTRIBUTE_LIST.reduce((attrs, name) => {
    attrs[name as keyof Attributes] = 0;
    return attrs;
  }, {} as Attributes);
}

function initialSkillPoints(): Record<string, number> {
  return SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {} as Record<string, number>);
}

export function createCharacter(): Character {
  return {
    attributes: initialAttributes(),
    skillPoints: initialSkillPoints(),
    selectedClass: null,
  };
}

// README §2: "Visually indicate when the character meets a class’s minimum requirements."
function meetsClassMinimums(attributes: Attributes, minimums: Attributes): boolean {
  return ATTRIBUTE_LIST.every((name) => {
    const key = name as keyof Attributes;
    return attributes[key] >= minimums[key];
  });
}

// README §3: "+1 for every 2 points above 10" (negative below 10).
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// README §4: "Characters start with `10 + (4 * Intelligence Modifier)` points to distribute."
function getSkillPointBudget(intelligenceScore: number): number {
  return 10 + 4 * getAbilityModifier(intelligenceScore);
}

type CharacterSheetProps = {
  title: string;
  character: Character;
  onChange: (next: Character) => void;
};

function CharacterSheet({ title, character, onChange }: CharacterSheetProps) {
  // README §6: total across all 6 must not exceed 70; prevent incrementing at the cap.
  const adjustAttribute = (name: keyof Attributes, delta: number) => {
    if (delta > 0) {
      const total = ATTRIBUTE_LIST.reduce(
        (sum, attrName) => sum + character.attributes[attrName as keyof Attributes],
        0,
      );
      if (total >= 70) {
        return;
      }
    }
    onChange({
      ...character,
      attributes: {
        ...character.attributes,
        [name]: character.attributes[name] + delta,
      },
    });
  };

  // README §4: min 0 per skill; no max except total available points.
  const adjustSkill = (name: string, delta: number) => {
    const nextValue = character.skillPoints[name] + delta;
    if (nextValue < 0) {
      return;
    }
    const nextSpent = Object.values({ ...character.skillPoints, [name]: nextValue }).reduce(
      (sum, n) => sum + n,
      0,
    );
    if (nextSpent > getSkillPointBudget(character.attributes.Intelligence)) {
      return;
    }
    onChange({
      ...character,
      skillPoints: { ...character.skillPoints, [name]: nextValue },
    });
  };

  const { selectedClass } = character;

  return (
    <div>
      <h2>{title}</h2>
      {ATTRIBUTE_LIST.map((name) => {
        const key = name as keyof Attributes;
        return (
          <div key={key}>
            {key}: {character.attributes[key]}{' '}
            (modifier: {getAbilityModifier(character.attributes[key])}){' '}
            <button type="button" onClick={() => adjustAttribute(key, 1)}>+</button>
            <button type="button" onClick={() => adjustAttribute(key, -1)}>-</button>
          </div>
        );
      })}

      <div>
        {(Object.keys(CLASS_LIST) as Class[]).map((className) => {
          const meetsMinimums = meetsClassMinimums(character.attributes, CLASS_LIST[className]);
          return (
            <button
              key={className}
              type="button"
              onClick={() => onChange({ ...character, selectedClass: className })}
              style={{ fontWeight: meetsMinimums ? 'bold' : 'normal' }}
            >
              {className}
            </button>
          );
        })}
      </div>

      {selectedClass && (
        <div>
          {selectedClass} minimum requirements:
          {ATTRIBUTE_LIST.map((name) => {
            const key = name as keyof Attributes;
            return (
              <div key={key}>
                {key}: {CLASS_LIST[selectedClass][key]}
              </div>
            );
          })}
        </div>
      )}

      <div>
        Points to distribute: {getSkillPointBudget(character.attributes.Intelligence)}{' '}
        (spent: {Object.values(character.skillPoints).reduce((sum, n) => sum + n, 0)})
        {SKILL_LIST.map((skill) => {
          const attribute = skill.attributeModifier as keyof Attributes;
          const points = character.skillPoints[skill.name];
          const modifier = getAbilityModifier(character.attributes[attribute]);
          const total = points + modifier;
          return (
            <div key={skill.name}>
              {skill.name} - points: {points}{' '}
              <button type="button" onClick={() => adjustSkill(skill.name, 1)}>+</button>{' '}
              <button type="button" onClick={() => adjustSkill(skill.name, -1)}>-</button>
              {' | '}modifier ({attribute}): {modifier}{' | '}total: {total}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CharacterSheet;
