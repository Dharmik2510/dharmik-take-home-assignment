import { useEffect, useState } from 'react';
import './App.css';
import CharacterSheet, { createCharacter, getSkillTotal } from './CharacterSheet';
import { SKILL_LIST } from './consts.js';
import type { Character } from './types';

// README §5: POST/GET https://recruiting.verylongdomaintotestwith.ca/api/{{github_username}}/character
// Example: include the curly braces — /api/{mjohnston}/character
const CHARACTER_API_URL =
  'https://recruiting.verylongdomaintotestwith.ca/api/{dharmiksoni}/character';

function App() {
  const [characters, setCharacters] = useState<Character[]>(() => [createCharacter()]);
  const [partySkill, setPartySkill] = useState(SKILL_LIST[0].name);
  const [partyDc, setPartyDc] = useState('');
  const [partyResult, setPartyResult] = useState<{
    characterIndex: number;
    roll: number;
    skillTotal: number;
    dc: number;
    success: boolean;
  } | null>(null);

  // README §5: retrieve character(s) when the app starts next time (GET).
  useEffect(() => {
    fetch(CHARACTER_API_URL)
      .then((response) => response.json())
      .then((data) => {
        const saved = data.body;
        if (Array.isArray(saved?.characters)) {
          setCharacters(saved.characters);
        } else if (saved?.attributes && saved?.skillPoints) {
          // Payload from before multiple characters existed.
          setCharacters([
            {
              attributes: saved.attributes,
              skillPoints: saved.skillPoints,
              selectedClass: null,
            },
          ]);
        }
      })
      .catch(() => {
        // Keep defaults if nothing is saved yet or the request fails.
      });
  }, []);

  const updateCharacter = (index: number, next: Character) => {
    setCharacters((prev) => prev.map((character, i) => (i === index ? next : character)));
  };

  // README §7: support editing multiple characters at once.
  const addCharacter = () => {
    setCharacters((prev) => [...prev, createCharacter()]);
  };

  // README §5: Saving is POST with Content-Type: application/json.
  const saveCharacters = () => {
    fetch(CHARACTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characters }),
    }).catch(() => {
      // README does not specify error UI.
    });
  };

  // README §9: the character with the highest total in the chosen skill attempts the action.
  // Ties: README does not specify; keep the first character that has that highest total.
  const rollPartySkillCheck = () => {
    let chosenIndex = 0;
    let highestTotal = getSkillTotal(characters[0], partySkill);
    for (let i = 1; i < characters.length; i += 1) {
      const total = getSkillTotal(characters[i], partySkill);
      if (total > highestTotal) {
        highestTotal = total;
        chosenIndex = i;
      }
    }
    const roll = Math.floor(Math.random() * 20) + 1;
    const dcValue = Number(partyDc);
    setPartyResult({
      characterIndex: chosenIndex,
      roll,
      skillTotal: highestTotal,
      dc: dcValue,
      success: roll + highestTotal >= dcValue,
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <button type="button" onClick={saveCharacters}>Save</button>
        <button type="button" onClick={addCharacter}>Add Character</button>
        <div>
          <div>Party Skill Check</div>
          <select value={partySkill} onChange={(event) => setPartySkill(event.target.value)}>
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
              value={partyDc}
              onChange={(event) => setPartyDc(event.target.value)}
            />
          </label>
          <button type="button" onClick={rollPartySkillCheck}>Roll</button>
          {partyResult && (
            <div>
              Character {partyResult.characterIndex + 1} was chosen | Roll: {partyResult.roll}{' '}
              | skill total: {partyResult.skillTotal} | DC: {partyResult.dc}{' '}
              | {partyResult.success ? 'Success' : 'Failure'}
            </div>
          )}
        </div>
        {characters.map((character, index) => (
          <CharacterSheet
            key={index}
            title={`Character ${index + 1}`}
            character={character}
            onChange={(next) => updateCharacter(index, next)}
          />
        ))}
      </section>
    </div>
  );
}

export default App;
