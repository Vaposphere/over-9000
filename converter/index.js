const selenium = require('./formats/protractor.js');

module.exports = function(script) {
  let output = [];
  script.steps.forEach((step) => {
    output.push(selenium.lineForTyp[step.type](step));
  });


  return selenium.writeOutput(output);
}
