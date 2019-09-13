import assert from 'assert';

import compileArray from '../src/compile-type/compile-array';
import compileBoolean from '../src/compile-type/compile-boolean';
import compileGeneric from '../src/compile-type/compile-generic';
import compileNull from '../src/compile-type/compile-null';
import compileNumeric from '../src/compile-type/compile-numeric';
import compileObject from '../src/compile-type/compile-object';
import compileString from '../src/compile-type/compile-string';
import compileTimestamp from '../src/compile-type/compile-timestamp';
import compileBytes from '../src/compile-type/compile-bytes';
import compileLatLng from '../src/compile-type/compile-lat-lng';
import compilePath from '../src/compile-type/compile-path';
import compileType from '../src/compile-type';

describe('type compilers', () => {
  describe('firestore.timestamp', () => {
    it('compiles basic schema', () => {
      assert.equal(compileTimestamp({
        definitions: { Timestamp: {}},
        $ref: '#/definitions/Timestamp'
      }, 'ref'), '(ref is timestamp)');
    });
  });

  describe('firestore.bytes', () => {
    it('compiles basic schema', () => {
      assert.equal(compileBytes({
        definitions: { Bytes: {}},
        $ref: '#/definitions/Bytes'
      }, 'ref'), '(ref is bytes)');
    });
  });

  describe('firestore.latlng', () => {
    it('compiles basic schema', () => {
      assert.equal(compileLatLng({
        definitions: { LatLng: {}},
        $ref: '#/definitions/LatLng'
      }, 'ref'), '(ref is latlng)');
    });
  });

  describe('firestore.path', () => {
    it('compiles basic schema', () => {
      assert.equal(compilePath({
        definitions: { Path: {}},
        $ref: '#/definitions/Path'
      }, 'ref'), `((ref is map)&&(ref.keys().hasOnly(["path"])&&(ref.path is path)))`);
    });
  });

  describe('array', () => {
    it('compiles basic schema', () => {
      assert.equal(compileArray({ type: 'array' }, 'ref', 's'), '(ref is list)');
    });

    it('supports "minItems"', () => {
      assert.equal(
        compileArray({ type: 'array', minItems: 0 }, 'ref', 's'),
        '((ref is list)&&(ref.size()>=0))'
      );
    });

    it('supports "maxItems"', () => {
      assert.equal(
        compileArray({ type: 'array', maxItems: 1 }, 'ref', 's'),
        '((ref is list)&&(ref.size()<=1))'
      );
    });

    it('supports "items"', () => {
      assert.equal(
        compileArray({ type: 'array', items: [true, { type: 'boolean' }]}, 'ref', 's'),
        '((((ref is list)&&(ref.size()==2))&&ref[0])&&(ref[1] is bool))'
      );
    });

    it('supports "additionalItems"', () => {
      assert.equal(
        compileArray({ type: 'array', items: [true, { type: 'boolean' }], additionalItems: true }, 'ref', 's'),
        '((((ref is list)&&(ref.size()>=2))&&ref[0])&&(ref[1] is bool))'
      );
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

    it('supports "enum"', () => {
      assert.equal(
        compileGeneric({ enum: [0, '1', true, false, null] }, 'ref', 's'),
        '(((((ref==0)||(ref=="1"))||(ref==true))||(ref==false))||(ref==null))'
      );
      assert.equal(
        compileGeneric({ enum: [{ a: 0, b: '1', c: true, d: false, e: null }] }, 'ref', 's'),
        '(((((ref.a==0)&&(ref.b=="1"))&&(ref.c==true))&&(ref.d==false))&&(ref.e==null))'
      );
      assert.equal(
        compileGeneric({ enum: [[0, '1', true, false, null]] }, 'ref', 's'),
        '(((((ref[0]==0)&&(ref[1]=="1"))&&(ref[2]==true))&&(ref[3]==false))&&(ref[4]==null))'
      );
    });

    it('supports "const"', () => {
      assert.equal(compileGeneric({ const: 0 }, 'ref', 's'), '(ref==0)');
      assert.equal(compileGeneric({ const: '1' }, 'ref', 's'), '(ref=="1")');
      assert.equal(compileGeneric({ const: true }, 'ref', 's'), '(ref==true)');
      assert.equal(compileGeneric({ const: false }, 'ref', 's'), '(ref==false)');
      assert.equal(compileGeneric({ const: null }, 'ref', 's'), '(ref==null)');

      assert.equal(
        compileGeneric({ const: { a: 0, b: '1', c: true, d: false, e: null } }, 'ref', 's'),
        '(((((ref.a==0)&&(ref.b=="1"))&&(ref.c==true))&&(ref.d==false))&&(ref.e==null))'
      );

      assert.equal(
        compileGeneric({ const: [0, '1', true, false, null] }, 'ref', 's'),
        '(((((ref[0]==0)&&(ref[1]=="1"))&&(ref[2]==true))&&(ref[3]==false))&&(ref[4]==null))'
      );
    });

    it('supports "allOf"', () => {
      assert.equal(
        compileGeneric({ type: 'integer', allOf: [true, { maximum: 1 }] }, 'ref', 's'),
        '((ref is int)&&(ref<=1))'
      );

      assert.equal(
        compileGeneric({ type: 'integer', allOf: [{ minimum: 0 }, { maximum: 1 }] }, 'ref', 's'),
        '(((ref is int)&&(ref>=0))&&((ref is int)&&(ref<=1)))'
      );
    });

    it('supports "anyOf"', () => {
      assert.equal(
        compileGeneric({ type: 'integer', anyOf: [true, { maximum: 1 }] }, 'ref', 's'),
        '((ref is int)&&(ref<=1))'
      );

      assert.equal(
        compileGeneric({ type: 'integer', anyOf: [{ minimum: 0 }, { maximum: 1 }] }, 'ref', 's'),
        '(((ref is int)&&(ref>=0))||((ref is int)&&(ref<=1)))'
      );
    });

    it('supports "not"', () => {
      assert.equal(
        compileGeneric({ type: 'integer', not: { minimum: 0 }}, 'ref', 's'),
        '(((ref is int)&&(ref>=0))==false)'
      );
    });
  });

  describe('null', () => {
    it('compiles basic schema', () => {
      assert.equal(compileNull({ type: 'null' }, 'ref'), '(ref==null)');
    });
  });

  describe('numeric', () => {
    it('compiles basic schema', () => {
      assert.equal(compileNumeric({ type: 'integer' }, 'ref'), '(ref is int)');
      assert.equal(compileNumeric({ type: 'number' }, 'ref'), '((ref is int)||(ref is float))');
      assert.equal(compileNumeric({ type: ['integer', 'number'] }, 'ref'), '((ref is int)||(ref is float))');
    });

    it('supports "minimum"', () => {
      assert.equal(
        compileNumeric({ type: 'integer', minimum: 0 }, 'ref'),
        '((ref is int)&&(ref>=0))'
      );
      assert.equal(
        compileNumeric({ type: 'number', minimum: 0 }, 'ref'),
        '(((ref is int)||(ref is float))&&(ref>=0))'
      );
    });

    it('supports "maximum"', () => {
      assert.equal(
        compileNumeric({ type: 'integer', maximum: 0 }, 'ref'),
        '((ref is int)&&(ref<=0))'
      );
      assert.equal(
        compileNumeric({ type: 'number', maximum: 0 }, 'ref'),
        '(((ref is int)||(ref is float))&&(ref<=0))'
      );
    });

    it('supports "exclusiveMinimum"', () => {
      assert.equal(
        compileNumeric({ type: 'integer', exclusiveMinimum: 0 }, 'ref'),
        '((ref is int)&&(ref>0))'
      );
      assert.equal(
        compileNumeric({ type: 'number', exclusiveMinimum: 0 }, 'ref'),
        '(((ref is int)||(ref is float))&&(ref>0))'
      );
    });

    it('supports "exclusiveMaximum"', () => {
      assert.equal(
        compileNumeric({ type: 'integer', exclusiveMaximum: 0 }, 'ref'),
        '((ref is int)&&(ref<0))'
      );
      assert.equal(
        compileNumeric({ type: 'number', exclusiveMaximum: 0 }, 'ref'),
        '(((ref is int)||(ref is float))&&(ref<0))'
      );
    });

    it('supports "multipleOf"', () => {
      assert.equal(
        compileNumeric({ type: 'integer', multipleOf: 2 }, 'ref'),
        '((ref is int)&&((ref%2)==0))'
      );
    });
  });

  describe('object', () => {
    it('compiles basic schema', () => {
      assert.equal(compileObject({ type: 'object' }, 'ref', 's'), '(ref is map)');
    });

    it('supports "properties"', () => {
      assert.equal(
        compileObject({ type: 'object', properties: { a: true, b: true }}, 'ref', 's'),
        '((((ref is map)&&ref.keys().hasOnly(["a","b"]))&&ref.a)&&ref.b)'
      );
      assert.equal(
        compileObject({ type: 'object', properties: { a: { type: 'boolean' }}}, 'ref', 's'),
        '(((ref is map)&&ref.keys().hasOnly(["a"]))&&(ref.a&&(ref.a is bool)))'
      );
    });

    it('supports "minProperties"', () => {
      assert.equal(
        compileObject({ type: 'object', minProperties: 0 }, 'ref', 's'),
        '((ref is map)&&(ref.keys().size()>=0))'
      );
    });

    it('supports "maxProperties"', () => {
      assert.equal(
        compileObject({ type: 'object', maxProperties: 0 }, 'ref', 's'),
        '((ref is map)&&(ref.keys().size()<=0))'
      );
    });

    it('supports "required"', () => {
      assert.equal(
        compileObject({ type: 'object', properties: { a: { type: 'boolean' }}, required: ['a']}, 'ref', 's'),
        '(((ref is map)&&ref.keys().hasOnly(["a"]))&&((s||ref.keys().hasAll(["a"]))&&(ref.a is bool)))'
      );
    });
  });

  describe('string', () => {
    it('compiles basic schema', () => {
      assert.equal(compileString({ type: 'string' }, 'ref'), '(ref is string)');
    });

    it('supports "minLength"', () => {
      assert.equal(
        compileString({ type: 'string', minLength: 0 }, 'ref'),
        '((ref is string)&&(ref.size()>=0))'
      );
    });

    it('supports "maxLength"', () => {
      assert.equal(
        compileString({ type: 'string', maxLength: 0 }, 'ref'),
        '((ref is string)&&(ref.size()<=0))'
      );
    });

    it('supports "pattern"', () => {
      assert.equal(
        compileString({ type: 'string', pattern: '.*@domain[.]com' }, 'ref'),
        '((ref is string)&&ref.matches(".*@domain[.]com"))'
      );
    });
  });

  describe('universal', () => {
    it('compiles empty schemas', () => {
      assert.equal(compileType({}, 'ref', 's'), '');
    });

    it('compiles single-type schemas', () => {
      assert.equal(compileType({ type: 'array' }, 'ref', 's'), '(ref is list)');
      assert.equal(compileType({ type: 'boolean' }, 'ref', 's'), '(ref is bool)');
      assert.equal(compileType({ type: 'null' }, 'ref', 's'), '(ref==null)');
      assert.equal(compileType({ type: 'integer' }, 'ref', 's'), '(ref is int)');
      assert.equal(compileType({ type: 'number' }, 'ref', 's'), '((ref is int)||(ref is float))');
      assert.equal(compileType({ type: 'string' }, 'ref', 's'), '(ref is string)');
    });

    it('compiles schemas with multiple types', () => {
      assert.equal(
        compileType({ type: ['boolean','integer'] }, 'ref', 's'),
        '((ref is bool)||(ref is int))'
      );
    });
  });
});
