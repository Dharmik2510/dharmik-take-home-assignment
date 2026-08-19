import { useState } from 'react';
import { SKILL_LIST } from '../consts';
import {
  getSkillTotal,
  isSkillCheckSuccess,
  parseDifficultyClass,
  rollDie,
} from '../rules';
import type { Character } from '../types';

type SkillCheckProps = {
  character: Character;
};

function SkillCheck({ character }: SkillCheckProps) {
  const [selectedSkillName, setSelectedSkillName] = useState(SKILL_LIST[0].name);
  const [difficultyClass, setDifficultyClass] = useState('');
  const [skillCheckResult, setSkillCheckResult] = useState<{
    roll: number;
    skillTotal: number;
    difficultyClass: number;
    success: boolean;
  } | null>(null);

  const parsedDc = parseDifficultyClass(difficultyClass);

  const rollSkillCheck = () => {
    if (parsedDc === null) {
      return;
    }
    const roll = rollDie();
    const skillTotal = getSkillTotal(character, selectedSkillName);
    setSkillCheckResult({
      roll,
      skillTotal,
      difficultyClass: parsedDc,
      success: isSkillCheckSuccess(roll, skillTotal, parsedDc),
    });
  };

  return (
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
        <button
          type="button"
          className="btn btn-primary"
          onClick={rollSkillCheck}
          disabled={parsedDc === null}
        >
          Roll
        </button>
      </div>
      {skillCheckResult && (
        <div className={`check-result ${skillCheckResult.success ? 'is-success' : 'is-failure'}`}>
          Roll: {skillCheckResult.roll} | skill total: {skillCheckResult.skillTotal}{' '}
          | DC: {skillCheckResult.difficultyClass}{' '}
          | {skillCheckResult.success ? 'Success' : 'Failure'}
        </div>
      )}
    </section>
  );
}

export default SkillCheck;
