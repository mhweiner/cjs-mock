import {isDeepStrictEqual} from 'node:util';

/* eslint-disable max-lines-per-function */
export type Stub = ((...args: any[]) => any) & {
    getCalls: () => any[]
    clear: () => Stub
    setExpectedArgs: (...expected: any[]) => Stub
    setReturnValue: (value: any) => Stub
};

export function stub(): Stub {

    let expectedArgs: any[] | null = null;
    let returnValue: any = undefined;
    const calls: any[] = [];
    const fn = (...args: any[]): any => {

        calls.push(args);

        if (expectedArgs !== null) {

            const isMatch = isDeepStrictEqual(expectedArgs, args);

            if (!isMatch) {

                throw new Error(`Stub called with unexpected arguments.\nExpected: ${JSON.stringify(expectedArgs)}\nReceived: ${JSON.stringify(args)}`);

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
    fn.setExpectedArgs = (...args: any[]): Stub => {

        expectedArgs = args;
        return fn;

    };
    fn.setReturnValue = (value: any): Stub => {

        returnValue = value;
        return fn;

    };

    return fn;

}
