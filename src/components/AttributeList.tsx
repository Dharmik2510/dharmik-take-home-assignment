import { ATTRIBUTE_LIST } from '../consts';
import { getAbilityModifier } from '../rules';
import type { Attributes } from '../types';

type AttributeListProps = {
  attributes: Attributes;
  onAdjust: (name: keyof Attributes, delta: number) => void;
};

function AttributeList({ attributes, onAdjust }: AttributeListProps) {
  return (
    <section>
      <h3 className="panel-title">Attributes</h3>
      <div className="attribute-list">
        {ATTRIBUTE_LIST.map((name) => {
          const key = name as keyof Attributes;
          return (
            <div className="attribute-row" key={key}>
              <span className="attr-name">{key}: {attributes[key]}</span>
              <span className="modifier">(modifier: {getAbilityModifier(attributes[key])})</span>
              <span className="stepper-group">
                <button type="button" className="stepper" onClick={() => onAdjust(key, 1)}>+</button>
                <button type="button" className="stepper" onClick={() => onAdjust(key, -1)}>-</button>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AttributeList;
