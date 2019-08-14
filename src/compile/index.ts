import { JSONSchema7 } from 'json-schema';
import { CELAccessor, CELFunction } from './cel';
import compileType from './compile-type';

export default function(schema: JSONSchema7): string {
  const shortcut = new CELAccessor('d');
  const strict = new CELAccessor('s');
  const name = `is${schema.$id}Valid`;
  const expression = compileType(shortcut, strict, schema, null);

  return new CELFunction(name, [shortcut, strict], expression).compile();
}
