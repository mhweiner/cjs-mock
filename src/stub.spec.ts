import {test} from 'hoare';
import {stub} from './stub';

test('stub records calls', (assert) => {

    const fn = stub();

    fn('a', 1);
    fn('b', 2);

    const calls = fn.getCalls();

    assert.equal(calls.length, 2);
    assert.equal(calls[0], ['a', 1]);
    assert.equal(calls[1], ['b', 2]);

});

test('stub.clear() returns the stub and empties call history and resets config', (assert) => {

    const fn = stub();

    fn.setExpectedArgs('x');
    fn.setReturnValue(123);
    fn('x');

    assert.equal(fn.getCalls().length, 1);

    fn.clear();
    assert.equal(fn.getCalls().length, 0);

    // Should allow any arguments again
    fn('anything');
    assert.equal(fn.getCalls().length, 1);

    // clear returns the stub
    assert.equal(fn.clear(), fn);

});

test('stub.setReturnValue() returns the stub, and sets the return value of the stub', (assert) => {

    const fn = stub().setReturnValue('ok');

    const result = fn();

    assert.equal(result, 'ok');

});

test('stub throws on unexpected arguments', (assert) => {

    const fn = stub().setExpectedArgs('expected', 42);

    assert.throws(() => fn('wrong', 42), /Stub called with unexpected arguments/);
    assert.throws(() => fn(), /Stub called with unexpected arguments/);
    () => fn('expected', 42); // Should not throw

});

test('stub does strict equality check for expected args', (assert) => {

    const fn = stub().setExpectedArgs({a: 1});

    // This will fail because objects are compared by reference
    assert.throws(() => fn({a: 1}), /Stub called with unexpected arguments/);

    const obj = {a: 1};

    fn.clear();
    fn.setExpectedArgs(obj);

    () => fn(obj); // Should not throw

});
