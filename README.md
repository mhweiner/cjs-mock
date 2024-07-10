<picture>
    <source srcset="docs/graphic.svg" media="(prefers-color-scheme: dark)">
    <source srcset="docs/graphic-dark.svg" media="(prefers-color-scheme: light)">
    <img src="docs/graphic-dark.svg" alt="Logo" style="margin: 0 0 10px" size="250">
</picture>

# cjs-mock

[![build status](https://github.com/mhweiner/cjs-mock/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/cjs-mock/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Autorel](https://img.shields.io/badge/autorel-666.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDMiIHZpZXdCb3g9IjAgMCA0MiA0MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2LjQwNjIgMC4yNUgyNS41OTM4TDI2Ljk4ODMgNi43MzA0N0MyOC4zMDA4IDcuMjIyNjYgMjkuNDQ5MiA3Ljk2MDk0IDMwLjU5NzcgOC43ODEyNUwzNi44MzIgNi44MTI1TDQxLjQyNTggMTQuNzY5NUwzNi41ODU5IDE5LjE5OTJDMzYuNjY4IDE5Ljg1NTUgMzYuNzUgMjAuNTkzOCAzNi43NSAyMS4yNUMzNi43NSAyMS45ODgzIDM2LjY2OCAyMi42NDQ1IDM2LjU4NTkgMjMuMzgyOEw0MS40MjU4IDI3LjgxMjVMMzYuODMyIDM1Ljc2OTVMMzAuNTk3NyAzMy43MTg4QzI5LjQ0OTIgMzQuNjIxMSAyOC4zMDA4IDM1LjI3NzMgMjYuOTg4MyAzNS44NTE2TDI1LjU5MzggNDIuMjVIMTYuNDA2MkwxNC45Mjk3IDM1Ljg1MTZDMTMuNjk5MiAzNS4zNTk0IDEyLjQ2ODggMzQuNjIxMSAxMS4zMjAzIDMzLjgwMDhMNS4wODU5NCAzNS43Njk1TDAuNDkyMTg4IDI3LjgxMjVMNS4zMzIwMyAyMy4zODI4QzUuMjUgMjIuNzI2NiA1LjI1IDIxLjk4ODMgNS4yNSAyMS4yNUM1LjI1IDIwLjU5MzggNS4yNSAxOS44NTU1IDUuMzMyMDMgMTkuMTk5MkwwLjQ5MjE4OCAxNC43Njk1TDUuMDg1OTQgNi44MTI1TDExLjMyMDMgOC43ODEyNUMxMi40Njg4IDcuOTYwOTQgMTMuNjk5MiA3LjIyMjY2IDE0LjkyOTcgNi43MzA0N0wxNi40MDYyIDAuMjVaTTIxIDI3LjgxMjVDMjMuMjk2OSAyNy44MTI1IDI1LjQyOTcgMjYuNTgyIDI2LjY2MDIgMjQuNTMxMkMyNy44MDg2IDIyLjU2MjUgMjcuODA4NiAyMC4wMTk1IDI2LjY2MDIgMTcuOTY4OEMyNS40Mjk3IDE2IDIzLjI5NjkgMTQuNjg3NSAyMSAxNC42ODc1QzE4LjYyMTEgMTQuNjg3NSAxNi40ODgzIDE2IDE1LjI1NzggMTcuOTY4OEMxNC4xMDk0IDIwLjAxOTUgMTQuMTA5NCAyMi41NjI1IDE1LjI1NzggMjQuNTMxMkMxNi40ODgzIDI2LjU4MiAxOC42MjExIDI3LjgxMjUgMjEgMjcuODEyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=)](https://github.com/mhweiner/autorel)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes. Similar to [proxyquire](https://www.npmjs.com/package/proxyquire), but simpler and safer. Sponsored by [Aeroview](https://aeroview.io).

**Easy to Use 😃**
- Super simple & straightforward documentation.
- Debugging utility.
- Built in Typescript support.

**Defensive 🛡**
- Throws an error if any mocks are unused by module we are mocking.
- Module Cache for the module in question is always deleted before and after mocking to minimize side effects and make behavior more predictable and approximate immutability.

**Robust & Reliable 💪**
- Tiny codebase written in Typescript with only 1 dependency (which is also tiny and itself has no dependencies).

## Example

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

See more examples in the [docs/examples.md](examples.md)

## Installation

 ```console
 npm i cjs-mock -D
 ```

## API

### `mock(modulePath: string, mocks: any): module`

Returns a module with Dependency Injection for `modulePath`, as specified by the `mocks` argument. As a side effect, the module cache is deleted for module specified by `modulePath` and all modules specified in `mocks`. This cache is deleted at the start and end of the function. This should not matter during unit testing, but it is something to be aware of. **This should not be used in production code.**

You should pass as a string the same thing you would pass to an `import` statement or `require`, with the following caveats:

1. Any relative paths be relative to the module being returned
2. It must only be a _direct_ dependency of that module. It will not work recursively, including for re-exported modules (ie, `export * from 'foo'`).

This function throws if any of the modules or properties are not resolvable, or if there are any unused (not required/imported by the module specified in `modulePath`):
```
Error: Unable to find foo
```
```
Error: The following imports were unused in ./foo: 
        ./bar
```

This is a defensive measure to ensure that the mocks are being used as intended.

## Partial Mocking

You can nest `mock()` for partial mocking of nested dependencies:

```typescript
const m = mock('./foo', {
    '.': mock('./bar', {
        'bob': () => 'fake bob'
    })
});
```

## Do Not Use in Production Environment

Just like for `proxyquire` and other mocking utilities, use of this utility is not recommended in production environments, for the following reasons:

1. Mocking utilities (including this one) are typically designed for unit testing in a sandbox environment, not production code.
2. It's easy to get the mock wrong (which is why we throw errors for unused mocks and offer debug utilities).
3. It has side effects on the module cache, by clearing it. This can lead to some very unexpected behavior outside of a unit test.

## Debugging

A debugging utility is included, for use when you are having a difficult time seeing the order of how things are getting imported, and if a mock has been substituted after a successful resolution & match.

To enable this mode, set this in your environment: `CJS_MOCK_DEBUG=1`.

Example (trucated) output:

```console
CJS_MOCK_DEBUG:  registerMocks(): ./transports [/Users/marc/code/jsout/src/transports.ts]
CJS_MOCK_DEBUG:  require(): /Users/marc/code/jsout/src/output.ts [/Users/marc/code/jsout/src/output.ts]
CJS_MOCK_DEBUG:  resolve(): module: ./log, dir: /Users/marc/code/jsout/src
CJS_MOCK_DEBUG:  mock(): ./log [/Users/marc/code/jsout/src/log.ts]
CJS_MOCK_DEBUG:  mock(): caller: /Users/marc/code/jsout/src/log.spec.ts
CJS_MOCK_DEBUG:  resolve(): module: ./output, dir: /Users/marc/code/jsout/src
```

Be warned, this may produce a *metric ton* of output to `stdout`. It's sometimes shocking just how many modules are required in a node project, including built-in modules. You may want to limit the output to just the relevant test by only running that test.

# Support, Feedback, and Contributions

- Star this repo if you like it!
- Submit an [issue](https://github.com/mhweiner/autorel/issues) with your problem, feature request or bug report
- Issue a PR against `main` and request review. Make sure all tests pass and coverage is good.
- Write about `autorel` in your blog, tweet about it, or share it with your friends!

## License

MIT &copy; Marc H. Weiner

[See full license](LICENSE)

## Sponsors

<picture>
    <source srcset="docs/aeroview-logo-lockup.svg" media="(prefers-color-scheme: dark)">
    <source srcset="docs/aeroview-logo-lockup-dark.svg" media="(prefers-color-scheme: light)">
    <img src="docs/aeroview-logo-lockup-dark.svg" alt="Logo" style="max-width: 150px;margin: 0 0 10px">
</picture>

Aeroview is a developer-friendly, AI-powered observability platform that helps you monitor, troubleshoot, and optimize your applications. Get started for free at [https://aeroview.io](https://aeroview.io).