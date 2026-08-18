import { useState } from 'react';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import {
  getAbilityModifier,
  getSkillPointBudget,
  getSkillTotal,
  getSpentSkillPoints,
  isSkillCheckSuccess,
  meetsClassMinimums,
  nextAttributes,
  nextSkillPoints,
  rollDie,
} from './rules';
import type { Attributes, Character, Class } from './types';

type CharacterSheetProps = {
  characterLabel: string;
  character: Character;
  onChange: (updater: (previous: Character) => Character) => void;
};

function CharacterSheet({ characterLabel, character, onChange }: CharacterSheetProps) {
  const [selectedSkillName, setSelectedSkillName] = useState(SKILL_LIST[0].name);
  const [difficultyClass, setDifficultyClass] = useState('');
  const [skillCheckResult, setSkillCheckResult] = useState<{
    roll: number;
    skillTotal: number;
    difficultyClass: number;
    success: boolean;
  } | null>(null);

  const adjustAttribute = (name: keyof Attributes, delta: number) => {
    onChange((previous) => {
      const attributes = nextAttributes(previous.attributes, name, delta);
      if (attributes === previous.attributes) {
        return previous;
      }
      return { ...previous, attributes };
    });
  };

  const adjustSkill = (name: string, delta: number) => {
    onChange((previous) => {
      const skillPoints = nextSkillPoints(
        previous.skillPoints,
        name,
        delta,
        previous.attributes.Intelligence,
      );
      if (skillPoints === previous.skillPoints) {
        return previous;
      }
      return { ...previous, skillPoints };
    });
  };

  const rollSkillCheck = () => {
    const difficultyClassValue = Number(difficultyClass);
    const roll = rollDie();
    const skillTotal = getSkillTotal(character, selectedSkillName);
    setSkillCheckResult({
      roll,
      skillTotal,
      difficultyClass: difficultyClassValue,
      success: isSkillCheckSuccess(roll, skillTotal, difficultyClassValue),
    });
  };

  const { selectedClass } = character;

  return (
    <div>
      <h2>{characterLabel}</h2>
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
              onClick={() => onChange((previous) => ({ ...previous, selectedClass: className }))}
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
        (spent: {getSpentSkillPoints(character.skillPoints)})
        {SKILL_LIST.map((skill) => {
          const relatedAttribute = skill.attributeModifier as keyof Attributes;
          const points = character.skillPoints[skill.name];
          const attributeModifier = getAbilityModifier(character.attributes[relatedAttribute]);
          const total = getSkillTotal(character, skill.name);
          return (
            <div key={skill.name}>
              {skill.name} - points: {points}{' '}
              <button type="button" onClick={() => adjustSkill(skill.name, 1)}>+</button>{' '}
              <button type="button" onClick={() => adjustSkill(skill.name, -1)}>-</button>
              {' | '}modifier ({relatedAttribute}): {attributeModifier}{' | '}total: {total}
            </div>
          );
        })}
      </div>

      <div>
        <div>Skill Check</div>
        <select
          value={selectedSkillName}
          onChange={(event) => setSelectedSkillName(event.target.value)}
        >
          {SKILL_LIST.map((skill) => (
            <option key={skill.name} value={skill.name}>
              {skill.name}
            </option>
          ))}
        </select>
        <label>
          DC{' '}
          <input
            type="number"
            value={difficultyClass}
            onChange={(event) => setDifficultyClass(event.target.value)}
          />
        </label>
        <button type="button" onClick={rollSkillCheck}>Roll</button>
        {skillCheckResult && (
          <div>
            Roll: {skillCheckResult.roll} | skill total: {skillCheckResult.skillTotal}{' '}
            | DC: {skillCheckResult.difficultyClass}{' '}
            | {skillCheckResult.success ? 'Success' : 'Failure'}
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterSheet;
