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
`Usage: o9k [options] [inputFile]

Options:
  --fit                                              Use "fit" for focused running instead of "it"
`);
  }

  run() {
    let fit = false;

    process.argv.shift();

    if (process.argv[1] === '--fit') {
      fit = true;
      process.argv.shift();
    }

    const input = process.argv[1];
    if (!input) {
      this.help();
      process.exit(1);
    }

    const builderFile = fs.readFileSync(input, 'utf8');
    const builderContent = JSON.parse(builderFile);

    const testCase = new selenium.ProtractorTestCase(builderContent);
    const output = testCase.output({fit});

    console.log(output);
  }
}

module.exports = transform;

// If called directly we start the CLI
if (require.main === module) {
  const cli = new CLI();
  cli.run();
}
