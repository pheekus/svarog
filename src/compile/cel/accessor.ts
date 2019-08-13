export default class CELAccessor {
  public path: string[] = [];
  public readonly isSimple: boolean = true;

  constructor(...path: string[]) {
    this.path = path;
  }

  public compile(): string {
    let result = '';

    this.path.forEach(key => {
      if (result !== '' && key[0] !== '[' && key[key.length - 1] !== ']')
        result += '.';
      result += key;
    });

    return result;
  }
}
