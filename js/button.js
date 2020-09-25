/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): button.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */

import Data from './dom/data'
import EventHandler from './dom/event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const BUTTON_NAME = 'button'
const BUTTON_VERSION = '0.1.0-alpha1'
const BUTTON_DATA_KEY = 'chichi.button'
const BUTTON_EVENT_KEY = `.${BUTTON_DATA_KEY}`
const BUTTON_DATA_API_KEY = '.data-api'
const BUTTON_CLASS_NAME_ACTIVE = 'is-active'
const BUTTON_SELECTOR_DATA_TOGGLE = '[data-toggle="button"]'
const BUTTON_EVENT_CLICK_DATA_API = `click${BUTTON_EVENT_KEY}${BUTTON_DATA_API_KEY}`

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Button {
  constructor(element) {
    this._element = element
    Data.setData(element, BUTTON_DATA_KEY, this)
  }

  // Getters

  static get VERSION() {
    return BUTTON_VERSION
  }

  // Public

  toggle() {
    // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
    this._element.setAttribute('aria-pressed', this._element.classList.toggle(BUTTON_CLASS_NAME_ACTIVE))
  }

  dispose() {
    Data.removeData(this._element, BUTTON_DATA_KEY)
    this._element = null
  }

  // Static

  static getInstance(element) {
    return Data.getData(element, BUTTON_DATA_KEY)
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(document, BUTTON_EVENT_CLICK_DATA_API, BUTTON_SELECTOR_DATA_TOGGLE, event => {
  event.preventDefault()

  const button = event.target.closest(BUTTON_SELECTOR_DATA_TOGGLE)

  let data = Data.getData(button, BUTTON_DATA_KEY)
  if (!data) {
    data = new Button(button)
  }

  data.toggle()
})

/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Button
