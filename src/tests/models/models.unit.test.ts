import { describe, it, expect } from 'vitest';

import type { Config } from '../../models/config-model';
import type { Note } from '../../models/note';

describe('Model types', () => {
  it('should create a Config object', () => {
    const config: Config = {
      id: 'config1',
      description: 'Test config',
      count: 42
    };
    expect(config.id).toBe('config1');
    expect(config.description).toBe('Test config');
    expect(config.count).toBe(42);
  });

  it('should create a Note object', () => {
    const note: Note = {
      title: 'Sample Note',
      content: 'This is a sample note content.'
    };
    expect(note.title).toBe('Sample Note');
    expect(note.content).toBe('This is a sample note content.');
  });
});
