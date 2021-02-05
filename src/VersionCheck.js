const mongoVersionList = require('mongodb-version-list');
const core = require('@actions/core');
const semver = require('semver');
const yaml = require('yaml');
const fs = require('fs').promises;
const Errors = require('../lib/Errors');

class VersionCheck {

  /**
   * Initializes the MongoDB Version check.
   * @param {Object} options The options.
   * @param {String} options.keyVersion The key to determine the MongoDB version in
   * the CI YAML file.
   * @param {String} options.keyPathEnvironments The key path to determine the
   * environments in the CI YAML file.
   * @param {String} options.pathToYamlFile The file path to the CI YAML file.
   * @param {Array<String>} options.ignoreVersions The versions to ignore.
   */
  constructor(options) {
    const {
      keyVersion,
      keyEnvironments,
      pathToYamlFile,
      ignoreVersions = [],
    } = options;

    // Ensure parameters are set
    if ([keyVersion, keyEnvironments, pathToYamlFile].includes(undefined)) {
      throw Errors.Error.invalidConfig;
    }

    // Set parameters
    this.keyVersion = keyVersion;
    this.keyEnvironments = keyEnvironments;
    this.pathToYamlFile = pathToYamlFile;
    this.ignoreVersions = ignoreVersions;
  }

  /**
   * Returns the released versions of MongoDB by MongoDB; this also
   * includes pre-releases.
   * @return {Array<String>} The released versions.
   */
  async getReleasedVersions () {
    return new Promise((resolve, reject) => {
      mongoVersionList(function(error, versions) {
        if (error) {
          reject(error);
        }
        resolve(versions);
      });
    });
  }

  /**
   * Returns the test environments in the Github CI as specified in the CI
   * GitHub workflow YAML file.
   */
  async getTests() {
    try {
      // Get CI workflow
      const ciYaml = await fs.readFile(this.pathToYamlFile, 'utf-8');
      const ci = yaml.parse(ciYaml);

      // Extract MongoDB versions
      let versions = this.keyEnvironments.split('.').reduce((o,k) => o !== undefined ? o[k] : undefined, ci);
      versions = Object.entries(versions)
        .map(entry => entry[1])
        .filter(entry => entry[this.keyVersion]);

      return versions;
    } catch (e) {
      throw 'Failed to determine MongoDB versions from CI YAML file with error: ' + e;
    }
  }

  /**
   * Returns all minor and major MongoDB versions that are not used in the CI.
   * @param {Array<String>} releasedVersions The released versions.
   * @param {Array<String>} testedVersions The tested versions.
   * @returns {Array<String>} The untested versions.
   */
  getUntestedMinorsAndMajors(releasedVersions, testedVersions) {
    // Get highest tested version
    const highestTested = semver.maxSatisfying(testedVersions, '*');

    // Get all higher released versions (minor & major)
    const higherReleased = releasedVersions.reduce((m, v) => {
      // If the version is a pre-release, skip it
      if ((semver.prerelease(v) || []).length > 0) {
        return m;
      }
      // If the version is not greater than the highest tested version, skip it
      if (!semver.gt(v, highestTested)) {
        return m;
      }
      // If the same or a newer version has already been added, skip it
      if (semver.maxSatisfying(m, `^${v}`) == v) {
        return m;
      }
      // If there is a higher minor released version, skip it
      if (semver.maxSatisfying(releasedVersions, `^${v}`) != v) {
        return m;
      }
      // If version should be ignored, skip it
      if (semver.satisfies(v, this.ignoreVersions.join(' || '))) {
        return m;
      }
      // Add version
      m.push(v);
      return m;
    }, []);

    return higherReleased;
  }

  /**
   * Returns the newest patch version for a given version.
   * @param {Array<String>} versions The versions in which to search.
   * @param {String} version The version for which a newer patch
   * version should be searched.
   * @returns {String|undefined} The newer patch version.
   */
  getNewerPatch(versions, version) {
    const latest = semver.maxSatisfying(versions, `~${version}`);
    return semver.gt(latest, version) ? latest : undefined;
  }

  /**
   * Runs the check.
   */
  async check() {
    try {
      // Get released MongoDB versions
      const releasedVersions = await this.getReleasedVersions();

      // Get tested MongoDB versions from CI
      const tests = await this.getTests();

      // Is true if any of the checks failed
      let failed = false;

      // Check whether each tested version is the latest patch
      for (const test of tests) {
        const version = test[this.keyVersion];
        const newer = this.getNewerPatch(releasedVersions, version);
        if (newer) {
          console.log(`❌ CI environment '${test.name}' uses an old MongoDB patch version ${version} instead of ${newer}.`);
          failed = true;
        } else {
          console.log(`✅ CI environment '${test.name}' uses the newest MongoDB patch version ${version}.`);
        }
      }

      // Check whether there is a newer minor version available that is not tested
      const testedVersions = tests.map(test => test[this.keyVersion]);
      const untested = this.getUntestedMinorsAndMajors(releasedVersions, testedVersions);
      if (untested.length > 0) {
        console.log(`❌ CI does not have environments using the following versions of MongoDB: ${untested.join(', ')}.`);
        failed = true;
      } else {
        console.log(`✅ CI environments use all recent major and minor releases of MongoDB.`);
      }

      if (failed) {
        core.setFailed(
          'CI environments are not up-to-date with newest MongoDB versions.' +
          '\n\nCheck the error messages above and update the MongoDB versions in the CI YAML ' +
          'file. There may be versions of MongoDB that have reached their official MongoDB end-of-life ' +
          'support date and should be removed from the CI; see https://www.mongodb.com/support-policy.'
        );
      }

    } catch (e) {
      core.setFailed('Failed to check MongoDB versions with error: ' + e);
      throw 'Failed to check MongoDB versions with error: ' + e;
    }
  }

  static start() {
    // Get environment variables
    const options = {
      keyVersion: process.env.MONGODB_CI_CHECKER_VERSION_KEY,
      environmentsKeyPath: process.env.MONGODB_CI_CHECKER_ENV_KEY_PATH,
      pathToYamlFile: process.env.MONGODB_CI_CHECKER_YAML_PATH,
      ignoreVersions: process.env.MONGODB_CI_CHECKER_IGNORE_VERSIONS,
    } = process.env;

    // Start check
    new VersionCheck(options).check();
  }
}

export default VersionCheck.prototype.check;
module.exports = VersionCheck.prototype.check;
