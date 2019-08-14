import { Command, flags } from '@oclif/command';
import fs from 'fs';
import glob from 'glob';
import { promisify } from 'util';
import {
  description as packageDescription,
  version as packageVersion
} from '../package.json';
import compile from './compile';

class Svarog extends Command {
  public static description = packageDescription;

  public static flags = {
    force: flags.boolean({
      char: 'f',
      default: false,
      description: 'overwrites the output file if it exists'
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

    if (output && !isOverwriteAllowed && (await promisify(fs.exists)(output))) {
      this.error(
        `Output file ${output} already exists. If you'd like to overwrite it, please use --force next time you run Svarog.`
      );
    }

    if (isVerbose) {
      this.log(`Svarog v${packageVersion}`);

      if (
        output &&
        isOverwriteAllowed &&
        (await promisify(fs.exists)(output))
      ) {
        this.warn(`Using --force flag to overwrite the contents of ${output}`);
      }

      this.log(`Resolving paths for ${input}`);
    }

    const files = await promisify(glob)(input as string);

    if (isVerbose) {
      this.log(`Found ${files.length} file${files.length > 1 ? 's' : ''}`);
    }

    const results: string[] = [];

    for (const file of files) {
      if (isVerbose) this.log(`Processing ${file}`);

      const data: string = await promisify(fs.readFile)(file, {
        encoding: 'utf-8'
      });
      const result = compile(JSON.parse(data));

      results.push(result);
    }

    const rules = results.join('');

    if (output) {
      if (isVerbose) this.log(`Saving to ${output}`);
      await promisify(fs.writeFile)(output, rules);
    } else {
      this.log(rules);
    }

    if (isVerbose) this.log(`Finished in ${Date.now() - timestamp}ms`);
  }
}

export = Svarog;
