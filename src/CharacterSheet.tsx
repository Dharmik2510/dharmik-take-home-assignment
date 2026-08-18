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
    <div className="character-card">
      <h2>{characterLabel}</h2>

      <section>
        <h3 className="panel-title">Attributes</h3>
        <div className="attribute-list">
          {ATTRIBUTE_LIST.map((name) => {
            const key = name as keyof Attributes;
            return (
              <div className="attribute-row" key={key}>
                <span className="attr-name">{key}: {character.attributes[key]}</span>
                <span className="modifier">(modifier: {getAbilityModifier(character.attributes[key])})</span>
                <span className="stepper-group">
                  <button type="button" className="stepper" onClick={() => adjustAttribute(key, 1)}>+</button>
                  <button type="button" className="stepper" onClick={() => adjustAttribute(key, -1)}>-</button>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="panel-title">Classes</h3>
        <div className="class-row">
          {(Object.keys(CLASS_LIST) as Class[]).map((className) => {
            const meetsMinimums = meetsClassMinimums(character.attributes, CLASS_LIST[className]);
            const isSelected = selectedClass === className;
            return (
              <button
                key={className}
                type="button"
                className={`class-button${meetsMinimums ? ' is-met' : ''}${isSelected ? ' is-selected' : ''}`}
                onClick={() => onChange((previous) => ({ ...previous, selectedClass: className }))}
                style={{ fontWeight: meetsMinimums ? 'bold' : 'normal' }}
              >
                {className}
              </button>
            );
          })}
        </div>

        {selectedClass && (
          <div className="requirements">
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
      </section>

      <section>
        <h3 className="panel-title">Skills</h3>
        <div className="budget">
          Points to distribute: {getSkillPointBudget(character.attributes.Intelligence)}{' '}
          (spent: {getSpentSkillPoints(character.skillPoints)})
        </div>
        {SKILL_LIST.map((skill) => {
          const relatedAttribute = skill.attributeModifier as keyof Attributes;
          const points = character.skillPoints[skill.name];
          const attributeModifier = getAbilityModifier(character.attributes[relatedAttribute]);
          const total = getSkillTotal(character, skill.name);
          return (
            <div className="skill-row" key={skill.name}>
              <span className="skill-name">{skill.name} - points: {points}</span>
              <span className="stepper-group">
                <button type="button" className="stepper" onClick={() => adjustSkill(skill.name, 1)}>+</button>
                <button type="button" className="stepper" onClick={() => adjustSkill(skill.name, -1)}>-</button>
              </span>
              <span className="modifier">modifier ({relatedAttribute}): {attributeModifier}</span>
              <span className="skill-total">total: {total}</span>
            </div>
          );
        })}
      </section>

      <section className="card">
        <div className="card-title">Skill Check</div>
        <div className="check-row">
          <select
            className="control"
            value={selectedSkillName}
            onChange={(event) => setSelectedSkillName(event.target.value)}
          >
            {SKILL_LIST.map((skill) => (
              <option key={skill.name} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </select>
          <label className="field">
            DC{' '}
            <input
              type="number"
              value={difficultyClass}
              onChange={(event) => setDifficultyClass(event.target.value)}
            />
          </label>
          <button type="button" className="btn btn-primary" onClick={rollSkillCheck}>Roll</button>
        </div>
        {skillCheckResult && (
          <div className={`check-result ${skillCheckResult.success ? 'is-success' : 'is-failure'}`}>
            Roll: {skillCheckResult.roll} | skill total: {skillCheckResult.skillTotal}{' '}
            | DC: {skillCheckResult.difficultyClass}{' '}
            | {skillCheckResult.success ? 'Success' : 'Failure'}
          </div>
        )}
      </section>
    </div>
  );
}

export default CharacterSheet;
