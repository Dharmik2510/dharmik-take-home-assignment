import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST } from './consts.js';
import type { Attributes, Class } from './types';

// README §1: "Create state and controls for each of the 6 attributes (`ATTRIBUTE_LIST`)."
// README does not specify a starting value, so we start at 0 rather than inventing a D&D default.
function initialAttributes(): Attributes {
  return ATTRIBUTE_LIST.reduce((attrs, name) => {
    attrs[name as keyof Attributes] = 0;
    return attrs;
  }, {} as Attributes);
}

// README §2: "Visually indicate when the character meets a class’s minimum requirements."
// "Minimum" means each attribute is at least the class's listed value (not an exact match).
function meetsClassMinimums(attributes: Attributes, minimums: Attributes): boolean {
  return ATTRIBUTE_LIST.every((name) => {
    const key = name as keyof Attributes;
    return attributes[key] >= minimums[key];
  });
}

function App() {
  const [attributes, setAttributes] = useState<Attributes>(initialAttributes);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

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

        {/* README §2: "Display available classes (`CLASS_LIST`)." */}
        <div>
          {(Object.keys(CLASS_LIST) as Class[]).map((className) => {
            const meetsMinimums = meetsClassMinimums(attributes, CLASS_LIST[className]);
            return (
              <button
                key={className}
                type="button"
                onClick={() => setSelectedClass(className)}
                style={{ fontWeight: meetsMinimums ? 'bold' : 'normal' }}
              >
                {className}
              </button>
            );
          })}
        </div>

        {/* README §2: "Clicking a class should show its required stats." */}
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
      </section>
    </div>
  );
}

export default App;
