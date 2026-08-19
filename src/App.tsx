import './App.css';
import CharacterSheet from './components/CharacterSheet';
import PartySkillCheck from './components/PartySkillCheck';
import { useCharacters } from './hooks/useCharacters';

function App() {
  const {
    characters,
    isLoading,
    loadError,
    saveError,
    addCharacter,
    updateCharacter,
    saveCharacters,
  } = useCharacters();

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
        {isLoading && <div className="status-muted">Loading characters…</div>}
        {loadError && <div className="status-error">{loadError}</div>}
        {saveError && <div className="status-error">{saveError}</div>}
        <PartySkillCheck characters={characters} />
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
