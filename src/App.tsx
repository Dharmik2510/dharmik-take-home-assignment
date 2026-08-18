import { useEffect, useState } from 'react';
import './App.css';
import CharacterSheet from './CharacterSheet';
import { SKILL_LIST } from './consts';
import {
  chooseCharacterForPartyCheck,
  createCharacter,
  ensureCharacterId,
  isSkillCheckSuccess,
  rollDie,
} from './rules';
import type { Character } from './types';

// README §5: POST/GET .../api/{{github_username}}/character — include the curly braces
const GITHUB_USERNAME = 'dharmiksoni';
const CHARACTER_API_URL =
  `https://recruiting.verylongdomaintotestwith.ca/api/{${GITHUB_USERNAME}}/character`;

function App() {
  const [characters, setCharacters] = useState<Character[]>(() => [createCharacter()]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [partySkill, setPartySkill] = useState(SKILL_LIST[0].name);
  const [partyDifficultyClass, setPartyDifficultyClass] = useState('');
  const [partyResult, setPartyResult] = useState<{
    characterIndex: number;
    roll: number;
    skillTotal: number;
    difficultyClass: number;
    success: boolean;
  } | null>(null);

  useEffect(() => {
    fetch(CHARACTER_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load characters');
        }
        return response.json();
      })
      .then((data) => {
        const saved = data.body;
        if (Array.isArray(saved?.characters)) {
          setCharacters(saved.characters.map(ensureCharacterId));
        } else if (saved?.attributes && saved?.skillPoints) {
          setCharacters([
            ensureCharacterId({
              attributes: saved.attributes,
              skillPoints: saved.skillPoints,
              selectedClass: null,
            }),
          ]);
        }
      })
      .catch(() => {
        setLoadError('Could not load saved characters.');
      });
  }, []);

  const updateCharacter = (
    index: number,
    updater: (previous: Character) => Character,
  ) => {
    setCharacters((previous) =>
      previous.map((character, characterIndex) =>
        characterIndex === index ? updater(character) : character,
      ),
    );
  };

  const addCharacter = () => {
    setCharacters((previous) => [...previous, createCharacter()]);
  };

  const saveCharacters = () => {
    setSaveError(null);
    fetch(CHARACTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characters }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save characters');
        }
      })
      .catch(() => {
        setSaveError('Could not save characters.');
      });
  };

  const rollPartySkillCheck = () => {
    const chosen = chooseCharacterForPartyCheck(characters, partySkill);
    if (!chosen) {
      return;
    }
    const roll = rollDie();
    const difficultyClassValue = Number(partyDifficultyClass);
    setPartyResult({
      characterIndex: chosen.characterIndex,
      roll,
      skillTotal: chosen.skillTotal,
      difficultyClass: difficultyClassValue,
      success: isSkillCheckSuccess(roll, chosen.skillTotal, difficultyClassValue),
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <div className="toolbar">
          <button type="button" className="btn btn-primary" onClick={saveCharacters}>Save</button>
          <button type="button" className="btn btn-secondary" onClick={addCharacter}>Add Character</button>
        </div>
        {loadError && <div className="status-error">{loadError}</div>}
        {saveError && <div className="status-error">{saveError}</div>}
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
            <button type="button" className="btn btn-primary" onClick={rollPartySkillCheck}>Roll</button>
          </div>
          {partyResult && (
            <div className={`check-result ${partyResult.success ? 'is-success' : 'is-failure'}`}>
              Character {partyResult.characterIndex + 1} was chosen | Roll: {partyResult.roll}{' '}
              | skill total: {partyResult.skillTotal} | DC: {partyResult.difficultyClass}{' '}
              | {partyResult.success ? 'Success' : 'Failure'}
            </div>
          )}
        </div>
        <div className="character-list">
          {characters.map((character, index) => (
            <CharacterSheet
              key={character.id ?? index}
              characterLabel={`Character ${index + 1}`}
              character={character}
              onChange={(updater) => updateCharacter(index, updater)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
