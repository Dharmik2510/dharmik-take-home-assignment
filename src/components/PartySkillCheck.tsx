import { useState } from 'react';
import { SKILL_LIST } from '../consts';
import {
  chooseCharacterForPartyCheck,
  isSkillCheckSuccess,
  parseDifficultyClass,
  rollDie,
} from '../rules';
import type { Character } from '../types';

type PartySkillCheckProps = {
  characters: Character[];
};

function PartySkillCheck({ characters }: PartySkillCheckProps) {
  const [partySkill, setPartySkill] = useState(SKILL_LIST[0].name);
  const [partyDifficultyClass, setPartyDifficultyClass] = useState('');
  const [partyResult, setPartyResult] = useState<{
    characterIndex: number;
    roll: number;
    skillTotal: number;
    difficultyClass: number;
    success: boolean;
  } | null>(null);

  const parsedDc = parseDifficultyClass(partyDifficultyClass);

  const rollPartySkillCheck = () => {
    if (parsedDc === null) {
      return;
    }
    const chosen = chooseCharacterForPartyCheck(characters, partySkill);
    if (!chosen) {
      return;
    }
    const roll = rollDie();
    setPartyResult({
      characterIndex: chosen.characterIndex,
      roll,
      skillTotal: chosen.skillTotal,
      difficultyClass: parsedDc,
      success: isSkillCheckSuccess(roll, chosen.skillTotal, parsedDc),
    });
  };

  return (
    <div className="card">
      <div className="card-title">Party Skill Check</div>
      <div className="check-row">
        <select
          className="control"
          value={partySkill}
          onChange={(event) => setPartySkill(event.target.value)}
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
            value={partyDifficultyClass}
            onChange={(event) => setPartyDifficultyClass(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          onClick={rollPartySkillCheck}
          disabled={parsedDc === null || characters.length === 0}
        >
          Roll
        </button>
      </div>
      {partyResult && (
        <div className={`check-result ${partyResult.success ? 'is-success' : 'is-failure'}`}>
          Character {partyResult.characterIndex + 1} was chosen | Roll: {partyResult.roll}{' '}
          | skill total: {partyResult.skillTotal} | DC: {partyResult.difficultyClass}{' '}
          | {partyResult.success ? 'Success' : 'Failure'}
        </div>
      )}
    </div>
  );
}

export default PartySkillCheck;
