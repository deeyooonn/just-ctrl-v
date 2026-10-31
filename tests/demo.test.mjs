import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStudyNotes } from '../src/lib/demo.mjs';
test('notes become usable question-answer cards without any AI service', () => {
  assert.deepEqual(parseStudyNotes('HTTP: transfers web resources\ninvalid line\nDNS: translates names: keeps a cache'), [
    { question:'HTTP', answer:'transfers web resources' }, { question:'DNS', answer:'translates names: keeps a cache' }
  ]);
  assert.deepEqual(parseStudyNotes(' : \nTerm:\n:answer'), []);
});
