/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha1): alert.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */

import { TRANSITION_END, emulateTransitionEnd, getElementFromSelector, getTransitionDurationFromElement } from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const ALERT_NAME = 'alert'
const ALERT_VERSION = '0.1.0-alpha1'
const ALERT_DATA_KEY = 'chichi.alert'
const ALERT_EVENT_KEY = `.${ALERT_DATA_KEY}`
const ALERT_DATA_API_KEY = '.data-api'

const ALERT_SELECTOR_DISMISS = '[data-dismiss="alert"]'

const ALERT_EVENT_CLOSE = `close${ALERT_EVENT_KEY}`
const ALERT_EVENT_CLOSED = `closed${ALERT_EVENT_KEY}`
const ALERT_EVENT_CLICK_DATA_API = `click${ALERT_EVENT_KEY}${ALERT_DATA_API_KEY}`

const CLASSNAME_ALERT = 'alert'
const ALERT_CLASSNAME_FADE = 'fade'
const ALERT_CLASSNAME_SHOW = 'show'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Alert {
  constructor(element) {
    this._element = element

    if (this._element) {
      Data.setData(element, ALERT_DATA_KEY, this)
    }
  }

  // Getters

  static get VERSION() {
    return ALERT_VERSION
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
    Data.removeData(this._element, ALERT_DATA_KEY)
    this._element = null
  }

  // Private

  _getRootElement(element) {
    return getElementFromSelector(element) || element.closest(`.${ALERT_CLASSNAME_ALERT}`)
  }

  _triggerCloseEvent(element) {
    return EventHandler.trigger(element, ALERT_EVENT_CLOSE)
  }

  _removeElement(element) {
    element.classList.remove(ALERT_CLASSNAME_SHOW)

    if (!element.classList.contains(ALERT_CLASSNAME_FADE)) {
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

    EventHandler.trigger(element, ALERT_EVENT_CLOSED)
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, ALERT_DATA_KEY)

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
    return Data.getData(element, ALERT_DATA_KEY)
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */
EventHandler
  .on(
    document,
    ALERT_EVENT_CLICK_DATA_API,
    ALERT_SELECTOR_DISMISS,
    Alert.handleDismiss( new Alert() )
  )


/**
 * ------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------
 */

export default Alert
