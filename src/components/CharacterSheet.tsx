import { applyAttributeChange, nextSkillPoints } from '../rules';
import type { Attributes, Character, Class } from '../types';
import AttributeList from './AttributeList';
import ClassPicker from './ClassPicker';
import SkillCheck from './SkillCheck';
import SkillList from './SkillList';

type CharacterSheetProps = {
  characterLabel: string;
  character: Character;
  onChange: (updater: (previous: Character) => Character) => void;
};

function CharacterSheet({ characterLabel, character, onChange }: CharacterSheetProps) {
  const adjustAttribute = (name: keyof Attributes, delta: number) => {
    onChange((previous) => applyAttributeChange(previous, name, delta));
  };

  const adjustSkill = (name: string, delta: number) => {
    onChange((previous) => {
      const skillPoints = nextSkillPoints(
        previous.skillPoints,
        name,
        delta,
        previous.attributes.Intelligence,
      );
      if (skillPoints === previous.skillPoints) {
        return previous;
      }
      return { ...previous, skillPoints };
    });
  };

  const selectClass = (className: Class) => {
    onChange((previous) => ({ ...previous, selectedClass: className }));
  };

  return (
    <div className="character-card">
      <h2>{characterLabel}</h2>
      <AttributeList attributes={character.attributes} onAdjust={adjustAttribute} />
      <ClassPicker
        attributes={character.attributes}
        selectedClass={character.selectedClass}
        onSelect={selectClass}
      />
      <SkillList character={character} onAdjust={adjustSkill} />
      <SkillCheck character={character} />
    </div>
  );
}

export default CharacterSheet;
