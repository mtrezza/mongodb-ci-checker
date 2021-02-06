# mongodb-ci-checker <!-- omit in toc -->

[![npm version](https://badge.fury.io/js/mongodb-ci-checker.svg)](https://badge.fury.io/js/mongodb-ci-checker)
[![build status](https://github.com/mtrezza/mongodb-ci-checker/workflows/ci/badge.svg?branch=main)](https://github.com/mtrezza/mongodb-ci-checker/actions?query=workflow%3Aci+branch%3Amain)
[![codecov](https://codecov.io/gh/mtrezza/mongodb-ci-checker/branch/main/graph/badge.svg)](https://codecov.io/gh/mtrezza/mongodb-ci-checker)
[![vulnerabilities](https://snyk.io/test/github/mtrezza/mongodb-ci-checker/badge.svg)](https://snyk.io/test/github/mtrezza/mongodb-ci-checker)
[![dependency up-to-date](https://img.shields.io/librariesio/release/npm/mongodb-ci-checker)](https://libraries.io/npm/mongodb-ci-checker)
[![weekly downloads](https://img.shields.io/npm/dw/mongodb-ci-checker)](https://www.npmjs.com/package/mongodb-ci-checker)

The MongoDB CI Checker checks whether the GitHub CI workflow test environments use the latests MongoDB versions.

# Content <!-- omit in toc -->

- [Installation](#installation)
- [Configuration](#configuration)
  - [Example](#example)
- [Need help?](#need-help)

# Installation

1. Install package:
  ```
  npm install --save-dev mongodb-ci-checker
  ```
2. Add script to `package.json`:
  ```js
  "scripts": {
    "mongodb:ci:checker": "node ./node_modules/mongodb-ci-checker/lib",
    ...
  },
  ```
3. Add task to GitHub CI workflow YAML file:
  ```yaml
  mongodb-ci-checker:
    name: MongoDB CI Checker
    timeout-minutes: 30
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 10
    - name: Install dependencies
      run: npm ci
    - name: Run MongoDB CI Checker
      run: npm run mongodb:ci:checker
      env:
        MONGODB_CI_CHECKER_VERSION_KEY: [...]
        MONGODB_CI_CHECKER_ENV_KEY_PATH: [...]
        MONGODB_CI_CHECKER_YAML_PATH: [...]
        MONGODB_CI_CHECKER_IGNORE_VERSIONS: [...]
  ```

# Configuration

The check is configured via environment variables in the GitHub workflow YAML file:

| Environment Variable               | Type            | Optional | Default | Example Value                          | Description                                                                            |
|------------------------------------|-----------------|----------|---------|----------------------------------------|----------------------------------------------------------------------------------------|
| MONGODB_CI_CHECKER_VERSION_KEY     | `String`        |          |         | `'MONGODB_VERSION'`                    | The name of the environment variable which sets the MongoDB version used for tests.    |
| MONGODB_CI_CHECKER_ENV_KEY_PATH    | `String`        |          |         | `'jobs.tests.strategy.matrix.include'` | The YAML key path to the list of environments which should be checked.                 |
| MONGODB_CI_CHECKER_YAML_PATH       | `String`        |          |         | `'./.github/workflows/ci.yml'`         | The file path to the GitHub CI YAML file.                                              |
| MONGODB_CI_CHECKER_IGNORE_VERSIONS | `Array<String>` | yes      | `[]`    | `'["~4.7.0","<4.0.0"]'`                | The versions to ignore when checking the versions of MongoDB; accepts semver notation. |

## Example

This is an example configuration, where for each of the test environments the MongoDB CI Checker will ensure that the `MONGODB_VERSION` set as environment variable is the latest available patch version and there are environments that cover all recent MongoDB versions.

```yaml
name: CI
on: push
jobs:
  mongodb-ci-checker:
    name: MongoDB CI Checker
    timeout-minutes: 30
    runs-on: ubuntu-18.04
    steps:
    - name: Checkout branch
        uses: actions/checkout@v2
    - name: Set-up node
        uses: actions/setup-node@v1
        with:
          node-version: 10
    - name: Install dependencies
        run: npm ci
    - name: Run MongoDB CI Checker
        run: npm run mongodb:ci:checker
        env:
          MONGODB_CI_CHECKER_VERSION_KEY: 'MONGODB_VERSION'
          MONGODB_CI_CHECKER_ENV_KEY_PATH: 'jobs.tests.strategy.matrix.include'
          MONGODB_CI_CHECKER_YAML_PATH: './github/workflow/ci.yaml'
          MONGODB_CI_CHECKER_IGNORE_VERSIONS: '["~4.7.0"]'
  tests:
    strategy:
      matrix:
        include:
          - name: Test Environment Mongo 4.4
            MONGODB_VERSION: 4.4.3
          - name: Test Environment Mongo 4.2
            MONGODB_VERSION: 4.2.12
          - name: Test Environment Mongo 4.0
            MONGODB_VERSION: 4.0.22
    name: ${{ matrix.name }}
    env:      
      MONGODB_VERSION: ${{ matrix.MONGODB_VERSION }}
    timeout-minutes: 30
    runs-on: ubuntu-18.04
    steps:
      steps:
      - name: Checkout branch
        uses: actions/checkout@v2
      - name: Set-up node
        uses: actions/setup-node@v1
        with:
          node-version: 10
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

As defined above, the tests will be executed in environments with the following MongoDB versions:
- `4.4.3`
- `4.2.12`
- `4.0.22`

The MongoDB CI Check will fail, if:
- There is a newer MongoDB patch version available, such as `4.4.4`, `4.2.13` or `4.0.23`.
- There is a newer MongoDB minor version available, such as `4.5.x`.
- There is a newer MongoDB major version available, such as `5.x.x`.

The MongoDB CI Check will *not* fail, if:
- There is a newer MongoDB version `4.7.x` available because it is excluded in `MONGODB_CI_CHECKER_IGNORE_VERSIONS`.
- There is no environment defined with a MongoDB version `<4.0.0` because versions below the smallest defined minor version `4.0.22` are automatically ignored.

Note:
- Available MongoDB pre-release versions such as release candidates (`x.y.z-rc0`) or alpha/beta versions (`x.y.z-alpha01`) are ignored.

# Need help?

- Ask on StackOverflow using the [mongodb](https://stackoverflow.com/questions/tagged/mongodb) tag.
- Search through existing [issues](https://github.com/mtrezza/mongodb-ci-checker/issues) or open a new issue.