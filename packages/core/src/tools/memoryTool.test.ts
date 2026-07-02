/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTEXT_FILENAME,
  getAllZEROMdFilenames,
  resetZEROMdFilename,
  setZEROMdFilename,
} from './memoryTool.js';

describe('memoryTool filename helpers', () => {
  afterEach(() => {
    resetZEROMdFilename(DEFAULT_CONTEXT_FILENAME);
  });

  describe('setZEROMdFilename', () => {
    it('appends to currentZEROMdFilename when a valid new name is provided', () => {
      const newName = 'CUSTOM_CONTEXT.md';
      setZEROMdFilename(newName);
      expect(getAllZEROMdFilenames()).toEqual([
        newName,
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });

    it('does not update currentZEROMdFilename if the new name is empty or whitespace', () => {
      const initialNames = getAllZEROMdFilenames();
      setZEROMdFilename('  ');
      expect(getAllZEROMdFilenames()).toEqual(initialNames);

      setZEROMdFilename('');
      expect(getAllZEROMdFilenames()).toEqual(initialNames);
    });

    it('handles adding an array of filenames', () => {
      const newNames = ['CUSTOM_CONTEXT.md', 'ANOTHER_CONTEXT.md'];
      setZEROMdFilename(newNames);
      expect(getAllZEROMdFilenames()).toEqual([
        ...newNames,
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });

    it('ensures uniqueness when adding names', () => {
      setZEROMdFilename(DEFAULT_CONTEXT_FILENAME);
      expect(getAllZEROMdFilenames()).toEqual([DEFAULT_CONTEXT_FILENAME]);

      setZEROMdFilename(['NEW.md', 'NEW.md']);
      expect(getAllZEROMdFilenames()).toEqual([
        'NEW.md',
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });
  });

  describe('resetZEROMdFilename', () => {
    it('replaces all filenames with the provided one', () => {
      setZEROMdFilename('OTHER.md');
      resetZEROMdFilename('RESET.md');
      expect(getAllZEROMdFilenames()).toEqual(['RESET.md']);
    });

    it('resets to default if no argument provided', () => {
      resetZEROMdFilename('OTHER.md');
      resetZEROMdFilename(DEFAULT_CONTEXT_FILENAME);
      expect(getAllZEROMdFilenames()).toEqual([DEFAULT_CONTEXT_FILENAME]);
    });

    it('handles array reset', () => {
      resetZEROMdFilename(['A.md', 'B.md']);
      expect(getAllZEROMdFilenames()).toEqual(['A.md', 'B.md']);
    });
  });
});
