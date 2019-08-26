import {
  JSONSchema7
} from 'json-schema';

import cel from '../cel';

export default function(schema: JSONSchema7, ref: string): string {
  return cel.calc(ref, 'is', 'bool');
}
