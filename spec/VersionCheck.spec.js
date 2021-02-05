'use strict';

const VersionCheck = require('../src/VersionCheck');
const Errors = require('../src/Errors');

describe('VersionCheck', () => {

  describe('initialization', function () {
    function checker (config) {
      return (() => new VersionCheck(config)).bind(null);
    }

    it('fails with invalid configuration', async () => {
      const configs = [
        undefined,
        null,
        {},
      ];
      for (const config of configs) {
        expect(checker(config)).toThrow(Errors.Error.invalidConfig);
      }
    });
  });
});
