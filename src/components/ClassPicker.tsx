import { ATTRIBUTE_LIST, CLASS_LIST } from '../consts';
import { getClassNames, meetsClassMinimums } from '../rules';
import type { Attributes, Class } from '../types';

type ClassPickerProps = {
  attributes: Attributes;
  selectedClass: Class | null;
  onSelect: (className: Class) => void;
};

function ClassPicker({ attributes, selectedClass, onSelect }: ClassPickerProps) {
  return (
    <section>
      <h3 className="panel-title">Classes</h3>
      <div className="class-row">
        {getClassNames().map((className) => {
          const meetsMinimums = meetsClassMinimums(attributes, CLASS_LIST[className]);
          const isSelected = selectedClass === className;
          return (
            <button
              key={className}
              type="button"
              className={`class-button${meetsMinimums ? ' is-met' : ''}${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect(className)}
              style={{ fontWeight: meetsMinimums ? 'bold' : 'normal' }}
            >
              {className}
            </button>
          );
        })}
      </div>

      {selectedClass && (
        <div className="requirements">
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
  );
}

export default ClassPicker;
