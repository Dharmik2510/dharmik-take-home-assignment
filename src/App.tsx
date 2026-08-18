import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST } from './consts.js';
import type { Attributes } from './types';

// README §1: "Create state and controls for each of the 6 attributes (`ATTRIBUTE_LIST`)."
// README does not specify a starting value, so we start at 0 rather than inventing a D&D default.
function initialAttributes(): Attributes {
  return ATTRIBUTE_LIST.reduce((attrs, name) => {
    attrs[name as keyof Attributes] = 0;
    return attrs;
  }, {} as Attributes);
}

function App() {
  const [attributes, setAttributes] = useState<Attributes>(initialAttributes);

  // README §1: "Allow increment/decrement independently."
  // No min/max in this requirement — the 70-point cap is requirement 6.
  const adjustAttribute = (name: keyof Attributes, delta: number) => {
    setAttributes((prev) => ({
      ...prev,
      [name]: prev[name] + delta,
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        {ATTRIBUTE_LIST.map((name) => {
          const key = name as keyof Attributes;
          return (
            <div key={key}>
              {key}: {attributes[key]}{' '}
              <button onClick={() => adjustAttribute(key, 1)}>+</button>
              <button onClick={() => adjustAttribute(key, -1)}>-</button>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;
