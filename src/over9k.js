class Assertion {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    // TODO: Implement correct verify schema
    return {
      type: 'verifyElement',
      // TODO: Implement value identifier
      value: 'over 9000',
      locator: {
        type: 'xpath',
        value: createXPathFromElement(this._element)
      }
    };
  }
}


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

window.events = [];
window.isAssertion = false;

function selectorForButton(e) {
  let buttonText = e.textContent;

  return {
    type: 'xpath',
    value: `//${e.localName}[contains(., "${buttonText}")]`
  };
}

function selectorForInput(e) {
  if (e.name) {
    let label = document.querySelector(`label[for="${e.name}"]`);
    if (label) {
      let labelText = label.textContent;

      return {
        type: 'xpath',
        value: `//label[contains(., "${labelText}")]/following::input[1]`
      }
    } else {
      return {
        type: 'name',
        value: e.name
      };
    }
  }

  if (e.placeholder) {
    return {
      type: 'css selector',
      value: `input[placeholder="${e.placeholder}"]`
    };
  }

  return selectorForXpath(e);
}

function selectorForXpath(e) {
  return {
    type: 'xpath',
    value: createXPathFromElement(e)
  };
}

function selectorsForClickElement(e) {
  if (e.localName === 'input') {
    const buttonTypes = [
      'submit', 'reset', 'image', 'button'
    ];

    if (buttonTypes.includes(e.type)) {
      return selectorForButton(e);
    }

    return selectorForInput(e);
  }

  if (e.localName === 'button') {
    return selectorForButton(e);
  }

  return selectorForXpath(e);
}

function isTextElement(element) {
  return element.localName === 'input';
}

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
      locator: selectorsForClickElement(e.target)
    }
  }

  if (e.type === 'blur') {
    if (!isTextElement(e.target)) {
      // No text setting if bluring on non-input
      return;
    }

    addEvent({
      type: 'setElementText',
      locator: selectorForInput(e.target),
      text: e.target.value
    });
  }
}

function ctrlEventFilter(e) {
  const ui9k = document.querySelector('#ui9k');
  return e.path.includes(ui9k);
}

function addEvent(event) {
  if (!event) return;

  window.events.push(event);
  updateEvents();
}

function trackEvent9k(e) {
  if (ctrlEventFilter(e)) return;

  addEvent(formatEvent9k(e));
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
  let link = document.querySelector('#ui9k-export-builder');
  let content = exportSeleniumBuilder();
  link.href = "data:application/octet-stream," + encodeURIComponent(content);
}

function prepareAssertion() {
  window.isAssertion = true;
}

function assertionEvent(event) {
  if (ctrlEventFilter(event)) return;

  if (window.isAssertion && event.type === 'mouseover') {
    event.target.style['box-shadow'] = 'inset 0px 0px 0px 1px #000';
  } else if (window.isAssertion && event.type === 'mouseout') {
    event.target.style['box-shadow'] = '';
  }
}

function assertionEventSelected(event) {
  if (ctrlEventFilter(event)) return;
  event.preventDefault();

  const assertion = new Assertion(event.target);
  addEvent(assertion.toEvent());

  window.isAssertion = false;

  event.target.style['box-shadow'] = '';
}

function resetEvents() {
  window.events = [];
  window.isAssertion = false;

  addEvent({
    type: 'get',
    url: window.location.pathname
  });
}

function renderEvent(event) {
  switch (event.type) {
    case 'clickElement':
      return `
<li>
  ${event.type}:
  ${event.locator.type}
  ${event.locator.value}
</li>
  `

    case 'get':
      return `
<li>
  ${event.type}:
  ${event.url}
</li>
  `

    case 'setElementText':
      return `
<li>
  ${event.type}:
  ${event.locator.type}
  ${event.locator.value}
  ${event.text}
</li>
  `

    case 'verifyElement':
      return `
<li>
${event.type}:
${event.locator.type}
${event.locator.value}
${event.value}
</li>
  `
  }
}

function renderEvents(events) {
  return events.map(event => renderEvent(event));
}

function updateEvents() {
  document.querySelector('#ui9k-events').innerHTML = renderEvents(window.events);
}

function clickHandler(event) {
  if(!window.isAssertion) {
    trackEvent9k(event);
  } else {
    assertionEventSelected(event);
  }
}

function addUi9k() {
  let ui = `
<div id="ui9k" style="position: absolute; top: 0; left: 0; width: 20%; z-index: 9001; height: 100vh; overflow: auto; box-shadow: 2px 0px 5px 0px rgba(0,0,0,0.75); font-family: 'Roboto', sans-serif; display: flex; flex-direction: column">
  <div style="background: #f8f8f8; padding: 10px 0">
    <div style="padding: 0 20px;">Over 9000</div>
  </div>
  <div>
    <a style="cursor: pointer" onclick="resetEvents()">reset</a>
  </div>
  <div>
    <a style="cursor: pointer" id="ui9k-export-builder" onclick="prepareExport()">Export Selenium Builder</a>
  </div>
  <div>
    <a style="cursor: pointer" onclick="prepareAssertion()">Add Assertion</a>
  </div>
  <ol id="ui9k-events" style="font-size: 10px; overflow: auto">
    ${renderEvents(window.events)}
  </ol>
</div>
`;

  document.body.insertAdjacentHTML('beforeend', ui);
  document.body.style.marginLeft = '20%';
}
document.addEventListener('DOMContentLoaded', addUi9k, true);

document.addEventListener('DOMContentLoaded', trackEvent9k, true);
document.addEventListener('click', clickHandler, true);
document.addEventListener('blur', trackEvent9k, true);
document.addEventListener('focusin', trackEvent9k, true);

document.addEventListener('mouseover', assertionEvent, true);
document.addEventListener('mouseout', assertionEvent, true);


function patchIonic() {
  document.querySelector('[ng-app]').dataset['tapDisabled'] = "true";
}
document.addEventListener('DOMContentLoaded', patchIonic, true);
