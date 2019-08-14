import CELAccessor from './accessor';
import CELCondition from './condition';
import CELExpression from './expression';
import CELFunctionCall from './function-call';
import CELGlobal from './global';
import CELList from './list';
import CELLiteral from './literal';

export enum CELGlobals {
  STRING = 'string',
  BOOLEAN = 'bool',
  INTEGER = 'int',
  FLOAT = 'float',
  LIST = 'list'
}

export enum CELOperators {
  AND = '&&',
  OR = '||',
  IS = 'is',
  EQUALS = '==',
  GREATER = '>',
  LESS = '<',
  GREATER_OR_EQUALS = '>=',
  LESS_OR_EQUALS = '<='
}

export type CELExpressionOperand =
  | CELExpression
  | CELAccessor
  | CELLiteral
  | CELGlobal
  | CELFunctionCall
  | CELCondition
  | CELList;
