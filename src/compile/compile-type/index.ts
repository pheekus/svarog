import {
  JSONSchema7TypeName,
  JSONSchema7,
} from 'json-schema';

import cel from '../cel';

import compileArray from './compile-array';
import compileBoolean from './compile-boolean';
import compileGeneric from './compile-generic';
import compileNull from './compile-null';
import compileNumeric from './compile-numeric';
import compileString from './compile-string';
import compileObject from './compile-object';

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
  return normalizeTypes(schema.type).reduce((guard, type) => {
    return cel.calc(guard, '||', getCompiler(type)(schema, ref, strictRef));
  }, '');
}
