function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
    {
        if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n=0;n < allNodes.length;n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                    if (uniqueIdCount > 1) break;
                };
                if ( uniqueIdCount == 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return segs.join('/');
                } else {
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            let i;
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling)
            {
              if (sib.localName == elm.localName)  i++;
            };
              segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        };
    };
    return segs.length ? '/' + segs.join('/') : null;
};

function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return  result.singleNodeValue;
}

window.events = [];
window.rawEvents = [];

function formatEvent9k(e) {
  if (e.type === 'DOMContentLoaded') {
    return {
      type: 'get',
      url: window.location.pathname
    }
  }

  if (e.type === 'click') {
    return {
      type: 'clickElement',
      locator: {
        type: 'xpath',
        value: createXPathFromElement(e.target)
      }
    }
  }

  if (e.type === 'focusout') {
    return {
      type: 'setElementText',
      locator: {
        type: 'xpath',
        value: createXPathFromElement(e.target)
      },
      text: e.target.value
    }
  }
}

function trackEvent9k(e) {
  let event = formatEvent9k(e);
  if (event) {
    window.events.push(event);
  }

  window.rawEvents.push(e);
}

function exportSeleniumBuilder() {
  let result = {
    type: "script",
    seleniumVersion: "2",
    formatVersion: 2,
    steps: window.events,
    data: {
      configs: {},
      source: "none"
    },
    inputs: [],
    timeoutSeconds: 60
  }

  return JSON.stringify(result, null, '  ');
}

function prepareExport() {
  let link = document.querySelector('#ui9k-link');
  let content = exportSeleniumBuilder();
  link.href = "data:application/octet-stream," + encodeURIComponent(content);
}

function resetEvents() {
  window.events = [];
  window.rawEvents = [];
}

function addUi9k() {
  let ui = `
<div style="position: absolute; top: 0; left: 0; width: 20%; z-index: 9001">
  <div>
    <a href="#" onclick="resetEvents()">reset</a>
  </div>
  <div>
    <a id="ui9k-link" href="#" onclick="prepareExport()">Export Selenium Builder</a>
  </div>
</div>
`;

  document.body.insertAdjacentHTML('beforeend', ui);
  document.body.style.marginLeft = '20%';
}
document.addEventListener('DOMContentLoaded', addUi9k);

document.addEventListener('DOMContentLoaded', trackEvent9k);
document.addEventListener('click', trackEvent9k);
document.addEventListener('focusin', trackEvent9k);
document.addEventListener('focusout', trackEvent9k);

