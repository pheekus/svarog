import { JSONSchema7 } from 'json-schema';
import cel from './cel';
import compileType from './compile-type';

export default function(schema: JSONSchema7): string {
  const dataRef = cel.ref('d');
  const strictRef = cel.ref('s');
  const validator = compileType(schema, dataRef, strictRef);

  return cel.fn(`is${schema.$id}Valid`, dataRef, strictRef, validator);
}
