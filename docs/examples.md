# More examples

### Mocking a node module (TypeScript)

_isValidWord.ts_
```typescript
import {readFile} from 'fs/promises'; // we're going to mock this

export async function isValidWord(word: string) {
  const validWords = await getValidWords();
  return validWords.indexOf(word) !== -1;
}

async function getValidWords() {
  const contents = await readFile('./dict.txt', 'utf-8');
  return contents.split('\n');
}
```
_isValidWord.spec.ts_
```typescript
import {test} from 'hoare';
import {mock} from 'cjs-mock';
import * as mod from './isValidWord'; // just used for type

const dict = ['dog', 'cat', 'fish'].join('\n');
const mockMod: typeof mod = mock('./isValidWord', {
    'fs/promises': {readFile: () => Promise.resolve(dict)},
});

test('valid word returns true', async (assert) => {
  const result = await mockMod.isValidWord('dog');
  assert.equal(result, true);
});
```

### Mocking a node module (JavaScript)

_isValidWord.js_
```javascript
const {readFile} = require('fs/promises'); // we're going to mock this

export async function isValidWord(word) {
  const validWords = await getValidWords();
  return validWords.indexOf(word) !== -1;
}

async function getValidWords() {
  const contents = await readFile('./dict.txt', 'utf-8');
  return contents.split('\n');
}
```

_isValidWord.spec.js_
```javascript
const {test} = require('hoare');
const {mock} = require('cjs-mock');

const dict = ['dog', 'cat', 'fish'].join('\n');
const mockMod = mock('./isValidWord', {
    'fs/promises': {readFile: () => Promise.resolve(dict)},
});

test('valid word returns true', async (assert) => {
  const result = await mockMod.isValidWord('dog');
  assert.equal(result, true);
});
```

### Mocking a local module (JavaScript)

_/fake/a/foo.js_
```javascript
const bar = require('./bar');

module.exports = function() {
    return 'foo ' + bar();
}
```
_/fake/b/example.js_
```javascript
const mockedFoo = mock('../a/foo', { //relative to example.js
    './bar': () => 'fakeBar', //relative to foo.js
});