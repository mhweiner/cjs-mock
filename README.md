<img src="docs/hoare-triple.png" title="Hoare triple" alt="Hoare triple" width="200">

# hoare

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()

A simple and opinionated Javascript/Typescript test runner designed to help you to write simple, readable, and maintainable tests. 

**Out-of-the-box Typescript support 🔒**
- Written in and designed around Typescript. No special configuration needed, and no plugins to install. Works great with [c8](https://github.com/bcoe/c8) for code coverage.
- Handles compilation errors gracefully.

**Designed For Speed 🚀**
- Multi-process parallel test runner. Each spec file is run in its own process and runtime for speed and isolation benefits.
- Simple means fast.

**Easy to Use 😃**
- [Very simple assertion API](#api). You shouldn't need to learn a new language to read and write tests. Assertions should be simple axiomatic logic and code, not an English-like poem.
- Built-in [powerful diff visualization tool](#visual-diff-tool).
- Any stray `stdout`, errors, or unhandled promise rejections are buffered and grouped under the test file in the output. This helps you know where they came from.
- Clear documentation.

**Defensive 🛡**
- Uncaught errors and unhandled promise rejections will cause the test to fail.
- Any files without tests, or tests without assertions, result in a failed test.
- Strict and deep equality operator by default.

**Opinionated 🎓**
- No nesting of tests. This has the following benefits:
  - Pressures programmers to break apart their code into smaller pieces.
  - Test code becomes much simpler and easier to read and maintain.
  - Output reporting becomes much simpler and easier to read and understand.
- No built-in `before()` and `after()`. This leads to messy design patterns and mistakes in test code. Most tests shouldn't require teardowns. Of course, you could still create your own.

**Modern Language Features ✨**
  - Async/Await/Promise Support
  - CJS & ESM support

**Robust & Reliable 💪**
- Small, simple, and modular codebase written in Typescript with minimal dependencies.
- Largely agnostic of other tools and doesn't try to do too much.

# Examples

See [demo](demo) or [src](src) directories for more examples.

## Hello World

_helloworld.ts_
```typescript
export function helloworld() {
  return 'hello, world';
}
```
_helloworld.spec.ts_
```typescript
import {test} from 'hoare';
import {helloworld} from './helloworld';

test('should return "hello, world"', (assert) => {
  assert.equal(helloworld(), 'hello, world');
});
```
## Valid Word

_isValidWord.ts_
```typescript
import {readFile} from 'fs/promises';

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
import {test, mock} from 'hoare';
import * as mod from './isValidWord'; // just used for typing

const dict = ['dog', 'cat', 'fish'].join('\n');
const mockMod: typeof mod = mock('./isValidWord', {
    'fs/promises': {readFile: () => Promise.resolve(dict)},
});

test('valid word returns true', async (assert) => {
  const result = await mockMod.isValidWord('dog');
  assert.equal(result, true);
});

test('invalid word returns false', async (assert) => {
  const result = await mockMod.isValidWord('nope');
  assert.equal(result, false);
});
```

# Installation

1. Install from npm along with peer dependencies:

    ```console
    npm i typescript ts-node c8 hoare -DE
    ```
2. Create an `.c8rc.json` file in the root of your project with the following:
    ```json
    {
        "extends": "@istanbuljs/nyc-config-typescript",
        "all": true,
        "exclude": [
            "**/*.spec.ts",
            "**/*.d.ts",
            "**/*.spec.js",
            "coverage",
            ".eslintrc.js",
            ".eslintrc",
            "tests",
            "test",
            "test_utils"
        ]
    }
    ```
3. Add the following command to your `package.json` `scripts` directive:
```json
{
  "test": "hoare"
}
```

# Basic Usage

1. Write your tests with a `.spec.ts` or `.spec.js` extension (although any extension will work, as long as it matches your glob in your `npm test` script). We highly recommend you put your spec files alongside your code, and not in a separate folder.
2. Simply run `npm test`.

# API

## Methods

### `test(title: string, cb: (assert: Assert) => void): void`

Create a test. `cb` can be an `async` function.

## Interfaces

### `Assert`

#### `equal(actual: any, expected: any, msg?: string): void`

Asserts deep and strict equality on objects or primitives. Unless your code is non-deterministic, [this should be the only assertion you need](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f).

#### `errorsEquivalent(err1: any, err2: any, msg?: string)`

Asserts that both errors are similar. Stack traces are ignored. It checks for both non-enumerable properties
(ie, `name` and `message`) and enumerable properties (anything added by extending `Error`).

Both errors **must** be an instance of `Error`, or an error will be thrown. See [validate.spec.ts](examples/validate.spec.ts) example.

# Visual Diff Tool

WIP

# Inspiration, Philosophy & Attribution

`hoare` is named after [Sir Tony Hoare](https://en.wikipedia.org/wiki/Tony_Hoare) (aka C. A. R. Hoare), and the [Hoare triple](https://en.wikipedia.org/wiki/Hoare_logic), the cornerstone of Hoare's axiomatic method of testing computer programs (what we largely consider unit testing today).

After years of working on [safety-critical](https://en.wikipedia.org/wiki/Safety-critical_system) and mission-critical software in healthcare, education and e-commerce, I have come to appreciate the importance of clean, readable, and maintainable unit tests and the profound effect they can have on the development of the code itself.

> The real value of tests is not that they detect bugs in the code, but that they detect inadequacies in the methods, concentration, and skills of those who design and produce the code. — C. A. R. Hoare

Good unit tests force programmers to break apart their code into smaller, more easily testable parts. Unfortunately, testing frameworks have become ever-complex to address deficiencies in design, when they should be doing the opposite.

> Inside every large program, there is a small program trying to get out. — C. A. R. Hoare

A unit test should act as a **_specification_** for the behavior of the code that we're testing. The Hoare triple, written as `{P} S {Q}`, provides a way for us to specify this expected behavior. Each part is a logical statement that must be true for the test to pass: `pre-condition`, `execution`, and `post-condition`. The Hoare triple is an easy way to reason about how a piece of code should behave, and a good unit test should clearly communicate this to the reader. I often use `given`, `when`, `then` in my unit tests.

Difficult-to-read unit tests also increase the likelihood of lack of maintenance, abandonment, or errors in the test itself. Bad tests are actually worse than not having a test at all&mdash;they could give false confidence or just add friction.

One of my biggest sources of inspiration is [Rethinking Unit Test Assertions](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f) by [Eric Elliot](https://medium.com/@_ericelliott).

Inspiration was also taken from other test frameworks [tape](https://github.com/substack/tape), [AVA](https://github.com/avajs/ava) and [node-tap](https://github.com/tapjs/node-tap).

> There are two ways of constructing a software design: one way is to make it so simple that there are obviously no deficiencies and the other is to make it so complicated that there are no obvious deficiencies. — C. A. R. Hoare

# Contribution

For local development, see scripts in `package.json`.

- Issue a PR against `master` and request review. Make sure all tests pass and coverage is good.
- You can also submit an issue.

# License

MIT &copy; Marc H. Weiner

[See full license](LICENSE)
