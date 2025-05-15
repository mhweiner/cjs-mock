/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import path from 'path';
import callsites from 'callsites';
import {bold, green, gray} from 'colorette';
const Module = require('module');

type MockedDeps = {
    dependencyPath: string // the dependency being mocked
    mockReturnValue: any // what to return for that dependency
    parentPath: string // the module whose requires we're intercepting
};

const depsToMock = new Map<string, MockedDeps>();

function debug(msg: any) {

    if (!process.env.CJS_MOCK_DEBUG) return;

    console.log('CJS_MOCK_DEBUG: ', msg);

}

Module.prototype.require = new Proxy(Module.prototype.require, {
    apply(target, thisArg, argumentsList) {

        const [name] = argumentsList;
        // eslint-disable-next-line no-underscore-dangle
        const absolutePath = Module._resolveFilename(name, thisArg);
        const mock = depsToMock.get(absolutePath);

        // Only replace if the module is a direct dependency of the caller
        if (mock && mock.parentPath === thisArg.filename) {

            debug(`require(): ${green('REPLACING WITH MOCK')} ${bold(name)} [${absolutePath}] ${getStackTrace()}`);
            depsToMock.delete(absolutePath);
            return mock.mockReturnValue;

        }

        debug(`require(): ${bold(name)} [${absolutePath}] ${getStackTrace()}`);
        return Reflect.apply(target, thisArg, argumentsList);

    },
});

/**
 * Resolves a module path to an absolute path
 * @param modulePath - The module path to resolve
 * @param dir - The directory to resolve the module path in
 * @param parentModule - The parent module to resolve the module path in
 * @returns The absolute path of the module
 */
function resolve(
    modulePath: string,
    dir: string,
    parentModule: NodeJS.Module|null|undefined
): string {

    // if path starts with ., then it's relative
    if (modulePath.slice(0, 1) === '.') {

        const resolvedAbsPath = path.resolve(dir, modulePath);

        return Module._resolveFilename(resolvedAbsPath, parentModule);

    }

    return Module._resolveFilename(modulePath, parentModule);

}

function registerDepsToReplace(
    mockModules: any,
    dir: string,
    parentModule: NodeJS.Module|null|undefined,
    targetModulePath: string
) {

    Object.entries(mockModules).forEach((mockModule: any) => {

        const [modulePath, mockReturnValue] = mockModule;
        const absolutePath = resolve(modulePath, dir, parentModule);

        debug(`will replace: ${modulePath} [${absolutePath}]`);

        depsToMock.set(absolutePath, {
            dependencyPath: modulePath,
            mockReturnValue,
            parentPath: targetModulePath, // This is the module being mocked
        });

    });

}

export function mock(modulePath: string, deps: Record<string, any> = {}) {

    const callerFile = callsites()[1].getFileName() as string;
    const callerModule = Object.values(Module._cache).find((mod: any) => mod.filename === callerFile) as NodeJS.Module
        ?? module.parent?.parent; // this fallback assumes the caller is two levels up (mock.ts -> index.ts -> caller)
    const dir = path.dirname(callerFile);
    const absolutePath = resolve(modulePath, dir, callerModule);
    const moduleDir = path.dirname(absolutePath);

    debug(`mocking: ${modulePath} [${absolutePath}]`);

    // Pass the absolutePath as the targetModulePath
    registerDepsToReplace(deps, moduleDir, callerModule, absolutePath);
    delete require.cache[absolutePath];

    // require the module that we're mocking
    const mod = require(absolutePath);

    // make sure there are no unused mocks
    if (depsToMock.size) {

        throw new Error(`The following imports were not found in ${modulePath}: 
        ${[...depsToMock.values()].map((mock) => mock.dependencyPath).join(', ')}`);

    }

    // make sure this is not cached either, especially as it contains mocks that we don't want to keep around
    delete require.cache[absolutePath];

    return mod;

}

function getStackTrace() {

    const trace = callsites()
        .slice(1)
        .filter((callsite) => {

            const file = callsite.getFileName();

            // filter out internal, node_modules, and cjs-mock files
            return file
                && !file.includes('internal')
                && !file.includes('node_modules')
                && !file.includes('cjs-mock');

        })
        .map((callsite) => gray(`  at ${callsite.getFileName()} ${callsite.getLineNumber()}:${callsite.getColumnNumber()}`))
        .join('\n');

    return trace ? `\n${trace}` : '';

}
