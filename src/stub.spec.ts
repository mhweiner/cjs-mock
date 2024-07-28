import {test} from 'hoare';
import {stub} from './stub';

test('stub', (assert) => {

    const {func, getCalls} = stub();

    assert.equal(getCalls(), [], 'initially no calls');

    func(1, 2, 3);
    func(4, 5, 6);

    assert.equal(
        getCalls(),
        [[1, 2, 3], [4, 5, 6]],
        'calls are recorded'
    );

});
