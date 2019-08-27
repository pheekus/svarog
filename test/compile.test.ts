import assert from 'assert';
import {
  JSONSchema7
} from 'json-schema';

import compile from '../src/compile';

describe('function compiler', () => {
  it('compiles empty schema', () => {
    assert.equal(
      compile([{ $id: 'Sample' }]),
      [
        'function _s0(d,s){return true}',
        'function _s(n,d,s){return ((n=="Sample")&&_s0(d,s))}',
        'function isValid(n){return _s(n,request.resource.data,(request.method=="create"))}'
      ].join('')
    );

    assert.equal(
      compile([{}]),
      [
        'function _s0(d,s){return true}',
        'function _s(n,d,s){return ((n=="Schema0")&&_s0(d,s))}',
        'function isValid(n){return _s(n,request.resource.data,(request.method=="create"))}'
      ].join('')
    );
  });

  it('compiles schema with parameters', () => {
    assert.equal(
      compile([{ $id: 'Sample', type: 'object', properties: { a: true }}]),
      [
        'function _s0(d,s){return (((d is map)&&d.keys().hasOnly(["a"]))&&d.a)}',
        'function _s(n,d,s){return ((n=="Sample")&&_s0(d,s))}',
        'function isValid(n){return _s(n,request.resource.data,(request.method=="create"))}'
      ].join('')
    );
  });

  it('supports options', () => {
    assert.equal(
      compile([{ $id: 'Sample' }], {
        interface: 'validate',
        router: 'getValidator',
        getGuardName: (s: JSONSchema7, i: number) => `is${s.$id}Valid`,
        getSchemaId: (s: JSONSchema7, i: number) => `${s.$id}Schema`,
       }),
      [
        'function isSampleValid(d,s){return true}',
        'function getValidator(n,d,s){return ((n=="SampleSchema")&&isSampleValid(d,s))}',
        'function validate(n){return getValidator(n,request.resource.data,(request.method=="create"))}'
      ].join('')
    );
  });
});
