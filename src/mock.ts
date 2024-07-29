import path from 'path';
import callsites from 'callsites';
import {bold, green, grey} from './lib/colors';
// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const Module = require('module');
const registeredMocks = new Map<string, {modulePath: string, mockReturnValue: any}>();

function debug(msg: any) {

    if (!process.env.CJS_MOCK_DEBUG) return;

    console.log('CJS_MOCK_DEBUG: ', msg);

}

Module.prototype.require = new Proxy(Module.prototype.require, {
    apply(target, thisArg, argumentsList) {

        const [name] = argumentsList;
        // eslint-disable-next-line no-underscore-dangle
        const absolutePath = Module._resolveFilename(name, thisArg);
        const mock = registeredMocks.get(absolutePath);

        if (mock) {

            debug(`require(): ${green('REPLACING WITH MOCK')} ${bold(name)} [${absolutePath}] ${getStackTrace()}`);
            registeredMocks.delete(absolutePath);
            return mock.mockReturnValue;

        } else {

            debug(`require(): ${bold(name)} [${absolutePath}] ${getStackTrace()}`);

        }

        return Reflect.apply(target, thisArg, argumentsList);

    },
});

function resolve(modulePath: string, dir: string, parentModule: any): string {

    // if path starts with ., then it's relative
    if (modulePath.slice(0, 1) === '.') {

        const resolvedAbsPath = path.resolve(dir, modulePath);

        // eslint-disable-next-line no-underscore-dangle
        return Module._resolveFilename(resolvedAbsPath, parentModule);

    }

    // eslint-disable-next-line no-underscore-dangle
    return Module._resolveFilename(modulePath, parentModule);

}

function registerMockModules(mockModules: any, dir: string, parentModule: any) {

    Object.entries(mockModules).forEach((mockModule: any) => {

        const [modulePath, mockReturnValue] = mockModule;
        const absolutePath = resolve(modulePath, dir, parentModule);

        debug(`registerMocks(): ${modulePath} [${absolutePath}]`);

        if (!absolutePath) {

            throw new Error(`Unable to find module "${modulePath}".`);

        }

        registeredMocks.set(absolutePath, {
            modulePath,
            mockReturnValue,
        });

    });

}

export function mock(modulePath: string, mocks: any) {

    const callerFile = callsites()[1].getFileName() as string;
    const parentModule = module.parent?.parent;
    const dir = path.dirname(callerFile);
    const absolutePath = resolve(modulePath, dir, parentModule);
    const moduleDir = path.dirname(absolutePath);

    debug(`mock(): ${modulePath} [${absolutePath}]`);

    if (!absolutePath) {

        throw new Error(`Unable to find ${modulePath}`);

    }

    registerMockModules(mocks, moduleDir, parentModule);
    delete require.cache[absolutePath];

    // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
    const mod = require(absolutePath);

    // make sure there are no unused mocks
    if (registeredMocks.size) {

        throw new Error(`The following imports were not found in ${modulePath}: 
        ${[...registeredMocks.values()].map((mock) => mock.modulePath).join(', ')}`);

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

            return file
            && !file.includes('internal')
            && !file.includes('node_modules')
            && !file.includes('cjs-mock');

        })
        .map((callsite) => grey(`  at ${callsite.getFileName()} ${callsite.getLineNumber()}:${callsite.getColumnNumber()}`))
        .join('\n');

    return trace ? `\n${trace}` : '';

}
