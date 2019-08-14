import CELAccessor from './accessor';
import { CELExpressionOperand } from './types';

export default class CELFunctionCall {
  public readonly isSimple: boolean = true;

  public accessor: CELAccessor = new CELAccessor();
  public parameters: CELExpressionOperand[] = [];

  constructor(accessor?: CELAccessor, ...parameters: CELExpressionOperand[]) {
    if (accessor) this.accessor = accessor;
    this.parameters = parameters;
  }

  public compile(): string {
    const parameters = this.parameters.map(v => v.compile()).join(',');
    return `${this.accessor.compile()}(${parameters})`;
  }
}
