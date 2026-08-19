import { isValidCharacter, normalizeCharacter } from '../rules';
import type { Character } from '../types';

export const GITHUB_USERNAME = 'dharmiksoni';

export const CHARACTER_API_URL =
  `https://recruiting.verylongdomaintotestwith.ca/api/{${GITHUB_USERNAME}}/character`;

type ApiEnvelope = {
  statusCode?: number;
  body?: unknown;
  message?: string;
};

export function parseSavedCharacters(data: unknown): Character[] | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const envelope = data as ApiEnvelope;
  if (envelope.message === 'Item not found' && envelope.body == null) {
    return null;
  }
  const saved = envelope.body ?? data;
  if (!saved || typeof saved !== 'object') {
    return null;
  }
  const record = saved as { characters?: unknown; attributes?: unknown; skillPoints?: unknown };

  if (Array.isArray(record.characters)) {
    const valid = record.characters.filter(isValidCharacter).map(normalizeCharacter);
    return valid.length > 0 ? valid : null;
  }

  if (isValidCharacter(record)) {
    return [normalizeCharacter(record)];
  }

  return null;
}

export async function loadCharacters(): Promise<Character[] | null> {
  const response = await fetch(CHARACTER_API_URL);
  if (!response.ok) {
    throw new Error('Failed to load characters');
  }
  const data = await response.json();
  return parseSavedCharacters(data);
}

export async function saveCharacters(characters: Character[]): Promise<void> {
  const response = await fetch(CHARACTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ characters }),
  });
  if (!response.ok) {
    throw new Error('Failed to save characters');
  }
}
