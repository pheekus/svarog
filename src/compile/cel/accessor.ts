import { CELFunctionCall } from '.';

type CELAccessorPath = string | CELFunctionCall;

export default class CELAccessor {
  public path: CELAccessorPath[] = [];
  public readonly isSimple: boolean = true;

  constructor(...path: CELAccessorPath[]) {
    this.path = path;
  }

  public compile(): string {
    let result = '';

    this.path.forEach(key => {
      const compiledKey = typeof key === 'string' ? key : key.compile();
      if (result !== '' && compiledKey[0] !== '[' && compiledKey[compiledKey.length - 1] !== ']')
        result += '.';
      result += compiledKey;
    });

    return result;
  }
}
