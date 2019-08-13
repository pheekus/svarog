import { CELGlobals } from './types';

export default class CELGlobal {
  public readonly isSimple: boolean = true;
  public type: CELGlobals;

  constructor(type: CELGlobals) {
    this.type = type;
  }

  public compile(): string {
    return this.type;
  }
}
