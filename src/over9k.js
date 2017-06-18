class ElementLocator {
  constructor(element) {
    this._element = element;
  }

  byXpath() {
    return {
      type: 'xpath',
      value: createXPathFromElement(this._element)
    };
  }

  byText() {
    const text = this._element.textContent;

    return {
      type: 'xpath',
      value: `//${this._element.localName}[contains(., "${text}")]`
    };
  }

  byId() {
    return {
      type: 'id',
      value: this._element.id
    };
  }

  byName() {
    return {
      type: 'name',
      value: this._element.name
    };
  }

  byPlaceholder() {
    return {
      type: 'css selector',
      value: `input[placeholder="${this._element.placeholder}"]`
    };
  }

  byLink() {
    const title = this._element.textContent;
    if (title) {
      return this.byText();
    }

    const href = this._element.href;
    return {
      type: 'css selector',
      value: `a[href="${href}"]`
    };
  }

  byImage() {
    const alt = this._element.alt;
    if (alt) {
      return {
        type: 'css selector',
        value: `img[alt="${alt}"]`
      };
    }

    // Use `attributes` to get src as in HTML, not normalized by DOM
    const src = this._element.attributes['src'].value;
    return {
      type: 'css selector',
      value: `img[src="${src}"]`
    };
  }

  byLabelText() {
      const text = this._element.textContent;

      return {
        type: 'xpath',
        value: `//input[@id=(//label[contains(., "${labelText}")]/@for)]`
      };
  }
}

class BodyTextAssertion {
  toEvent() {
    const bodyText = document.documentElement.innerText;
    const o9kUiText = window.o9kUi.innerText;
    const appBodyText = bodyText.substring(0, bodyText.lastIndexOf(o9kUiText));

    return {
      type: 'assertBodyText',
      text: appBodyText
    }
  }
}

class TextAssertion {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'assertText',
      locator: selectorsForClickElement(this._element),
      text: this._element.innerText
    }
  }
}

class TextPresentAssertion {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'assertTextPresent',
      text: this._element.innerText
    }
  }
}

class ElementValueAssertion {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'assertElementValue',
      locator: selectorForInput(this._element),
      value: this._element.value
    }
  }
}

class ElementAssertion {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'assertElementPresent',
      locator: selectorsForClickElement(this._element)
    }
  }
}

class LoadEvent {
  toEvent() {
    return {
      type: 'get',
      url: window.location.pathname
    }
  }
}

class ClickEvent {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'clickElement',
      locator: selectorsForClickElement(this._element)
    }
  }
}

class SetTextEvent {
  constructor(element) {
    this._element = element;
  }

  toEvent() {
    return {
      type: 'setElementText',
      locator: selectorForInput(this._element),
      text: this._element.value
    }
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

function selectorForInput(e) {
  const locator = new ElementLocator(e);

  if (e.id) {
    let label = document.querySelector(`label[for="${e.id}"]`);
    if (label) {
      return locator.byLabelText();
    } else {
      return locator.byName();
    }
  }

  if (e.placeholder) {
    return locator.byPlaceholder();
  }

  return locator.byXpath();
}

function selectorsForClickElement(e) {
  const locator = new ElementLocator(e);

  if (e.localName === 'input') {
    const buttonTypes = [
      'submit', 'reset', 'image', 'button'
    ];

    if (buttonTypes.includes(e.type)) {
      return locator.byText();
    }

    return selectorForInput(e);
  }

  if (e.localName === 'button') {
    return locator.byText();
  }

  if (e.localName === 'img') {
    return locator.byImage();
  }

  if (e.localName === 'a') {
    return locator.byLink();
  }

  return locator.byXpath();
}

function isTextElement(element) {
  return element.localName === 'input';
}

function addEvent(event) {
  if (!event) return;

  window.events.push(event.toEvent());
  updateEvents();
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

class StepRecorder {
  constructor() {
    this._mode = 'step';
  }

  get isActive() {
    return this._active;
  }

  start() {
    this._active = true;
    this.setupHandlers();
  }

  stop() {
    this._active = false;
    this.teardownHandlers();
  }

  toggle() {
    this._active ? this.stop() : this.start();
  }

  eventFilter(e) {
    const ui9k = window.o9kUi;
    return e.path.includes(ui9k);
  }
}

class EventRecorder extends StepRecorder {
  handleEvent(e) {
    if (this.eventFilter(e)) return;

    if (e.type === 'DOMContentLoaded') {
      const event = new LoadEvent();
      addEvent(event);
    }

    if (e.type === 'click') {
      const event = new ClickEvent(e.target);
      addEvent(event);
    }

    if (e.type === 'blur') {
      if (!isTextElement(e.target)) {
        // No text setting if bluring on non-input
        return;
      }

      const event = new SetTextEvent(e.target);
      addEvent(event);
    }
  }

  setupHandlers() {
    document.addEventListener('DOMContentLoaded', this, true);
    document.addEventListener('blur', this, true);
    document.addEventListener('focusin', this, true);
    document.addEventListener('click', this, true);
  }

  teardownHandlers() {
    document.removeEventListener('DOMContentLoaded', this, true);
    document.removeEventListener('blur', this, true);
    document.removeEventListener('focusin', this, true);
    document.removeEventListener('click', this, true);
  }
}

class AssertionRecorder extends StepRecorder {
  handleEvent(e) {
    if (this.eventFilter(e)) return;

    e.stopPropagation();
    e.preventDefault();

    switch(e.type) {
      case 'mouseover':
        this.focusElement(e.target);
      break;

      case 'click':
        this.pick();
      break;
    }
  }

  stop() {
    this._active = false;
    this.teardownHandlers();
    this.blurElement();
  }

  setupHandlers() {
    document.addEventListener('mouseover', this, true);
    document.addEventListener('click', this, true);
  }

  teardownHandlers() {
    document.removeEventListener('mouseover', this, true);
    document.removeEventListener('click', this, true);
  }

  blurElement() {
    if (this._focusedElement) {
      this._focusedElement.style = this._styleBackup;
    }
  }

  focusElement(element) {
    this.blurElement();

    this._styleBackup = element.style;
    element.style['box-shadow'] = 'inset 0px 0px 0px 1px #000';

    this._focusedElement = element;
  }

  pick() {
    if (isTextElement(this._focusedElement)) {
      const assertion = new ElementValueAssertion(this._focusedElement);
      addEvent(assertion);
    } else if (this._focusedElement.innerText) {
      const assertion = new TextAssertion(this._focusedElement);
      if (assertion.toEvent().locator.value.startsWith('/html')) {
        const textAssertion = new TextPresentAssertion(this._focusedElement);
        addEvent(textAssertion);
      } else {
        addEvent(assertion);
      }
    } else {
      const assertion = new ElementAssertion(this._focusedElement);
      addEvent(assertion);
    }
  }
}

function resetEvents() {
  window.events = [];
  window.assertionRecorder.stop();
  window.eventRecorder.start();

  const loadEvent = new LoadEvent();
  addEvent(loadEvent);
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

    case 'assertElementValue':
      return `
<li>
${event.type}:
${event.locator.type}
${event.locator.value}
${event.value}
</li>
  `

    case 'assertElementPresent':
      return `
<li>
${event.type}:
${event.locator.type}
${event.locator.value}
</li>
  `

    case 'assertText':
      return `
<li>
${event.type}:
${event.locator.type}
${event.locator.value}
${event.text}
</li>
  `

    case 'assertTextPresent':
      return `
<li>
${event.type}:
${event.text}
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
    <a style="cursor: pointer" onclick="assertionRecorder.toggle(); eventRecorder.toggle()">Add Assertion</a>
  </div>
  <ol id="ui9k-events" style="font-size: 10px; overflow: auto; flex-grow: 1">
    ${renderEvents(window.events)}
  </ol>
</div>
`;

  document.body.insertAdjacentHTML('beforeend', ui);
  document.body.style.marginLeft = '20%';

  window.o9kUi = document.querySelector('#ui9k');
  window.assertionRecorder = new AssertionRecorder();
  window.eventRecorder = new EventRecorder();
  resetEvents();
}
document.addEventListener('DOMContentLoaded', addUi9k, true);

function patchIonic() {
  document.querySelector('[ng-app]').dataset['tapDisabled'] = "true";
}
document.addEventListener('DOMContentLoaded', patchIonic, true);
