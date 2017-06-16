const selenium = require('./formats/protractor.js');

module.exports = function(script) {
  const testCase = new selenium.ProtractorTestCase(script);

  return testCase.output();
}
