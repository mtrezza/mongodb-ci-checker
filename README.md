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
- [Need help?](#need-help)

# Installation

1. Install package:
    ```
    npm install --save mongodb-ci-checker
    ```
2. Add script to `package.json`:
    ```js
    "scripts": {
        "ci:mongodb:checker": "node ./node_modules/mongodb-ci-checker/lib",
        ...
    },
    ```
3. Add task to GitHub CI workflow YAML file:
    ```yaml
    ci-check:
        name: MongoDB CI Check
        timeout-minutes: 30
        runs-on: ubuntu-18.04
        steps:
        - name: Checkout repo
            uses: actions/checkout@v2
        - name: Set-up node
            uses: actions/setup-node@v1
                with:
                    node-version: 10
        - name: Install dependencies
            run: npm ci
        - name: Run MongoDB CI Checker
            run: npm run ci:mongodb:checker
            env:
                MONGODB_CI_CHECKER_VERSION_KEY: [...]
                MONGODB_CI_CHECKER_ENV_KEY_PATH: [...]
                MONGODB_CI_CHECKER_YAML_PATH: [...]
                MONGODB_CI_CHECKER_IGNORE_VERSIONS: [...]
    ```

# Configuration

The check is configured via environment variables in the GitHub workflow YAML file:

| Environment Variable               | Type          | Optional | Default | Example Value                         |
|------------------------------------|---------------|----------|---------|---------------------------------------|
| MONGODB_CI_CHECKER_VERSION_KEY     | String        |          |         | 'MONGODB_VERSION'                     |
| MONGODB_CI_CHECKER_ENV_KEY_PATH    | String        |          |         | 'jobs.tests.strategy.matrix.include'; |
| MONGODB_CI_CHECKER_YAML_PATH       | String        |          |         | './.github/workflows/ci.yml'          |
| MONGODB_CI_CHECKER_IGNORE_VERSIONS | Array<String> | yes      | []      | ['~4.7.0']                            |

# Need help?

- Ask on StackOverflow using the [mongodb](https://stackoverflow.com/questions/tagged/mongodb) tag.
- Search through existing [issues](https://github.com/mtrezza/mongodb-ci-checker/issues) or open a new issue.