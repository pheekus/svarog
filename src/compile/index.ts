import { JSONSchema7 } from 'json-schema';
import { CELAccessor, CELFunction } from './cel';
import compileType from './compile-type';

export default function(schema: JSONSchema7): string {
  const shortcut = 'd';
  const name = `is${schema.$id}Valid`;
  const expression = compileType(new CELAccessor(shortcut), schema, true);

  return new CELFunction(name, [shortcut], expression).compile();
}
