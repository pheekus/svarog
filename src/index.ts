import { Command, flags } from '@oclif/command';
import fs from 'fs';
import glob from 'glob';
import { JSONSchema7 } from 'json-schema';
import outdent from 'outdent';
import { promisify } from 'util';
import { description as packageDescription } from '../package.json';
import compile from './compile';

const packageVersion = '1.0.0';

class Svarog extends Command {
  public static description = packageDescription;

  public static flags = {
    force: flags.boolean({
      char: 'f',
      default: false,
      description: 'overwrites existing Svarog code unconditionally'
    }),
    help: flags.help({
      char: 'h',
      description: 'displays this message'
    }),
    verbose: flags.boolean({
      char: 'v',
      default: false,
      description: 'enables progress logs during compilation'
    })
  };

  public static args = [
    {
      description: 'input file containing JSON Schema or a glob pattern',
      name: 'input',
      required: true
    },
    {
      description: 'target file where Svarog will output security rule helpers',
      name: 'output',
      required: false
    }
  ];

  public async run() {
    const timestamp = Date.now();
    const command = this.parse(Svarog);

    const input = command.args.input as string;
    const output = command.args.output;
    const isVerbose = command.flags.verbose;
    const isOverwriteAllowed = command.flags.force;
    const isOutputEmpty = !(await promisify(fs.exists)(output));

    if (isVerbose) {
      this.log(`Svarog v${packageVersion}`);
      this.log(`Resolving paths for ${input}`);
    }

    const files = await promisify(glob)(input as string);

    if (isVerbose) {
      this.log(`Found ${files.length} file${files.length > 1 ? 's' : ''}`);
    }

    const schemas: JSONSchema7[] = [];

    for (const file of files) {
      if (isVerbose) this.log(`Reading ${file}`);
      const data: string = await promisify(fs.readFile)(file, { encoding: 'utf-8' });
      schemas.push(JSON.parse(data));
    }

    const rules = ([
      `// <svarog version="${packageVersion}">`,
      compile(schemas),
      '// </svarog>'
    ]).join('\n');

    if (output && isOutputEmpty) {
      if (isVerbose) this.log(`Creating ${output}`);
      await promisify(fs.writeFile)(output, rules);
    } else if (output && !isOutputEmpty) {
      const outputContent = await promisify(fs.readFile)(output, {
        encoding: 'utf-8'
      });
      const svarogRegex = /\/\/\s<svarog version="(\d)\.(\d)\.(\d)">\n(.*)\n\/\/\s<\/svarog>/gm;
      const svarogInfo = svarogRegex.exec(outputContent);

      if (svarogInfo === null) {
        if (isVerbose) this.log(`Appending Svarog to ${output}`);
        await promisify(fs.writeFile)(output, `${outputContent}\n\n${rules}`);
      } else {
        const oldVersion = svarogInfo.slice(1, 4).join('.');
        const oldMajorVersion = parseInt(svarogInfo[1], 10);
        const newMajorVersion = parseInt(packageVersion.split('.')[0], 10);
        const canOverwrite =
          oldVersion === packageVersion ||
          (oldMajorVersion === newMajorVersion && oldMajorVersion > 0);

        if (canOverwrite || isOverwriteAllowed) {
          if (isVerbose) this.log(`Updating Svarog in ${output}`);

          const newContent = outputContent.replace(svarogInfo[0], rules);
          await promisify(fs.writeFile)(output, newContent);
        } else {
          this.error(outdent`
            Output file contains a different major or pre-release version of Svarog,
            and replacing it might break your configuration. If you know what you're doing,
            please use --force flag next time.
          `);
        }
      }
    } else {
      this.log(rules);
    }

    if (isVerbose) this.log(`Finished in ${Date.now() - timestamp}ms`);
  }
}

export = Svarog;
