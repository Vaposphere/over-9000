const locatorBy = function(locatorType) {
  switch (locatorType) {
    case "xpath":
      return "xpath";
    case "id":
      return "id";
    case "css selector":
      return "css";
    case "link text":
      return "linkText";
    case "class":
      return "className";
    case "name":
      return "name";
  }
};

class ProtractorSteps {
  static get({url}) {
    return `browser.get('${url}');`;
  }

  static clickElement({locator}) {
    return `element(by.${locatorBy(locator.type)}('${locator.value}')).click();`;
  }

  static setElementText({locator, text}){
    return `element(by.${locatorBy(locator.type)}('${locator.value}')).sendKeys('${text}');`;
  }

  static assertElementValue({locator, value}){
    const output = `element(by.${locatorBy(locator.type)}('${locator.value}')).getAttribute('value')`;
    return `expect(${output}).toEqual('${value}');`;
  }
}

class ProtractorTestCase {
  constructor(builderFile) {
    this._steps = builderFile.steps;
  }

  transformStep(step) {
    const stepProc = ProtractorSteps[step.type];
    if (stepProc) {
      return stepProc(step);
    } else {
      console.warn(`Unknown step: ${step.type}`);
      return '';
    }
  }

  transformSteps() {
    return this._steps.map(step => this.transformStep(step));
  }

  output() {
    const outputSteps = this.transformSteps();
    // TODO: properly indent multiline steps
    const indentedSteps = outputSteps.map(step => `    ${step}`);

    const header = `
describe('Selenium Test Case', function() {
  it('should execute test case without errors', function() {
`;
    const footer = `
  });
});
`;

    return `
${header}
${indentedSteps.join('\n')}
${footer}
`
  }
};

module.exports = {
  ProtractorTestCase
};
