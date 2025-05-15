import {isDeepStrictEqual, inspect} from 'node:util';

function format(value: any): string {

    return inspect(value, {depth: null, colors: true});

}

/* eslint-disable max-lines-per-function */
export type Stub = ((...args: any[]) => any) & {
    getCalls: () => any[]
    clear: () => Stub
    expects: (...expected: any[]) => Stub
    returns: (value: any) => Stub
    throws: (error: Error) => Stub
};

export function stub(name?: string): Stub {

    let expectedArgs: any[] | null = null;
    let returnValue: any = undefined;
    const calls: any[] = [];
    const fn = (...args: any[]): any => {

        calls.push(args);

        if (returnValue instanceof Function) {

            return returnValue(...args);

        }

        if (expectedArgs !== null) {

            const isMatch = isDeepStrictEqual(expectedArgs, args);

            if (!isMatch) {

                throw new Error(`Stub ${name ? `"${name}" ` : ''}called with unexpected arguments.\nExpected: ${format(expectedArgs)}\nReceived: ${format(args)}`);

            }

        }

        return returnValue;

    };

    fn.getCalls = (): any[] => calls;
    fn.clear = (): Stub => {

        calls.length = 0;
        expectedArgs = null;
        returnValue = undefined;
        return fn;

    };
    fn.expects = (...expected: any[]): Stub => {

        expectedArgs = expected;
        return fn;

    };
    fn.returns = (value: any): Stub => {

        returnValue = value;
        return fn;

    };
    fn.throws = (error: Error): Stub => {

        returnValue = () => {

            throw error;

        };
        return fn;

    };

    return fn;

}
