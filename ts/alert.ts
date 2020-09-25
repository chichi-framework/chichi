/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha1): alert.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */

import {
  TRANSITION_END,
  emulateTransitionEnd,
  getElementFromSelector,
  getTransitionDurationFromElement
} from '@utils/index'

import Data from './dom/data'
import EventHandler from './dom/event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'alert'
const VERSION = '0.1.0-alpha1'
const DATA_KEY = 'chichi.alert'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const SELECTOR_DISMISS = '[data-dismiss="alert"]'

const EVENT_CLOSE = `close${EVENT_KEY}`
const EVENT_CLOSED = `closed${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const CLASSNAME_ALERT = 'alert'
const CLASSNAME_FADE = 'fade'
const CLASSNAME_SHOW = 'show'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Alert {
  constructor(element) {
    this._element = element

    if (this._element) {
      Data.setData(element, DATA_KEY, this)
    }
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  // Public

  close(element) {
    let rootElement = this._element
    if (element) {
      rootElement = this._getRootElement(element)
    }

    const customEvent = this._triggerCloseEvent(rootElement)

    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }

    this._removeElement(rootElement)
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  // Private

  _getRootElement(element) {
    return getElementFromSelector(element) || element.closest(`.${CLASSNAME_ALERT}`)
  }

  _triggerCloseEvent(element) {
    return EventHandler.trigger(element, EVENT_CLOSE)
  }

  _removeElement(element) {
    element.classList.remove(CLASSNAME_SHOW)

    if (!element.classList.contains(CLASSNAME_FADE)) {
      this._destroyElement(element)
      return
    }

    const transitionDuration = getTransitionDurationFromElement(element)

    EventHandler
      .one(element, TRANSITION_END, () => this._destroyElement(element))
    emulateTransitionEnd(element, transitionDuration)
  }

  _destroyElement(element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }

    EventHandler.trigger(element, EVENT_CLOSED)
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, DATA_KEY)

      if (!data) {
        data = new Alert(this)
      }

      if (config === 'close') {
        data[config](this)
      }
    })
  }

  static handleDismiss(alertInstance) {
    return function (event) {
      if (event) {
        event.preventDefault()
      }

      alertInstance.close(this)
    }
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */
EventHandler
  .on(document, EVENT_CLICK_DATA_API, SELECTOR_DISMISS, Alert.handleDismiss(new Alert()))

const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Alert