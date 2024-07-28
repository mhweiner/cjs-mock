type Calls = any[];

type Stub = {
    func: (...args: any[]) => void
    getCalls: () => Calls
};

export function stub(): Stub {

    const calls: Calls = [];

    const func = (...args: any[]): void => {

        calls.push(args);

    };

    return {
        func,
        getCalls: (): Calls => calls,
    };

}
