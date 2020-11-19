import {expect, test} from '@oclif/test'

describe('update', () => {
  test
  .stdout()
  .command(['update'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })
})
