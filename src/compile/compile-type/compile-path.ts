import {
  JSONSchema7
} from 'json-schema';

import cel from '../cel';

export default function(schema: JSONSchema7, ref: string): string {
  const map = cel.calc(ref, 'is', 'map');
  const withPath = cel.calc(cel.ref(ref, 'path'), 'is', 'string');

  return cel.calc(map, '&&', withPath);
}
