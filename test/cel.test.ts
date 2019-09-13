import cel from '../src/cel';
import assert from 'assert';

describe('cel', () => {
  describe('#ref', () => {
    it('outputs empty string with 0 arguments', () => {
      assert.equal(cel.ref(), '');
    });

    it('constructs simple refs', () => {
      assert.equal(cel.ref('request'), 'request');
    });

    it('throws when a number is passed as a first argument', () => {
      assert.throws(() => cel.ref(2));
    });

    it('constructs complex refs', () => {
      assert.equal(cel.ref('request', 'resource'), 'request.resource');
      assert.equal(cel.ref('data', 2, 'prop'), 'data[2].prop');
    });
  });

  describe('#call', () => {
    it('throws with empty ref', () => {
      assert.throws(() => cel.call(''));
    });

    it('constructs a call without arguments', () => {
      assert.equal(cel.call('fn'), 'fn()');
    });

    it('constructs a call with arguments', () => {
      assert.equal(cel.call('fn', 'arg1', 'arg2'), 'fn(arg1,arg2)');
    });
  });

  describe('#calc', () => {
    it('constructs an expression with operators', () => {
      assert.equal(cel.calc('param1', '&&', 'param2'), '(param1&&param2)');
      assert.equal(cel.calc('param1', '||', 'param2'), '(param1||param2)');
      assert.equal(cel.calc('param1', '>', 'param2'), '(param1>param2)');
      assert.equal(cel.calc('param1', '<', 'param2'), '(param1<param2)');
      assert.equal(cel.calc('param1', '==', 'param2'), '(param1==param2)');
      assert.equal(cel.calc('param1', '>=', 'param2'), '(param1>=param2)');
      assert.equal(cel.calc('param1', '<=', 'param2'), '(param1<=param2)');
    });

    it('constructs an expression with keywords', () => {
      assert.equal(cel.calc('param1', 'is', 'param2'), '(param1 is param2)');
      assert.equal(cel.calc('param1', 'in', 'param2'), '(param1 in param2)');
    });

    it('can handle empty operands', () => {
      assert.equal(cel.calc('param1', '&&', ''), 'param1');
      assert.equal(cel.calc('', '&&', 'param2'), 'param2');
    });
  });

  describe('#val', () => {
    it('works just like JSON.stringify() for supported types', () => {
      assert.equal(cel.val(null), JSON.stringify(null));
      assert.equal(cel.val(0), JSON.stringify(0));
      assert.equal(cel.val(''), JSON.stringify(''));
      assert.equal(cel.val([null, 0, '']), JSON.stringify([null, 0, '']));
    });
  });

  describe('#fn', () => {
    it('throws without name', () => {
      assert.throws(() => cel.fn(''));
    });

    it('throws without expression', () => {
      assert.throws(() => cel.fn('fn'));
    });

    it('constructs a function with 0 arguments', () => {
      assert.equal(cel.fn('fn', 'true'), 'function fn(){return true}')
    });

    it('constructs a function with arguments', () => {
      assert.equal(cel.fn('fn', 'arg1', 'arg2', 'true'), 'function fn(arg1,arg2){return true}');
    });
  });
});
