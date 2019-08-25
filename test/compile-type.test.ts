import assert from 'assert';

import compileArray from '../src/compile/compile-type/compile-array';
import compileBoolean from '../src/compile/compile-type/compile-boolean';
import compileGeneric from '../src/compile/compile-type/compile-generic';
import compileNull from '../src/compile/compile-type/compile-null';
import compileNumeric from '../src/compile/compile-type/compile-numeric';
import compileObject from '../src/compile/compile-type/compile-object';
import compileString from '../src/compile/compile-type/compile-string';

describe('type compilers', () => {
  describe('array', () => {
    it('compiles basic schema', () => {
      assert.equal(compileArray({ type: 'array' }, 'ref', 's'), '(ref is list)');
    });
  });

  describe('boolean', () => {
    it('compiles basic schema', () => {
      assert.equal(compileBoolean({ type: 'boolean' }, 'ref'), '(ref is bool)');
    });
  });

  describe('generic', () => {
    it('compiles basic schema', () => {
      assert.equal(compileGeneric({}, 'ref', 's'), '');
    });
  });

  describe('null', () => {
    it('compiles basic schema', () => {
      assert.equal(compileNull({ type: 'null' }, 'ref'), '(ref is null)');
    });
  });

  describe('numeric', () => {
    it('compiles basic schema', () => {
      assert.equal(compileNumeric({ type: 'integer' }, 'ref'), '(ref is int)');
      assert.equal(compileNumeric({ type: 'number' }, 'ref'), '((ref is int)||(ref is double))');
    });
  });

  describe('object', () => {
    it('compiles basic schema', () => {
      assert.equal(compileObject({ type: 'object' }, 'ref', 's'), '(ref is map)');
    });
  });

  describe('string', () => {
    it('compiles basic schema', () => {
      assert.equal(compileString({ type: 'string' }, 'ref'), '(ref is string)');
    });
  });
});