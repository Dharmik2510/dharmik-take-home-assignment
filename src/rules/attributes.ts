import { ATTRIBUTE_LIST } from '../consts';
import type { Attributes } from '../types';
import { ATTRIBUTE_MINIMUM, ATTRIBUTE_POINT_CAP } from './constants';

export function getAttributeTotal(attributes: Attributes): number {
  return ATTRIBUTE_LIST.reduce(
    (sum, name) => sum + attributes[name as keyof Attributes],
    0,
  );
}

export function nextAttributes(
  attributes: Attributes,
  name: keyof Attributes,
  delta: number,
): Attributes {
  const nextValue = attributes[name] + delta;
  if (nextValue < ATTRIBUTE_MINIMUM) {
    return attributes;
  }
  if (delta > 0 && getAttributeTotal(attributes) >= ATTRIBUTE_POINT_CAP) {
    return attributes;
  }
  return {
    ...attributes,
    [name]: nextValue,
  };
}
