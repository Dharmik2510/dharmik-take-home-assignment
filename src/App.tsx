import { useEffect, useState } from 'react';
import './App.css';
import CharacterSheet, { createCharacter } from './CharacterSheet';
import type { Character } from './types';

// README §5: POST/GET https://recruiting.verylongdomaintotestwith.ca/api/{{github_username}}/character
// Example: include the curly braces — /api/{mjohnston}/character
const CHARACTER_API_URL =
  'https://recruiting.verylongdomaintotestwith.ca/api/{dharmiksoni}/character';

function App() {
  const [characters, setCharacters] = useState<Character[]>(() => [createCharacter()]);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <button type="button" onClick={saveCharacters}>Save</button>
        <button type="button" onClick={addCharacter}>Add Character</button>
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
