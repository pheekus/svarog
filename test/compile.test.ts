import assert from 'assert';

import compile from '../src/compile';

describe('function compiler', () => {
  it('fails without $id', () => {
    assert.throws(() => compile({}));
  });

  it('compiles empty schema', () => {
    assert.equal(
      compile({ $id: 'Sample' }),
      'function isSampleValid(d,s){return true}'
    );
  });

  it('compiles schema with parameters', () => {
    assert.equal(
      compile({ $id: 'Sample', type: 'object', properties: { a: true }}),
      'function isSampleValid(d,s){return (((d is map)&&d.keys().hasOnly(["a"]))&&d.a)}'
    );
  });
});
