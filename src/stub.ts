export type Stub = ((...args: any[]) => any) & {
    getCalls: () => any[]
    clear: () => void
    setExpectedArgs: (...expected: any[]) => void
    setReturnValue: (value: any) => void
};

export function stub(): Stub {

    let expectedArgs: any[] | null = null;
    let returnValue: any = undefined;
    const calls: any[] = [];

    const fn = (...args: any[]): any => {

        calls.push(args);

        if (expectedArgs !== null) {

            const isMatch =
        expectedArgs.length === args.length
        && expectedArgs.every((val, i) => val === args[i]);

            if (!isMatch) {

                throw new Error(`Stub called with unexpected arguments.\nExpected: ${JSON.stringify(expectedArgs)}\nReceived: ${JSON.stringify(args)}`);

            }

        }

        return returnValue;

    };

    fn.getCalls = (): any[] => calls;

    fn.clear = (): void => {

        calls.length = 0;
        expectedArgs = null;
        returnValue = undefined;

    };

    fn.setExpectedArgs = (...args: any[]): void => {

        expectedArgs = args;

    };

    fn.setReturnValue = (value: any): void => {

        returnValue = value;

    };

    return fn;

}
