<img src="graphic.png" title="diagram" alt="diagram" width="150">

# cjs-mock

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()

'Immutable' NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes. Similar to [proxyquire](), but much simpler and more defensive.

**Easy to Use 😃**
- Much simpler than [proxyquire](). Straightforward documentation.
- Debugging utility.

**Defensive 🛡**
- Throws an error if any mocks are unused (not found in the module we are mocking).
- Module Cache for the module in question is always deleted before and after mocking to minimize side effects and make behavior more predictable. This approximates immutability.

**Robust & Reliable 💪**
- Tiny codebase written in Typescript with only 1 dependency.

# Example

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

# Installation

 ```console
 npm i cjs-mock -DE
 ```

# API

## `mock(modulePath: string, mocks: any): module`

Returns a module with Dependency Injection for `modulePath`, as specified by the `mocks` argument. As a side effect, the module cache is deleted for module specified by `modulePath` and all modules specified in `mocks`. This cache is deleted at the start and end of the function. This should not matter during unit testing, but it is something to be aware of. **This should not be used in production code.**

You should pass as a string the same thing you would pass to an `import` statement or `require`, with the following caveats:

1. Any relative paths be relative to the module being returned
2. It must only be a direct dependency of that module. It will not work recursively, including re-exported modules.

This function throws if any of the modules or properties are not resolvable, or if there are any unused (not required/imported by the module specified in `modulePath`):
```
Error: Unable to find module foo
```
```
Error: The following imports were unused in module ./foo: 
        ./bar
```

Example usage with relative paths:

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

console.log(mockedFoo()) // foo fakeBar
```

# Partial Mocking

You can nest `mock()` for partial mocking of nested dependencies:

```typescript
const m = mock('./foo', {
    '.': mock('./bar', {
        'bob': () => 'fake bob'
    })
});
```

# Do Not Use in Production Environment

Just like for `proxyquire` and other mocking utilities, it is not recommend you use this utility in production environments, for the following reasons:

1. Mocking utilities (including this one) are typically designed for unit testing in a sandbox environment, not production code.
2. It's easy to get the mock wrong (which is why we throw errors for unused mocks and offer debug utilities). Although frustrating, this is harmless in a test environment, but can be disastrous in production.
3. It has side effects on the module cache. This can lead to some very unexpected behavior outside of a unit test.

# Contribution

For local development, see scripts in `package.json`.

- Issue a PR against `master` and request review. Make sure all tests pass and coverage is good.
- You can also submit an issue.

# License

MIT &copy; Marc H. Weiner

[See full license](LICENSE)
