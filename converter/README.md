# Usage

``` javascript

const converter = require('converter');

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


const testScript = converter(script);
console.log(testScript);
```
