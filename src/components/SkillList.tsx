import { SKILL_LIST } from '../consts';
import {
  getAbilityModifier,
  getSkillPointBudget,
  getSkillTotal,
  getSpentSkillPoints,
} from '../rules';
import type { Attributes, Character } from '../types';

type SkillListProps = {
  character: Character;
  onAdjust: (skillName: string, delta: number) => void;
};

function SkillList({ character, onAdjust }: SkillListProps) {
  return (
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
              <button type="button" className="stepper" onClick={() => onAdjust(skill.name, 1)}>+</button>
              <button type="button" className="stepper" onClick={() => onAdjust(skill.name, -1)}>-</button>
            </span>
            <span className="modifier">modifier ({relatedAttribute}): {attributeModifier}</span>
            <span className="skill-total">total: {total}</span>
          </div>
        );
      })}
    </section>
  );
}

export default SkillList;
