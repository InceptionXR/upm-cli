import {Command, flags} from '@oclif/command'
const util = require('util')
const fs = require('fs').promises

export default class UpdateDep extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {name: 'packageName'},
    {name: 'updateVersion'},
  ]

  async run() {
    const {args} = this.parse(UpdateDep)

    const packageName = args.packageName
    let updateVersion = args.updateVersion
    if (updateVersion) {
      if (!await this.verifyVersion(packageName, updateVersion)) {
        return this.error(`Could not resolve version ${args.updateVersion}`)
      }
    }

    updateVersion = updateVersion ?? await this.latestVersion(packageName)
    await this.updatePackage(packageName, updateVersion)
  }

  private async verifyVersion(packageName: string | undefined, version: string) {
    const exec = util.promisify(require('child_process').exec)
    const {stdout, stderr} = await exec(`npm view ${packageName}@${version} version`)

    if (stderr) {
      this.error(stderr)
      return
    }

    return stdout.replace(/\s/g, '') !== ''
  }

  private async latestVersion(packageName: string | undefined) {
    const exec = util.promisify(require('child_process').exec)
    const {stdout, stderr} = await exec(`npm view ${packageName} version`)

    if (stderr) {
      this.error(`error: ${stderr}`)
      return
    }

    return stdout.replace(/\s/g, '')
  }

  private async updatePackage(packageName: string, newVersion: string) {
    const manifestPath = 'package.json'

    try {
      const data = await fs.readFile(manifestPath, 'utf8')
      const manifestJson = JSON.parse(data)
      const prevVersion = manifestJson.dependencies[packageName]
      manifestJson.dependencies[packageName] = newVersion
      const updatedData = JSON.stringify(manifestJson, null, 2)

      await fs.writeFile(manifestPath, updatedData, 'utf8')
      this.log(`Package update (${prevVersion} => ${newVersion})`)

    } catch (error) {
      return this.error(error.message)
    }
  }
}
