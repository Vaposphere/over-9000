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
        text: 'test@example.com'
      },
      {
        "type": "assertElementValue",
        "locator": {
          "type": "css selector",
          "value": "input.email"
        },
        value: 'test@example.com'
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
    expect(testScript).to.equal(
`

describe(\'Selenium Test Case\', function() {
  it(\'should execute test case without errors\', function() {

    browser.get(\'https://addons.mozilla.org/en-GB/firefox/addon/selenium-builder/\');
    element(by.linkText(\'Add to Firefox\')).click();
    element(by.css(\'input.email\')).sendKeys(\'test@example.com\');
    expect(element(by.css(\'input.email\')).getAttribute('value')).toEqual('test@example.com');

  });
});

`);
  });
});
