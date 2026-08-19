import { useEffect, useState } from 'react';
import { loadCharacters, saveCharacters as persistCharacters } from '../api/characterApi';
import { createCharacter } from '../rules';
import type { Character } from '../types';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>(() => [createCharacter()]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadCharacters()
      .then((saved) => {
        if (cancelled) {
          return;
        }
        if (saved) {
          setCharacters(saved);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not load saved characters.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateCharacter = (index: number, updater: (previous: Character) => Character) => {
    setCharacters((previous) =>
      previous.map((character, characterIndex) =>
        characterIndex === index ? updater(character) : character,
      ),
    );
  };

  const addCharacter = () => {
    setCharacters((previous) => [...previous, createCharacter()]);
  };

  const saveCharacters = () => {
    setSaveError(null);
    persistCharacters(characters).catch(() => {
      setSaveError('Could not save characters.');
    });
  };

  return {
    characters,
    isLoading,
    loadError,
    saveError,
    addCharacter,
    updateCharacter,
    saveCharacters,
  };
}
