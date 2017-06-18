#! /usr/bin/env node

const fs       = require('fs');
const selenium = require('./formats/protractor.js');

function transform(script) {
  const testCase = new selenium.ProtractorTestCase(script);

  return testCase.output();
}

class CLI {
  help() {
    console.log(
`Usage: o9k [inputFile]
`);
  }

  run() {
    const input = process.argv[2];
    if (!input) {
      this.help();
      process.exit(1);
    }

    const builderContent = fs.readFileSync(input, 'utf8');

    console.log(transform(JSON.parse(builderContent)));
  }
}

module.exports = transform;

// If called directly we start the CLI
if (require.main === module) {
  const cli = new CLI();
  cli.run();
}
