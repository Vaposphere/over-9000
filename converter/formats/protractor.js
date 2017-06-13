

const locatorBy = function (locatorType) {
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

module.exports = {
	writeOutput(output) {
		const appendBefore = '    ';

		return `
describe('Selenium Test Case', function() {
  it('should execute test case without errors', function() {
${output.map((s) => `${appendBefore}${s};`).join('\n')}
  });
});`;
	},
	lineForTyp: {
		get({url}) {
			return `browser.get('${url}')`;
		},
		clickElement({locator}) {
			return `element(by.${locatorBy(locator.type)}('${locator.value}')).click()`;
		},
		setElementText({locator, text}){
			return `element(by.${locatorBy(locator.type)}('${locator.value}')).sendKeys('${text}')`;
		}
	},
};
