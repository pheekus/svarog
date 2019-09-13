import {expect, test} from '@oclif/test'

import cmd = require('../')

describe('svarog', () => {
  test
    .do(() => cmd.run([]))
    .catch(() => true)
    .it('fails without parameters')

  test
    .stdout()
    .do(() => cmd.run(['--input="examples/*.json"']))
    .it('runs with minimal configuration')

  test
    .stdout()
    .do(() => cmd.run(['--input="examples/*.json"', '--verbose']))
    .it('can be verbose')
})