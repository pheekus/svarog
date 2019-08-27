import { JSONSchema7 } from 'json-schema';
import cel from './cel';
import compileType from './compile-type';

function createGuard(ref: string, schema: JSONSchema7): string {
  const dataRef = 'd';
  const strictRef = 's';
  const validator = compileType(schema, dataRef, strictRef) || cel.val(true);

  return cel.fn(ref, dataRef, strictRef, validator);
}

function createRouter(ref: string, guards: Map<string, string>): string {
  const nameRef = 'n';
  const dataRef = 'd';
  const strictRef = 's';

  let condition = '';

  guards.forEach((fn, name) => {
    const nameCheck = cel.calc(nameRef, '==', cel.val(name));
    const call = cel.call(fn, dataRef, strictRef);
    condition = cel.calc(condition, '||', cel.calc(nameCheck, '&&', call));
  });

  return cel.fn(ref, nameRef, dataRef, strictRef, condition);
}

function createInterface(ref: string, routerRef: string): string {
  const nameRef = 'n';
  const dataRef = cel.ref('request', 'resource', 'data');
  const strictRef = cel.calc(cel.ref('request', 'method'), '==', cel.val('create'));

  return cel.fn(ref, nameRef, cel.call(routerRef, nameRef, dataRef, strictRef));
}

export type CompilerOptions = {
  interface: string,
  router: string,
  getGuardName: (schema: JSONSchema7, i: number) => string;
  getSchemaId: (schema: JSONSchema7, i: number) => string;
}

export const defaultOptions: CompilerOptions = {
  interface: 'isValid',
  router: '_s',
  getGuardName: (s, i) => `_s${i}`,
  getSchemaId: (s, i) => s.$id || `Schema${i}`,
}

export default function(schemas: JSONSchema7[], options: Partial<CompilerOptions> = defaultOptions): string {
  const compilerOptions: CompilerOptions = Object.assign({}, defaultOptions, options);
  const guards: Map<string, string> = new Map();
  const output: string[] = [];

  schemas.forEach((schema: JSONSchema7, i: number) => {
    const fnRef = compilerOptions.getGuardName(schema, i);
    const schemaName = compilerOptions.getSchemaId(schema, i);

    guards.set(schemaName, fnRef);
    output.push(createGuard(fnRef, schema));
  });

  output.push(
    createRouter(compilerOptions.router, guards),
    createInterface(compilerOptions.interface, compilerOptions.router),
  );

  return output.join('');
}
