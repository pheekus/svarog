import { JSONSchema7 } from 'json-schema';
import cel from './cel';
import compileType from './compile-type';

export default function(schema: JSONSchema7): string {
  if (typeof schema.$id !== 'string') {
    throw new Error('Schema $id is required to name the validator function');
  }

  const dataRef = cel.ref('d');
  const strictRef = cel.ref('s');
  const validator = compileType(schema, dataRef, strictRef) || cel.val(true);

  return cel.fn(`is${schema.$id}Valid`, dataRef, strictRef, validator);
}
