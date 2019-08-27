import {
  JSONSchema7,
  JSONSchema7TypeName,
} from 'json-schema';

import cel from '../cel';

import compileArray from './compile-array';
import compileBoolean from './compile-boolean';
import compileBytes from './compile-bytes';
import compileGeneric from './compile-generic';
import compileLatLng from './compile-lat-lng';
import compileNull from './compile-null';
import compileNumeric from './compile-numeric';
import compileObject from './compile-object';
import compileReference from './compile-path';
import compileString from './compile-string';
import compileTimestamp from './compile-timestamp';

export type Compiler = (
  schema: JSONSchema7,
  ref: string,
  strictRef: string,
) => string;

function getCompiler(type: JSONSchema7TypeName): Compiler {
  let compiler = compileGeneric;

  if (type === 'array') compiler = compileArray;
  if (type === 'boolean') compiler = compileBoolean;
  if (type === 'null') compiler = compileNull;
  if (type === 'integer' || type === 'number') compiler = compileNumeric;
  if (type === 'string') compiler = compileString;
  if (type === 'object') compiler = compileObject;

  if (compiler === compileGeneric) return compiler;

  return (...args) => cel.calc(compileGeneric(...args), '&&', compiler(...args));
}

function normalizeTypes(type?: JSONSchema7TypeName|JSONSchema7TypeName[]): JSONSchema7TypeName[] {
  if (typeof type === 'string') return [type];
  if (Array.isArray(type)) return type;
  return [];
}

export default function(schema: JSONSchema7, ref: string, strictRef: string) {
  if (schema.$ref === '#/definitions/Timestamp') return compileTimestamp(schema, ref);
  if (schema.$ref === '#/definitions/Bytes') return compileBytes(schema, ref);
  if (schema.$ref === '#/definitions/LatLng') return compileLatLng(schema, ref);
  if (schema.$ref === '#/definitions/Path') return compileReference(schema, ref);

  return normalizeTypes(schema.type).reduce((guard, type) => {
    return cel.calc(guard, '||', getCompiler(type)(schema, ref, strictRef));
  }, '');
}
