import { useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';
import type { Attributes, Class } from './types';

// README §5: POST/GET https://recruiting.verylongdomaintotestwith.ca/api/{{github_username}}/character
// Example: include the curly braces — /api/{mjohnston}/character
const CHARACTER_API_URL =
  'https://recruiting.verylongdomaintotestwith.ca/api/{dharmiksoni}/character';

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

// README §3: "+1 for every 2 points above 10" (negative below 10).
// Examples: 12 → +1, 14 → +2, 7 → -2.
// Math.floor is required so 7 → -2. Truncating toward zero would give -1.
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// README §4: "Characters start with `10 + (4 * Intelligence Modifier)` points to distribute."
function getSkillPointBudget(intelligenceScore: number): number {
  return 10 + 4 * getAbilityModifier(intelligenceScore);
}

function initialSkillPoints(): Record<string, number> {
  return SKILL_LIST.reduce((points, skill) => {
    points[skill.name] = 0;
    return points;
  }, {} as Record<string, number>);
}

function App() {
  const [attributes, setAttributes] = useState<Attributes>(initialAttributes);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [skillPoints, setSkillPoints] = useState<Record<string, number>>(initialSkillPoints);

  // README §5: retrieve the character when the app starts next time (GET).
  useEffect(() => {
    fetch(CHARACTER_API_URL)
      .then((response) => response.json())
      .then((data) => {
        // Observed GET shapes: { statusCode, body: <posted JSON> } or { message: "Item not found" }.
        const saved = data.body;
        if (saved?.attributes && saved?.skillPoints) {
          setAttributes(saved.attributes);
          setSkillPoints(saved.skillPoints);
        }
      })
      .catch(() => {
        // Keep defaults if nothing is saved yet or the request fails.
      });
  }, []);

  // README §1: "Allow increment/decrement independently."
  // No min/max in this requirement — the 70-point cap is requirement 6.
  const adjustAttribute = (name: keyof Attributes, delta: number) => {
    setAttributes((prev) => ({
      ...prev,
      [name]: prev[name] + delta,
    }));
  };

  // README §4: min 0 per skill; no max except total available points.
  // If Intelligence later drops, the README does not say to refund points, so we only block new spending.
  const adjustSkill = (name: string, delta: number) => {
    setSkillPoints((prev) => {
      const nextValue = prev[name] + delta;
      if (nextValue < 0) {
        return prev;
      }
      const nextSpent = Object.values({ ...prev, [name]: nextValue }).reduce((sum, n) => sum + n, 0);
      const budget = getSkillPointBudget(attributes.Intelligence);
      if (nextSpent > budget) {
        return prev;
      }
      return { ...prev, [name]: nextValue };
    });
  };

  // README §5: Saving is POST with Content-Type: application/json.
  const saveCharacter = () => {
    fetch(CHARACTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attributes, skillPoints }),
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
        <button type="button" onClick={saveCharacter}>Save</button>
        {ATTRIBUTE_LIST.map((name) => {
          const key = name as keyof Attributes;
          return (
            <div key={key}>
              {key}: {attributes[key]}{' '}
              (modifier: {getAbilityModifier(attributes[key])}){' '}
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

        {/* README §4: skills from SKILL_LIST; total = points spent + related attribute modifier. */}
        <div>
          Points to distribute: {getSkillPointBudget(attributes.Intelligence)}{' '}
          (spent: {Object.values(skillPoints).reduce((sum, n) => sum + n, 0)})
          {SKILL_LIST.map((skill) => {
            const attribute = skill.attributeModifier as keyof Attributes;
            const points = skillPoints[skill.name];
            const modifier = getAbilityModifier(attributes[attribute]);
            const total = points + modifier;
            return (
              <div key={skill.name}>
                {skill.name} - points: {points}{' '}
                <button type="button" onClick={() => adjustSkill(skill.name, 1)}>+</button>{' '}
                <button type="button" onClick={() => adjustSkill(skill.name, -1)}>-</button>
                {' | '}modifier ({attribute}): {modifier}{' | '}total: {total}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
