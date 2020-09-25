/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): accordion.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
import { TRANSITION_END, emulateTransitionEnd, getSelectorFromElement, getElementFromSelector, getTransitionDurationFromElement, isElement, reflow } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const ACCORDION_NAME = 'accordion';
const ACCORDION_VERSION = '0.1.0-alpha1';
const ACCORDION_DATA_KEY = 'chichi.accordion';
const ACCORDION_EVENT_KEY = `.${ACCORDION_DATA_KEY}`;
const ACCORDION_DATA_API_KEY = '.data-api';
const AccordionDefaults = {
  toggle: true,
  parent: ''
};
const ACCORDION_EVENT_SHOW = `show${ACCORDION_EVENT_KEY}`;
const ACCORDION_EVENT_SHOWN = `shown${ACCORDION_EVENT_KEY}`;
const ACCORDION_EVENT_HIDE = `hide${ACCORDION_EVENT_KEY}`;
const ACCORDION_EVENT_HIDDEN = `hidden${ACCORDION_EVENT_KEY}`;
const ACCORDION_EVENT_CLICK_DATA_API = `click${ACCORDION_EVENT_KEY}${ACCORDION_DATA_API_KEY}`;
const ACCORDION_CLASS_NAME_SHOW = 'is-active';
const ACCORDION_CLASS_NAME_COLLAPSE = 'accordion';
const ACCORDION_CLASS_NAME_COLLAPSING = 'is-collapsing';
const ACCORDION_CLASS_NAME_COLLAPSED = 'is-collapsed';
const ACCORDION_WIDTH = 'width';
const ACCORDION_HEIGHT = 'height';
const ACCORDION_SELECTOR_ACTIVES = '.is-active, .is-collapsing';
const ACCORDION_SELECTOR_DATA_TOGGLE = '[data-toggle="accordion"]';
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Accordion {
  constructor(element, config) {
    this._isTransitioning = false;
    this._element = element;
    this._config = this._getConfig(config);
    this._triggerArray = SelectorEngine.find(`${ACCORDION_SELECTOR_DATA_TOGGLE}[href="#${element.id}"],` + `${ACCORDION_SELECTOR_DATA_TOGGLE}[data-target="#${element.id}"]`);
    const toggleList = SelectorEngine.find(ACCORDION_SELECTOR_DATA_TOGGLE);

    for (let i = 0, len = toggleList.length; i < len; i++) {
      const elem = toggleList[i];
      const selector = getSelectorFromElement(elem);
      const filterElement = SelectorEngine.find(selector).filter(foundElem => foundElem === element);

      if (selector !== null && filterElement.length) {
        this._selector = selector;

        this._triggerArray.push(elem);
      }
    }

    this._parent = this._config.parent ? this._getParent() : null;

    if (!this._config.parent) {
      this._addAriaAndAccordiondClass(this._element, this._triggerArray);
    }

    if (this._config.toggle) {
      this.toggle();
    }

    Data.setData(element, ACCORDION_DATA_KEY, this);
  } // Getters


  static get VERSION() {
    return VERSION;
  }

  static get Default() {
    return AccordionDefaults;
  } // Public


  toggle() {
    if (this._element.classList.contains(ACCORDION_CLASS_NAME_SHOW)) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this._isTransitioning || this._element.classList.contains(ACCORDION_CLASS_NAME_SHOW)) {
      return;
    }

    let actives;
    let activesData;

    if (this._parent) {
      actives = SelectorEngine.find(ACCORDION_SELECTOR_ACTIVES, this._parent).filter(elem => {
        if (typeof this._config.parent === 'string') {
          return elem.getAttribute('data-parent') === this._config.parent;
        }

        return elem.classList.contains(ACCORDION_CLASS_NAME_COLLAPSE);
      });

      if (actives.length === 0) {
        actives = null;
      }
    }

    const container = SelectorEngine.findOne(this._selector);

    if (actives) {
      const tempActiveData = actives.filter(elem => container !== elem);
      activesData = tempActiveData[0] ? Data.getData(tempActiveData[0], ACCORDION_DATA_KEY) : null;

      if (activesData && activesData._isTransitioning) {
        return;
      }
    }

    const startEvent = EventHandler.trigger(this._element, ACCORDION_EVENT_SHOW);

    if (startEvent.defaultPrevented) {
      return;
    }

    if (actives) {
      actives.forEach(elemActive => {
        if (container !== elemActive) {
          Accordion.collapseInterface(elemActive, 'hide');
        }

        if (!activesData) {
          Data.setData(elemActive, ACCORDION_DATA_KEY, null);
        }
      });
    }

    const dimension = this._getDimension();

    this._element.classList.remove(ACCORDION_CLASS_NAME_COLLAPSE);

    this._element.classList.add(ACCORDION_CLASS_NAME_COLLAPSING);

    this._element.style[dimension] = 0;

    if (this._triggerArray.length) {
      this._triggerArray.forEach(element => {
        element.classList.remove(ACCORDION_CLASS_NAME_COLLAPSED);
        element.setAttribute('aria-expanded', true);
      });
    }

    this.setTransitioning(true);

    const complete = () => {
      this._element.classList.remove(ACCORDION_CLASS_NAME_COLLAPSING);

      this._element.classList.add(ACCORDION_CLASS_NAME_COLLAPSE, ACCORDION_CLASS_NAME_SHOW);

      this._element.style[dimension] = '';
      this.setTransitioning(false);
      EventHandler.trigger(this._element, ACCORDION_EVENT_SHOWN);
    };

    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
    const scrollSize = `scroll${capitalizedDimension}`;
    const transitionDuration = getTransitionDurationFromElement(this._element);
    EventHandler.one(this._element, TRANSITION_END, complete);
    emulateTransitionEnd(this._element, transitionDuration);
    this._element.style[dimension] = `${this._element[scrollSize]}px`;
  }

  hide() {
    if (this._isTransitioning || !this._element.classList.contains(ACCORDION_CLASS_NAME_SHOW)) {
      return;
    }

    const startEvent = EventHandler.trigger(this._element, ACCORDION_EVENT_HIDE);

    if (startEvent.defaultPrevented) {
      return;
    }

    const dimension = this._getDimension();

    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
    reflow(this._element);

    this._element.classList.add(ACCORDION_CLASS_NAME_COLLAPSING);

    this._element.classList.remove(ACCORDION_CLASS_NAME_COLLAPSE, ACCORDION_CLASS_NAME_SHOW);

    const triggerArrayLength = this._triggerArray.length;

    if (triggerArrayLength > 0) {
      for (let i = 0; i < triggerArrayLength; i++) {
        const trigger = this._triggerArray[i];
        const elem = getElementFromSelector(trigger);

        if (elem && !elem.classList.contains(ACCORDION_CLASS_NAME_SHOW)) {
          trigger.classList.add(ACCORDION_CLASS_NAME_COLLAPSED);
          trigger.setAttribute('aria-expanded', false);
        }
      }
    }

    this.setTransitioning(true);

    const complete = () => {
      this.setTransitioning(false);

      this._element.classList.remove(ACCORDION_CLASS_NAME_COLLAPSING);

      this._element.classList.add(ACCORDION_CLASS_NAME_COLLAPSE);

      EventHandler.trigger(this._element, ACCORDION_EVENT_HIDDEN);
    };

    this._element.style[dimension] = '';
    const transitionDuration = getTransitionDurationFromElement(this._element);
    EventHandler.one(this._element, TRANSITION_END, complete);
    emulateTransitionEnd(this._element, transitionDuration);
  }

  setTransitioning(isTransitioning) {
    this._isTransitioning = isTransitioning;
  }

  dispose() {
    Data.removeData(this._element, ACCORDION_DATA_KEY);
    this._config = null;
    this._parent = null;
    this._element = null;
    this._triggerArray = null;
    this._isTransitioning = null;
  } // Private


  _getConfig(config) {
    config = { ...AccordionDefaults,
      ...config
    };
    config.toggle = Boolean(config.toggle); // Coerce string values

    return config;
  }

  _getDimension() {
    const hasWidth = this._element.classList.contains(ACCORDION_WIDTH);

    return hasWidth ? ACCORDION_WIDTH : ACCORDION_HEIGHT;
  }

  _getParent() {
    let {
      parent
    } = this._config;

    if (isElement(parent)) {
      // it's a jQuery object
      if (typeof parent.jquery !== 'undefined' || typeof parent[0] !== 'undefined') {
        parent = parent[0];
      }
    } else {
      parent = SelectorEngine.findOne(parent);
    }

    const selector = `${ACCORDION_SELECTOR_DATA_TOGGLE}[data-parent="${parent}"]`;
    SelectorEngine.find(selector, parent).forEach(element => {
      const selected = getElementFromSelector(element);

      this._addAriaAndAccordiondClass(selected, [element]);
    });
    return parent;
  }

  _addAriaAndAccordiondClass(element, triggerArray) {
    if (element) {
      const isOpen = element.classList.contains(ACCORDION_CLASS_NAME_SHOW);

      if (triggerArray.length) {
        triggerArray.forEach(elem => {
          if (isOpen) {
            elem.classList.remove(ACCORDION_CLASS_NAME_COLLAPSED);
          } else {
            elem.classList.add(ACCORDION_CLASS_NAME_COLLAPSED);
          }

          elem.setAttribute('aria-expanded', isOpen);
        });
      }
    }
  } // Static


  static collapseInterface(element, config) {
    let data = Data.getData(element, ACCORDION_DATA_KEY);
    const _config = { ...AccordionDefaults,
      ...Manipulator.getDataAttributes(element),
      ...(typeof config === 'object' && config ? config : {})
    };

    if (!data && _config.toggle && typeof config === 'string' && /show|hide/.test(config)) {
      _config.toggle = false;
    }

    if (!data) {
      data = new Accordion(element, _config);
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`);
      }

      data[config]();
    }
  }

  static getInstance(element) {
    return Data.getData(element, ACCORDION_DATA_KEY);
  }

}
/**
 * ------------------------------------------------------------------------
 * Data api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, ACCORDION_EVENT_CLICK_DATA_API, ACCORDION_SELECTOR_DATA_TOGGLE, function (event) {
  // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
  if (event.target.tagName === 'A') {
    event.preventDefault();
  }

  const triggerData = Manipulator.getDataAttributes(this);
  const selector = getSelectorFromElement(this);
  const selectorElements = SelectorEngine.find(selector);
  selectorElements.forEach(element => {
    const data = Data.getData(element, ACCORDION_DATA_KEY);
    let config;

    if (data) {
      // update parent attribute
      if (data._parent === null && typeof triggerData.parent === 'string') {
        data._config.parent = triggerData.parent;
        data._parent = data._getParent();
      }

      config = 'toggle';
    } else {
      config = triggerData;
    }

    Accordion.collapseInterface(element, config);
  });
});
/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Accordion;
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha1): alert.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
import { TRANSITION_END, emulateTransitionEnd, getElementFromSelector, getTransitionDurationFromElement } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const ALERT_NAME = 'alert';
const ALERT_VERSION = '0.1.0-alpha1';
const ALERT_DATA_KEY = 'chichi.alert';
const ALERT_EVENT_KEY = `.${ALERT_DATA_KEY}`;
const ALERT_DATA_API_KEY = '.data-api';
const ALERT_SELECTOR_DISMISS = '[data-dismiss="alert"]';
const ALERT_EVENT_CLOSE = `close${ALERT_EVENT_KEY}`;
const ALERT_EVENT_CLOSED = `closed${ALERT_EVENT_KEY}`;
const ALERT_EVENT_CLICK_DATA_API = `click${ALERT_EVENT_KEY}${ALERT_DATA_API_KEY}`;
const CLASSNAME_ALERT = 'alert';
const ALERT_CLASSNAME_FADE = 'fade';
const ALERT_CLASSNAME_SHOW = 'show';
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Alert {
  constructor(element) {
    this._element = element;

    if (this._element) {
      Data.setData(element, ALERT_DATA_KEY, this);
    }
  } // Getters


  static get VERSION() {
    return ALERT_VERSION;
  } // Public


  close(element) {
    let rootElement = this._element;

    if (element) {
      rootElement = this._getRootElement(element);
    }

    const customEvent = this._triggerCloseEvent(rootElement);

    if (customEvent === null || customEvent.defaultPrevented) {
      return;
    }

    this._removeElement(rootElement);
  }

  dispose() {
    Data.removeData(this._element, ALERT_DATA_KEY);
    this._element = null;
  } // Private


  _getRootElement(element) {
    return getElementFromSelector(element) || element.closest(`.${ALERT_CLASSNAME_ALERT}`);
  }

  _triggerCloseEvent(element) {
    return EventHandler.trigger(element, ALERT_EVENT_CLOSE);
  }

  _removeElement(element) {
    element.classList.remove(ALERT_CLASSNAME_SHOW);

    if (!element.classList.contains(ALERT_CLASSNAME_FADE)) {
      this._destroyElement(element);

      return;
    }

    const transitionDuration = getTransitionDurationFromElement(element);
    EventHandler.one(element, TRANSITION_END, () => this._destroyElement(element));
    emulateTransitionEnd(element, transitionDuration);
  }

  _destroyElement(element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }

    EventHandler.trigger(element, ALERT_EVENT_CLOSED);
  } // Static


  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, ALERT_DATA_KEY);

      if (!data) {
        data = new Alert(this);
      }

      if (config === 'close') {
        data[config](this);
      }
    });
  }

  static handleDismiss(alertInstance) {
    return function (event) {
      if (event) {
        event.preventDefault();
      }

      alertInstance.close(this);
    };
  }

  static getInstance(element) {
    return Data.getData(element, ALERT_DATA_KEY);
  }

}
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, ALERT_EVENT_CLICK_DATA_API, ALERT_SELECTOR_DISMISS, Alert.handleDismiss(new Alert()));
/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Alert;
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): button.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
import Data from './dom/data';
import EventHandler from './dom/event-handler';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const BUTTON_NAME = 'button';
const BUTTON_VERSION = '0.1.0-alpha1';
const BUTTON_DATA_KEY = 'chichi.button';
const BUTTON_EVENT_KEY = `.${BUTTON_DATA_KEY}`;
const BUTTON_DATA_API_KEY = '.data-api';
const BUTTON_CLASS_NAME_ACTIVE = 'is-active';
const BUTTON_SELECTOR_DATA_TOGGLE = '[data-toggle="button"]';
const BUTTON_EVENT_CLICK_DATA_API = `click${BUTTON_EVENT_KEY}${BUTTON_DATA_API_KEY}`;
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Button {
  constructor(element) {
    this._element = element;
    Data.setData(element, BUTTON_DATA_KEY, this);
  } // Getters


  static get VERSION() {
    return BUTTON_VERSION;
  } // Public


  toggle() {
    // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
    this._element.setAttribute('aria-pressed', this._element.classList.toggle(BUTTON_CLASS_NAME_ACTIVE));
  }

  dispose() {
    Data.removeData(this._element, BUTTON_DATA_KEY);
    this._element = null;
  } // Static


  static getInstance(element) {
    return Data.getData(element, BUTTON_DATA_KEY);
  }

}
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, BUTTON_EVENT_CLICK_DATA_API, BUTTON_SELECTOR_DATA_TOGGLE, event => {
  event.preventDefault();
  const button = event.target.closest(BUTTON_SELECTOR_DATA_TOGGLE);
  let data = Data.getData(button, BUTTON_DATA_KEY);

  if (!data) {
    data = new Button(button);
  }

  data.toggle();
});
/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Button;
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): dropdown.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
import { getElementFromSelector, isElement, isVisible, noop } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import Popper from 'popper.js';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const DROPDOWN_NAME = 'dropdown';
const DROPDOWN_VERSION = '0.1.0-alpha1';
const DROPDOWN_DATA_KEY = 'chichi.dropdown';
const DROPDOWN_EVENT_KEY = `.${DROPDOWN_DATA_KEY}`;
const DROPDOWN_DATA_API_KEY = '.data-api';
const DROPDOWN_ESCAPE_KEY = 'Escape';
const DROPDOWN_SPACE_KEY = 'Space';
const DROPDOWN_TAB_KEY = 'Tab';
const DROPDOWN_ARROW_UP_KEY = 'ArrowUp';
const DROPDOWN_ARROW_DOWN_KEY = 'ArrowDown';
const DROPDOWN_RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

const DROPDOWN_REGEXP_KEYDOWN = new RegExp(`${DROPDOWN_ARROW_UP_KEY}|${DROPDOWN_ARROW_DOWN_KEY}|${DROPDOWN_ESCAPE_KEY}`);
const DROPDOWN_EVENT_HIDE = `hide${DROPDOWN_EVENT_KEY}`;
const DROPDOWN_EVENT_HIDDEN = `hidden${DROPDOWN_EVENT_KEY}`;
const DROPDOWN_EVENT_SHOW = `show${DROPDOWN_EVENT_KEY}`;
const DROPDOWN_EVENT_SHOWN = `shown${DROPDOWN_EVENT_KEY}`;
const DROPDOWN_EVENT_CLICK = `click${DROPDOWN_EVENT_KEY}`;
const DROPDOWN_EVENT_CLICK_DATA_API = `click${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`;
const DROPDOWN_EVENT_KEYDOWN_DATA_API = `keydown${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`;
const DROPDOWN_EVENT_KEYUP_DATA_API = `keyup${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`;
const DROPDOWN_CLASS_NAME_DISABLED = 'disabled';
const DROPDOWN_CLASS_NAME_ACTIVE = 'is-active';
const DROPDOWN_CLASS_NAME_DROPUP = 'is-up';
const DROPDOWN_CLASS_NAME_DROPRIGHT = 'is-right';
const DROPDOWN_CLASS_NAME_DROPLEFT = 'is-left';
const DROPDOWN_CLASS_NAME_MENURIGHT = 'dropdown-menu-right';
const DROPDOWN_CLASS_NAME_NAVBAR = 'navbar';
const DROPDOWN_CLASS_NAME_POSITION_STATIC = 'is-static';
const DROPDOWN_SELECTOR_DATA_TOGGLE = '[data-toggle="dropdown"]';
const DROPDOWN_SELECTOR_FORM_CHILD = '.dropdown form';
const DROPDOWN_SELECTOR_MENU = '.dropdown-menu';
const DROPDOWN_SELECTOR_NAVBAR_NAV = '.navbar-item';
const DROPDOWN_SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
const DROPDOWN_PLACEMENT_TOP = 'top-start';
const DROPDOWN_PLACEMENT_TOPEND = 'top-end';
const DROPDOWN_PLACEMENT_BOTTOM = 'bottom-start';
const DROPDOWN_PLACEMENT_BOTTOMEND = 'bottom-end';
const DROPDOWN_PLACEMENT_RIGHT = 'right-start';
const DROPDOWN_PLACEMENT_LEFT = 'left-start';
const DropdownDefaults = {
  offset: 0,
  flip: true,
  boundary: 'scrollParent',
  reference: 'toggle',
  display: 'dynamic',
  popperConfig: null
};
/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

class Dropdown {
  constructor(element, config) {
    this._element = element;
    this._popper = null;
    this._config = this._getConfig(config);
    this._menu = this._getMenuElement();
    this._inNavbar = this._detectNavbar();

    this._addEventListeners();

    Data.setData(element, DROPDOWN_DATA_KEY, this);
  } // Getters


  static get VERSION() {
    return DROPDOWN_VERSION;
  }

  static get Default() {
    return DropdownDefaults;
  } // Public


  toggle() {
    if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED)) {
      return;
    }

    const isActive = this._element.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE);

    Dropdown.clearMenus();

    if (isActive) {
      return;
    }

    this.show();
  }

  show() {
    if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED) || this._menu.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
      return;
    }

    const parent = Dropdown.getParentFromElement(this._element);
    const relatedTarget = {
      relatedTarget: this._element
    };
    const showEvent = EventHandler.trigger(this._element, DROPDOWN_DROPDOWN_EVENT_SHOW, relatedTarget);

    if (showEvent.defaultPrevented) {
      return;
    } // Disable totally Popper.js for Dropdown in Navbar


    if (!this._inNavbar) {
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org)');
      }

      let referenceElement = this._element;

      if (this._config.reference === 'parent') {
        referenceElement = parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = this._config.reference; // Check if it's jQuery element

        if (typeof this._config.reference.jquery !== 'undefined') {
          referenceElement = this._config.reference[0];
        }
      } // If boundary is not `scrollParent`, then set position to `static`
      // to allow the menu to "escape" the scroll parent's boundaries
      // https://github.com/twbs/bootstrap/issues/24251


      if (this._config.boundary !== 'scrollParent') {
        parent.classList.add(DROPDOWN_CLASS_NAME_POSITION_STATIC);
      }

      this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
    } // If this is a touch-enabled device we add extra
    // empty mouseover listeners to the body's immediate children;
    // only needed because of broken event delegation on iOS
    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


    if ('ontouchstart' in document.documentElement && !parent.closest(DROPDOWN_SELECTOR_NAVBAR_NAV)) {
      [].concat(...document.body.children).forEach(elem => EventHandler.on(elem, 'mouseover', null, noop()));
    }

    this._element.focus();

    this._element.setAttribute('aria-expanded', true);

    Manipulator.toggleClass(this._menu, DROPDOWN_CLASS_NAME_ACTIVE);
    Manipulator.toggleClass(this._element, DROPDOWN_CLASS_NAME_ACTIVE);
    EventHandler.trigger(parent, DROPDOWN_EVENT_SHOWN, relatedTarget);
  }

  hide() {
    if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED) || !this._menu.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
      return;
    }

    const parent = Dropdown.getParentFromElement(this._element);
    const relatedTarget = {
      relatedTarget: this._element
    };
    const hideEvent = EventHandler.trigger(parent, DROPDOWN_EVENT_HIDE, relatedTarget);

    if (hideEvent.defaultPrevented) {
      return;
    }

    if (this._popper) {
      this._popper.destroy();
    }

    Manipulator.toggleClass(this._menu, DROPDOWN_CLASS_NAME_ACTIVE);
    Manipulator.toggleClass(this._element, DROPDOWN_CLASS_NAME_ACTIVE);
    EventHandler.trigger(parent, DROPDOWN_EVENT_HIDDEN, relatedTarget);
  }

  dispose() {
    Data.removeData(this._element, DROPDOWN_DATA_KEY);
    EventHandler.off(this._element, DROPDOWN_EVENT_KEY);
    this._element = null;
    this._menu = null;

    if (this._popper) {
      this._popper.destroy();

      this._popper = null;
    }
  }

  update() {
    this._inNavbar = this._detectNavbar();

    if (this._popper) {
      this._popper.scheduleUpdate();
    }
  } // Private


  _addEventListeners() {
    EventHandler.on(this._element, DROPDOWN_EVENT_CLICK, event => {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    });
  }

  _getConfig(config) {
    config = { ...this.constructor.Default,
      ...Manipulator.getDataAttributes(this._element),
      ...config
    };
    return config;
  }

  _getMenuElement() {
    return SelectorEngine.next(this._element, DROPDOWN_SELECTOR_MENU)[0];
  }

  _getPlacement() {
    const parentDropdown = this._element.parentNode;
    let placement = DROPDOWN_PLACEMENT_BOTTOM; // Handle dropup

    if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPUP)) {
      placement = DROPDOWN_PLACEMENT_TOP;

      if (this._menu.classList.contains(DROPDOWN_CLASS_NAME_MENURIGHT)) {
        placement = DROPDOWN_PLACEMENT_TOPEND;
      }
    } else if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPRIGHT)) {
      placement = DROPDOWN_PLACEMENT_RIGHT;
    } else if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPLEFT)) {
      placement = DROPDOWN_PLACEMENT_LEFT;
    } else if (this._menu.classList.contains(DROPDOWN_CLASS_NAME_MENURIGHT)) {
      placement = DROPDOWN_PLACEMENT_BOTTOMEND;
    }

    return placement;
  }

  _detectNavbar() {
    return Boolean(this._element.closest(`.${DROPDOWN_CLASS_NAME_NAVBAR}`));
  }

  _getOffset() {
    const offset = {};

    if (typeof this._config.offset === 'function') {
      offset.fn = data => {
        data.offsets = { ...data.offsets,
          ...(this._config.offset(data.offsets, this._element) || {})
        };
        return data;
      };
    } else {
      offset.offset = this._config.offset;
    }

    return offset;
  }

  _getPopperConfig() {
    const popperConfig = {
      placement: this._getPlacement(),
      modifiers: {
        offset: this._getOffset(),
        flip: {
          enabled: this._config.flip
        },
        preventOverflow: {
          boundariesElement: this._config.boundary
        }
      }
    }; // Disable Popper.js if we have a static display

    if (this._config.display === 'static') {
      popperConfig.modifiers.applyStyle = {
        enabled: false
      };
    }

    return { ...popperConfig,
      ...this._config.popperConfig
    };
  } // Static


  static dropdownInterface(element, config) {
    let data = Data.getData(element, DROPDOWN_DATA_KEY);

    const _config = typeof config === 'object' ? config : null;

    if (!data) {
      data = new Dropdown(element, _config);
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`);
      }

      data[config]();
    }
  }

  static clearMenus(event) {
    if (event && (event.button === DROPDOWN_RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== DROPDOWN_TAB_KEY)) {
      return;
    }

    const toggles = SelectorEngine.find(DROPDOWN_SELECTOR_DATA_TOGGLE);

    for (let i = 0, len = toggles.length; i < len; i++) {
      const parent = Dropdown.getParentFromElement(toggles[i]);
      const context = Data.getData(toggles[i], DROPDOWN_DATA_KEY);
      const relatedTarget = {
        relatedTarget: toggles[i]
      };

      if (event && event.type === 'click') {
        relatedTarget.clickEvent = event;
      }

      if (!context) {
        continue;
      }

      const dropdownMenu = context._menu;

      if (!toggles[i].classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
        continue;
      }

      if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.key === DROPDOWN_TAB_KEY) && dropdownMenu.contains(event.target)) {
        continue;
      }

      const hideEvent = EventHandler.trigger(parent, DROPDOWN_EVENT_HIDE, relatedTarget);

      if (hideEvent.defaultPrevented) {
        continue;
      } // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support


      if ('ontouchstart' in document.documentElement) {
        [].concat(...document.body.children).forEach(elem => EventHandler.off(elem, 'mouseover', null, noop()));
      }

      toggles[i].setAttribute('aria-expanded', 'false');

      if (context._popper) {
        context._popper.destroy();
      }

      dropdownMenu.classList.remove(DROPDOWN_CLASS_NAME_ACTIVE);
      toggles[i].classList.remove(DROPDOWN_CLASS_NAME_ACTIVE);
      EventHandler.trigger(parent, DROPDOWN_EVENT_HIDDEN, relatedTarget);
    }
  }

  static getParentFromElement(element) {
    return getElementFromSelector(element) || element.parentNode;
  }

  static dataApiKeydownHandler(event) {
    // If not input/textarea:
    //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
    // If input/textarea:
    //  - If space key => not a dropdown command
    //  - If key is other than escape
    //    - If key is not up or down => not a dropdown command
    //    - If trigger inside the menu => not a dropdown command
    if (/input|textarea/i.test(event.target.tagName) ? event.key === DROPDOWN_SPACE_KEY || event.key !== DROPDOWN_ESCAPE_KEY && (event.key !== DROPDOWN_ARROW_DOWN_KEY && event.key !== DROPDOWN_ARROW_UP_KEY || event.target.closest(DROPDOWN_SELECTOR_MENU)) : !DROPDOWN_REGEXP_KEYDOWN.test(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || this.classList.contains(DROPDOWN_CLASS_NAME_DISABLED)) {
      return;
    }

    const parent = Dropdown.getParentFromElement(this);
    const isActive = this.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE);

    if (event.key === DROPDOWN_ESCAPE_KEY) {
      const button = this.matches(SDROPDOWN_ELECTOR_DATA_TOGGLE) ? this : SelectorEngine.prev(this, DROPDOWN_SELECTOR_DATA_TOGGLE)[0];
      button.focus();
      Dropdown.clearMenus();
      return;
    }

    if (!isActive || event.key === DROPDOWN_SPACE_KEY) {
      Dropdown.clearMenus();
      return;
    }

    const items = SelectorEngine.find(DROPDOWN_SELECTOR_VISIBLE_ITEMS, parent).filter(isVisible);

    if (!items.length) {
      return;
    }

    let index = items.indexOf(event.target);

    if (event.key === DROPDOWN_ARROW_UP_KEY && index > 0) {
      // Up
      index--;
    }

    if (event.key === DROPDOWN_ARROW_DOWN_KEY && index < items.length - 1) {
      // Down
      index++;
    } // index is -1 if the first keydown is an ArrowUp


    index = index === -1 ? 0 : index;
    items[index].focus();
  }

  static getInstance(element) {
    return Data.getData(element, DROPDOWN_DATA_KEY);
  }

}
/**
* ------------------------------------------------------------------------
* Data Api implementation
* ------------------------------------------------------------------------
*/


EventHandler.on(document, DROPDOWN_EVENT_KEYDOWN_DATA_API, DROPDOWN_SELECTOR_DATA_TOGGLE, Dropdown.dataApiKeydownHandler);
EventHandler.on(document, DROPDOWN_EVENT_KEYDOWN_DATA_API, DROPDOWN_SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
EventHandler.on(document, DROPDOWN_EVENT_CLICK_DATA_API, Dropdown.clearMenus);
EventHandler.on(document, DROPDOWN_EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
EventHandler.on(document, DROPDOWN_EVENT_CLICK_DATA_API, DROPDOWN_SELECTOR_DATA_TOGGLE, function (event) {
  event.preventDefault();
  event.stopPropagation();
  Dropdown.dropdownInterface(this, 'toggle');
});
EventHandler.on(document, DROPDOWN_EVENT_CLICK_DATA_API, DROPDOWN_SELECTOR_FORM_CHILD, e => e.stopPropagation());
/**
* ------------------------------------------------------------------------
* Exports
* ------------------------------------------------------------------------
*/

export default Dropdown;
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): modal.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): popover.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): slider.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
import { TRANSITION_END, emulateTransitionEnd, getElementFromSelector, getTransitionDurationFromElement, isVisible, reflow, triggerTransitionEnd } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const SLIDER_NAME = 'slider';
const SLIDER_VERSION = '0.1.0-alpha1';
const SLIDER_DATA_KEY = 'chichi.slider';
const SLIDER_EVENT_KEY = `.${SLIDER_DATA_KEY}`;
const SLIDER_DATA_API_KEY = '.data-api';
const SLIDER_ARROW_LEFT_KEY = 'ArrowLeft';
const SLIDER_ARROW_RIGHT_KEY = 'ArrowRight';
const SLIDER_TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

const SLIDER_SWIPE_THRESHOLD = 40;
const SliderDefaults = {
  interval: 5000,
  keyboard: true,
  slide: false,
  pause: 'hover',
  wrap: true,
  touch: true
};
const SLIDER_DIRECTION_NEXT = 'next';
const SLIDER_DIRECTION_PREV = 'prev';
const SLIDER_DIRECTION_LEFT = 'left';
const SLIDER_DIRECTION_RIGHT = 'right';
const SLIDER_EVENT_SLIDE = `slide${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_SLID = `slid${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_KEYDOWN = `keydown${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_MOUSEENTER = `mouseenter${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_MOUSELEAVE = `mouseleave${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_TOUCHSTART = `touchstart${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_TOUCHMOVE = `touchmove${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_TOUCHEND = `touchend${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_POINTERDOWN = `pointerdown${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_POINTERUP = `pointerup${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_DRAG_START = `dragstart${SLIDER_EVENT_KEY}`;
const SLIDER_EVENT_LOAD_DATA_API = `load${SLIDER_EVENT_KEY}${SLIDER_DATA_API_KEY}`;
const SLIDER_EVENT_CLICK_DATA_API = `click${SLIDER_EVENT_KEY}${SLIDER_DATA_API_KEY}`;
const SLIDER_CLASS_NAME_SLIDER = 'slider';
const SLIDER_CLASS_NAME_ACTIVE = 'is-active';
const SLIDER_CLASS_NAME_SLIDE = 'slide';
const SLIDER_CLASS_NAME_RIGHT = 'carousel-item-right';
const SLIDER_CLASS_NAME_LEFT = 'carousel-item-left';
const SLIDER_CLASS_NAME_NEXT = 'carousel-item-next';
const SLIDER_CLASS_NAME_PREV = 'carousel-item-prev';
const SLIDER_CLASS_NAME_POINTER_EVENT = 'pointer-event';
const SLIDER_SELECTOR_ACTIVE = '.is-active';
const SLIDER_SELECTOR_ACTIVE_ITEM = '.is-active.slider-item';
const SLIDER_SELECTOR_ITEM = '.slider-item';
const SLIDER_SELECTOR_ITEM_IMG = '.slider-item img';
const SLIDER_SELECTOR_NEXT_PREV = '.slider-item-next, .slider-item-prev';
const SLIDER_SELECTOR_INDICATORS = '.slider-indicators';
const SLIDER_SELECTOR_DATA_SLIDE = '[data-slide], [data-slide-to]';
const SLIDER_SELECTOR_DATA_RIDE = '[data-ride="slider"]';
const PointerType = {
  TOUCH: 'touch',
  PEN: 'pen'
};
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Slider {
  constructor(element, config) {
    this._items = null;
    this._interval = null;
    this._activeElement = null;
    this._isPaused = false;
    this._isSliding = false;
    this.touchTimeout = null;
    this.touchStartX = 0;
    this.touchDeltaX = 0;
    this._config = this._getConfig(config);
    this._element = element;
    this._indicatorsElement = SelectorEngine.findOne(SLIDER_SELECTOR_INDICATORS, this._element);
    this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    this._pointerEvent = Boolean(window.PointerEvent);

    this._addEventListeners();

    Data.setData(element, SLIDER_DATA_KEY, this);
  } // Getters


  static get VERSION() {
    return SLIDER_VERSION;
  }

  static get Default() {
    return SliderDefaults;
  } // Public


  next() {
    if (!this._isSliding) {
      this._slide(SLIDER_DIRECTION_NEXT);
    }
  }

  nextWhenVisible() {
    // Don't call next when the page isn't visible
    // or the carousel or its parent isn't visible
    if (!document.hidden && isVisible(this._element)) {
      this.next();
    }
  }

  prev() {
    if (!this._isSliding) {
      this._slide(SLIDER_DIRECTION_PREV);
    }
  }

  pause(event) {
    if (!event) {
      this._isPaused = true;
    }

    if (SelectorEngine.findOne(SLIDER_SELECTOR_NEXT_PREV, this._element)) {
      triggerTransitionEnd(this._element);
      this.cycle(true);
    }

    clearInterval(this._interval);
    this._interval = null;
  }

  cycle(event) {
    if (!event) {
      this._isPaused = false;
    }

    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }

    if (this._config && this._config.interval && !this._isPaused) {
      this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
    }
  }

  to(index) {
    this._activeElement = SelectorEngine.findOne(SLIDER_SELECTOR_ACTIVE_ITEM, this._element);

    const activeIndex = this._getItemIndex(this._activeElement);

    if (index > this._items.length - 1 || index < 0) {
      return;
    }

    if (this._isSliding) {
      EventHandler.one(this._element, SLIDER_EVENT_SLID, () => this.to(index));
      return;
    }

    if (activeIndex === index) {
      this.pause();
      this.cycle();
      return;
    }

    const direction = index > activeIndex ? SLIDER_DIRECTION_NEXT : SLIDER_DIRECTION_PREV;

    this._slide(direction, this._items[index]);
  }

  dispose() {
    EventHandler.off(this._element, SLIDER_EVENT_KEY);
    Data.removeData(this._element, SLIDER_DATA_KEY);
    this._items = null;
    this._config = null;
    this._element = null;
    this._interval = null;
    this._isPaused = null;
    this._isSliding = null;
    this._activeElement = null;
    this._indicatorsElement = null;
  } // Private


  _getConfig(config) {
    config = { ...Default,
      ...config
    };
    typeCheckConfig(NAME, config, DefaultType);
    return config;
  }

  _handleSwipe() {
    const absDeltax = Math.abs(this.touchDeltaX);

    if (absDeltax <= SWIPE_THRESHOLD) {
      return;
    }

    const direction = absDeltax / this.touchDeltaX;
    this.touchDeltaX = 0; // swipe left

    if (direction > 0) {
      this.prev();
    } // swipe right


    if (direction < 0) {
      this.next();
    }
  }

  _addEventListeners() {
    if (this._config.keyboard) {
      EventHandler.on(this._element, SLIDER_EVENT_KEYDOWN, event => this._keydown(event));
    }

    if (this._config.pause === 'hover') {
      EventHandler.on(this._element, SLIDER_EVENT_MOUSEENTER, event => this.pause(event));
      EventHandler.on(this._element, SLIDER_EVENT_MOUSELEAVE, event => this.cycle(event));
    }

    if (this._config.touch && this._touchSupported) {
      this._addTouchEventListeners();
    }
  }

  _addTouchEventListeners() {
    const start = event => {
      if (this._pointerEvent && PointerType[event.pointerType.toUpperCase()]) {
        this.touchStartX = event.clientX;
      } else if (!this._pointerEvent) {
        this.touchStartX = event.touches[0].clientX;
      }
    };

    const move = event => {
      // ensure swiping with one touch and not pinching
      if (event.touches && event.touches.length > 1) {
        this.touchDeltaX = 0;
      } else {
        this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
      }
    };

    const end = event => {
      if (this._pointerEvent && PointerType[event.pointerType.toUpperCase()]) {
        this.touchDeltaX = event.clientX - this.touchStartX;
      }

      this._handleSwipe();

      if (this._config.pause === 'hover') {
        // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling
        this.pause();

        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }

        this.touchTimeout = setTimeout(event => this.cycle(event), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      }
    };

    SelectorEngine.find(SLIDER_SELECTOR_ITEM_IMG, this._element).forEach(itemImg => {
      EventHandler.on(itemImg, SLIDER_EVENT_DRAG_START, e => e.preventDefault());
    });

    if (this._pointerEvent) {
      EventHandler.on(this._element, SLIDER_EVENT_POINTERDOWN, event => start(event));
      EventHandler.on(this._element, SLIDER_EVENT_POINTERUP, event => end(event));

      this._element.classList.add(SLIDER_CLASS_NAME_POINTER_EVENT);
    } else {
      EventHandler.on(this._element, SLIDER_EVENT_TOUCHSTART, event => start(event));
      EventHandler.on(this._element, SLIDER_EVENT_TOUCHMOVE, event => move(event));
      EventHandler.on(this._element, SLIDER_EVENT_TOUCHEND, event => end(event));
    }
  }

  _keydown(event) {
    if (/input|textarea/i.test(event.target.tagName)) {
      return;
    }

    switch (event.key) {
      case ARROW_LEFT_KEY:
        event.preventDefault();
        this.prev();
        break;

      case ARROW_RIGHT_KEY:
        event.preventDefault();
        this.next();
        break;

      default:
    }
  }

  _getItemIndex(element) {
    this._items = element && element.parentNode ? SelectorEngine.find(SLIDER_SELECTOR_ITEM, element.parentNode) : [];
    return this._items.indexOf(element);
  }

  _getItemByDirection(direction, activeElement) {
    const isNextDirection = direction === SLIDER_DIRECTION_NEXT;
    const isPrevDirection = direction === SLIDER_DIRECTION_PREV;

    const activeIndex = this._getItemIndex(activeElement);

    const lastItemIndex = this._items.length - 1;
    const isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

    if (isGoingToWrap && !this._config.wrap) {
      return activeElement;
    }

    const delta = direction === SLIDER_DIRECTION_PREV ? -1 : 1;
    const itemIndex = (activeIndex + delta) % this._items.length;
    return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
  }

  _triggerSlideEvent(relatedTarget, eventDirectionName) {
    const targetIndex = this._getItemIndex(relatedTarget);

    const fromIndex = this._getItemIndex(SelectorEngine.findOne(SLIDER_SELECTOR_ACTIVE_ITEM, this._element));

    return EventHandler.trigger(this._element, SLIDER_SLIDER_EVENT_SLIDE, {
      relatedTarget,
      direction: eventDirectionName,
      from: fromIndex,
      to: targetIndex
    });
  }

  _setActiveIndicatorElement(element) {
    if (this._indicatorsElement) {
      const indicators = SelectorEngine.find(SLIDER_SELECTOR_ACTIVE, this._indicatorsElement);

      for (let i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove(SLIDER_CLASS_NAME_ACTIVE);
      }

      const nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

      if (nextIndicator) {
        nextIndicator.classList.add(SLIDER_CLASS_NAME_ACTIVE);
      }
    }
  }

  _slide(direction, element) {
    const activeElement = SelectorEngine.findOne(SLIDER_SELECTOR_ACTIVE_ITEM, this._element);

    const activeElementIndex = this._getItemIndex(activeElement);

    const nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

    const nextElementIndex = this._getItemIndex(nextElement);

    const isCycling = Boolean(this._interval);
    let directionalClassName;
    let orderClassName;
    let eventDirectionName;

    if (direction === SLIDER_DIRECTION_NEXT) {
      directionalClassName = SLIDER_CLASS_NAME_LEFT;
      orderClassName = SLIDER_CLASS_NAME_NEXT;
      eventDirectionName = SLIDER_DIRECTION_LEFT;
    } else {
      directionalClassName = SLIDER_CLASS_NAME_RIGHT;
      orderClassName = SLIDER_CLASS_NAME_PREV;
      eventDirectionName = SLIDER_DIRECTION_RIGHT;
    }

    if (nextElement && nextElement.classList.contains(SLIDER_CLASS_NAME_ACTIVE)) {
      this._isSliding = false;
      return;
    }

    const slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

    if (slideEvent.defaultPrevented) {
      return;
    }

    if (!activeElement || !nextElement) {
      // Some weirdness is happening, so we bail
      return;
    }

    this._isSliding = true;

    if (isCycling) {
      this.pause();
    }

    this._setActiveIndicatorElement(nextElement);

    if (this._element.classList.contains(SLIDER_CLASS_NAME_SLIDE)) {
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const nextElementInterval = parseInt(nextElement.getAttribute('data-interval'), 10);

      if (nextElementInterval) {
        this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
        this._config.interval = nextElementInterval;
      } else {
        this._config.interval = this._config.defaultInterval || this._config.interval;
      }

      const transitionDuration = getTransitionDurationFromElement(activeElement);
      EventHandler.one(activeElement, TRANSITION_END, () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(SLIDER_CLASS_NAME_ACTIVE);
        activeElement.classList.remove(SLIDER_CLASS_NAME_ACTIVE, orderClassName, directionalClassName);
        this._isSliding = false;
        setTimeout(() => {
          EventHandler.trigger(this._element, SLIDER_EVENT_SLID, {
            relatedTarget: nextElement,
            direction: eventDirectionName,
            from: activeElementIndex,
            to: nextElementIndex
          });
        }, 0);
      });
      emulateTransitionEnd(activeElement, transitionDuration);
    } else {
      activeElement.classList.remove(SLIDER_CLASS_NAME_ACTIVE);
      nextElement.classList.add(SLIDER_CLASS_NAME_ACTIVE);
      this._isSliding = false;
      EventHandler.trigger(this._element, SLIDER_EVENT_SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });
    }

    if (isCycling) {
      this.cycle();
    }
  } // Static


  static sliderInterface(element, config) {
    let data = Data.getData(element, SLIDER_DATA_KEY);
    let _config = { ...Default,
      ...Manipulator.getDataAttributes(element)
    };

    if (typeof config === 'object') {
      _config = { ..._config,
        ...config
      };
    }

    const action = typeof config === 'string' ? config : _config.slide;

    if (!data) {
      data = new Slider(element, _config);
    }

    if (typeof config === 'number') {
      data.to(config);
    } else if (typeof action === 'string') {
      if (typeof data[action] === 'undefined') {
        throw new TypeError(`No method named "${action}"`);
      }

      data[action]();
    } else if (_config.interval && _config.ride) {
      data.pause();
      data.cycle();
    }
  }

  static dataApiClickHandler(event) {
    const target = getElementFromSelector(this);

    if (!target || !target.classList.contains(SLIDER_CLASS_NAME_SLIDER)) {
      return;
    }

    const config = { ...Manipulator.getDataAttributes(target),
      ...Manipulator.getDataAttributes(this)
    };
    const slideIndex = this.getAttribute('data-slide-to');

    if (slideIndex) {
      config.interval = false;
    }

    Slider.sliderInterface(target, config);

    if (slideIndex) {
      Data.getData(target, SLIDER_DATA_KEY).to(slideIndex);
    }

    event.preventDefault();
  }

  static getInstance(element) {
    return Data.getData(element, SLIDER_DATA_KEY);
  }

}
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, SLIDER_EVENT_CLICK_DATA_API, SLIDER_SELECTOR_DATA_SLIDE, Slider.dataApiClickHandler);
EventHandler.on(window, SLIDER_EVENT_LOAD_DATA_API, () => {
  const sliders = SelectorEngine.find(SLIDER_SELECTOR_DATA_RIDE);

  for (let i = 0, len = sliders.length; i < len; i++) {
    Slider.sliderInterface(sliders[i], Data.getData(sliders[i], SLIDER_DATA_KEY));
  }
});
/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Slider;
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): tab.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): toast.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): tooltip.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */
//# sourceMappingURL=chichi.js.map
