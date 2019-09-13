export type CELOperator = '&&'|'||'|'>'|'<'|'=='|'>='|'<='|'%';
export type CELKeyword = 'is'|'in';
export type CELPrimitive = null|number|string|boolean;
export type CELLiteral = CELPrimitive|CELPrimitive[];

export class CEL {
  public ref(...path: Array<string|number>): string {
    if (typeof path[0] === 'number') {
      throw new Error('cel#ref: reference cannot start with a number');
    }

    return path.reduce((result: string, identifier: string|number) => {
      if (typeof identifier === 'number') {
        result += `[${identifier}]`;
      } else {
        if (result.length > 0) result += '.';
        result += identifier;
      }

      return result;
    }, '');
  }

  public call(reference: string, ...args: string[]): string {
    if (reference.length === 0) throw new Error('cel#call: ref cannot be empty');
    return `${reference}(${args.join(',')})`;
  }

  public calc(operand1: string, operator: CELOperator|CELKeyword, operand2: string): string {
    if (!operand1 || !operand2) return operand1 || operand2;

    let result = `(${operand1}`;

    result += (operator === 'is' || operator === 'in') ? ` ${operator} ` : operator;
    result += `${operand2})`;

    return result;
  }

  public val(value: CELLiteral): string {
    return JSON.stringify(value);
  }

  public fn(name: string, ...params: string[]) {
    if (name.length === 0) throw new Error('cel#fn: name cannot be empty');
    if (params.length === 0) throw new Error('cel#fn: expression is required');

    const expression = params[params.length - 1];
    const args = params.slice(0, -1);

    return `function ${name}(${args.join(',')}){return ${expression}}`;
  }
}

export default new CEL();
