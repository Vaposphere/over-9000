const { expect } = require('chai');
const converter = require('../index.js');

describe('Array', function() {
  const script = {
    "type": "script",
    "seleniumVersion": "2",
    "formatVersion": 2,
    "steps": [
      {
        "type": "get",
        "url": "https://addons.mozilla.org/en-GB/firefox/addon/selenium-builder/"
      },
      {
        "type": "clickElement",
        "locator": {
          "type": "link text",
          "value": "Add to Firefox"
        }
      },
      {
        "type": "setElementText",
        "locator": {
          "type": "css selector",
          "value": "input.email"
        },
        text: 'jo'
      }
    ],
    "data": {
      "configs": {},
      "source": "none"
    },
    "inputs": [],
    "timeoutSeconds": 60
  };

  it('should should convert', function() {
    const testScript = converter(script);
    expect(testScript).to.equal("\ndescribe(\'Selenium Test Case\', function() {\n  it(\'should execute test case without errors\', function() {\n    browser.get(\'https://addons.mozilla.org/en-GB/firefox/addon/selenium-builder/\');\n    element(by.linkText(\'Add to Firefox\')).click();\n    element(by.css(\'input.email\')).sendKeys(\'jo\');\n  });\n});");
  });
});
