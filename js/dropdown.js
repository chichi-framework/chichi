/**
 * --------------------------------------------------------------------------
 * ChiChi (v0.1.0-alpha2): dropdown.ts
 * Licensed under MIT
 * --------------------------------------------------------------------------
 */

 import { getElementFromSelector, isElement, isVisible, noop } from './util/index'
 import Data from './dom/data'
 import EventHandler from './dom/event-handler'
 import Manipulator from './dom/manipulator'
 import Popper from 'popper.js'
 import SelectorEngine from './dom/selector-engine'

 /**
  * ------------------------------------------------------------------------
  * Constants
  * ------------------------------------------------------------------------
  */

 const DROPDOWN_NAME = 'dropdown'
 const DROPDOWN_VERSION = '0.1.0-alpha1'
 const DROPDOWN_DATA_KEY = 'chichi.dropdown'
 const DROPDOWN_EVENT_KEY = `.${DROPDOWN_DATA_KEY}`
 const DROPDOWN_DATA_API_KEY = '.data-api'

 const DROPDOWN_ESCAPE_KEY = 'Escape'
 const DROPDOWN_SPACE_KEY = 'Space'
 const DROPDOWN_TAB_KEY = 'Tab'
 const DROPDOWN_ARROW_UP_KEY = 'ArrowUp'
 const DROPDOWN_ARROW_DOWN_KEY = 'ArrowDown'
 const DROPDOWN_RIGHT_MOUSE_BUTTON = 2 // MouseEvent.button value for the secondary button, usually the right button

 const DROPDOWN_REGEXP_KEYDOWN = new RegExp(`${DROPDOWN_ARROW_UP_KEY}|${DROPDOWN_ARROW_DOWN_KEY}|${DROPDOWN_ESCAPE_KEY}`)

 const DROPDOWN_EVENT_HIDE = `hide${DROPDOWN_EVENT_KEY}`
 const DROPDOWN_EVENT_HIDDEN = `hidden${DROPDOWN_EVENT_KEY}`
 const DROPDOWN_EVENT_SHOW = `show${DROPDOWN_EVENT_KEY}`
 const DROPDOWN_EVENT_SHOWN = `shown${DROPDOWN_EVENT_KEY}`
 const DROPDOWN_EVENT_CLICK = `click${DROPDOWN_EVENT_KEY}`
 const DROPDOWN_EVENT_CLICK_DATA_API = `click${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`
 const DROPDOWN_EVENT_KEYDOWN_DATA_API = `keydown${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`
 const DROPDOWN_EVENT_KEYUP_DATA_API = `keyup${DROPDOWN_EVENT_KEY}${DATA_API_KEY}`

 const DROPDOWN_CLASS_NAME_DISABLED = 'disabled'
 const DROPDOWN_CLASS_NAME_ACTIVE = 'is-active'
 const DROPDOWN_CLASS_NAME_DROPUP = 'is-up'
 const DROPDOWN_CLASS_NAME_DROPRIGHT = 'is-right'
 const DROPDOWN_CLASS_NAME_DROPLEFT = 'is-left'
 const DROPDOWN_CLASS_NAME_MENURIGHT = 'dropdown-menu-right'
 const DROPDOWN_CLASS_NAME_NAVBAR = 'navbar'
 const DROPDOWN_CLASS_NAME_POSITION_STATIC = 'is-static'

 const DROPDOWN_SELECTOR_DATA_TOGGLE = '[data-toggle="dropdown"]'
 const DROPDOWN_SELECTOR_FORM_CHILD = '.dropdown form'
 const DROPDOWN_SELECTOR_MENU = '.dropdown-menu'
 const DROPDOWN_SELECTOR_NAVBAR_NAV = '.navbar-item'
 const DROPDOWN_SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'

 const DROPDOWN_PLACEMENT_TOP = 'top-start'
 const DROPDOWN_PLACEMENT_TOPEND = 'top-end'
 const DROPDOWN_PLACEMENT_BOTTOM = 'bottom-start'
 const DROPDOWN_PLACEMENT_BOTTOMEND = 'bottom-end'
 const DROPDOWN_PLACEMENT_RIGHT = 'right-start'
 const DROPDOWN_PLACEMENT_LEFT = 'left-start'

 const DropdownDefaults = {
   offset: 0,
   flip: true,
   boundary: 'scrollParent',
   reference: 'toggle',
   display: 'dynamic',
   popperConfig: null
 }

/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

 class Dropdown {
   constructor(element, config) {
     this._element = element
     this._popper = null
     this._config = this._getConfig(config)
     this._menu = this._getMenuElement()
     this._inNavbar = this._detectNavbar()

     this._addEventListeners()
     Data.setData(element, DROPDOWN_DATA_KEY, this)
   }

   // Getters

   static get VERSION() {
     return DROPDOWN_VERSION
   }

   static get Default() {
     return DropdownDefaults
   }

   // Public

   toggle() {
     if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED)) {
       return
     }

     const isActive = this._element.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)

     Dropdown.clearMenus()

     if (isActive) {
       return
     }

     this.show()
   }

   show() {
     if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED) || this._menu.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
       return
     }

     const parent = Dropdown.getParentFromElement(this._element)
     const relatedTarget = {
       relatedTarget: this._element
     }

     const showEvent = EventHandler.trigger(this._element, DROPDOWN_DROPDOWN_EVENT_SHOW, relatedTarget)

     if (showEvent.defaultPrevented) {
       return
     }

     // Disable totally Popper.js for Dropdown in Navbar
     if (!this._inNavbar) {
       if (typeof Popper === 'undefined') {
         throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org)')
       }

       let referenceElement = this._element

       if (this._config.reference === 'parent') {
         referenceElement = parent
       } else if (isElement(this._config.reference)) {
         referenceElement = this._config.reference

         // Check if it's jQuery element
         if (typeof this._config.reference.jquery !== 'undefined') {
           referenceElement = this._config.reference[0]
         }
       }

       // If boundary is not `scrollParent`, then set position to `static`
       // to allow the menu to "escape" the scroll parent's boundaries
       // https://github.com/twbs/bootstrap/issues/24251
       if (this._config.boundary !== 'scrollParent') {
         parent.classList.add(DROPDOWN_CLASS_NAME_POSITION_STATIC)
       }

       this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig())
     }

     // If this is a touch-enabled device we add extra
     // empty mouseover listeners to the body's immediate children;
     // only needed because of broken event delegation on iOS
     // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
     if ('ontouchstart' in document.documentElement &&
       !parent.closest(DROPDOWN_SELECTOR_NAVBAR_NAV)) {
       [].concat(...document.body.children)
         .forEach(elem => EventHandler.on(elem, 'mouseover', null, noop()))
     }

     this._element.focus()
     this._element.setAttribute('aria-expanded', true)

     Manipulator.toggleClass(this._menu, DROPDOWN_CLASS_NAME_ACTIVE)
     Manipulator.toggleClass(this._element, DROPDOWN_CLASS_NAME_ACTIVE)
     EventHandler.trigger(parent, DROPDOWN_EVENT_SHOWN, relatedTarget)
   }

   hide() {
     if (this._element.disabled || this._element.classList.contains(DROPDOWN_CLASS_NAME_DISABLED) || !this._menu.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
       return
     }

     const parent = Dropdown.getParentFromElement(this._element)
     const relatedTarget = {
       relatedTarget: this._element
     }

     const hideEvent = EventHandler.trigger(parent, DROPDOWN_EVENT_HIDE, relatedTarget)

     if (hideEvent.defaultPrevented) {
       return
     }

     if (this._popper) {
       this._popper.destroy()
     }

     Manipulator.toggleClass(this._menu, DROPDOWN_CLASS_NAME_ACTIVE)
     Manipulator.toggleClass(this._element, DROPDOWN_CLASS_NAME_ACTIVE)
     EventHandler.trigger(parent, DROPDOWN_EVENT_HIDDEN, relatedTarget)
   }

   dispose() {
     Data.removeData(this._element, DROPDOWN_DATA_KEY)
     EventHandler.off(this._element, DROPDOWN_EVENT_KEY)
     this._element = null
     this._menu = null
     if (this._popper) {
       this._popper.destroy()
       this._popper = null
     }
   }

   update() {
     this._inNavbar = this._detectNavbar()
     if (this._popper) {
       this._popper.scheduleUpdate()
     }
   }

   // Private

   _addEventListeners() {
     EventHandler.on(this._element, DROPDOWN_EVENT_CLICK, event => {
       event.preventDefault()
       event.stopPropagation()
       this.toggle()
     })
   }

   _getConfig(config) {
     config = {
       ...this.constructor.Default,
       ...Manipulator.getDataAttributes(this._element),
       ...config
     }

     return config
   }

   _getMenuElement() {
     return SelectorEngine.next(this._element, DROPDOWN_SELECTOR_MENU)[0]
   }

   _getPlacement() {
     const parentDropdown = this._element.parentNode
     let placement = DROPDOWN_PLACEMENT_BOTTOM

     // Handle dropup
     if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPUP)) {
       placement = DROPDOWN_PLACEMENT_TOP
       if (this._menu.classList.contains(DROPDOWN_CLASS_NAME_MENURIGHT)) {
         placement = DROPDOWN_PLACEMENT_TOPEND
       }
     } else if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPRIGHT)) {
       placement = DROPDOWN_PLACEMENT_RIGHT
     } else if (parentDropdown.classList.contains(DROPDOWN_CLASS_NAME_DROPLEFT)) {
       placement = DROPDOWN_PLACEMENT_LEFT
     } else if (this._menu.classList.contains(DROPDOWN_CLASS_NAME_MENURIGHT)) {
       placement = DROPDOWN_PLACEMENT_BOTTOMEND
     }

     return placement
   }

   _detectNavbar() {
     return Boolean(this._element.closest(`.${DROPDOWN_CLASS_NAME_NAVBAR}`))
   }

   _getOffset() {
     const offset = {}

     if (typeof this._config.offset === 'function') {
       offset.fn = data => {
         data.offsets = {
           ...data.offsets,
           ...this._config.offset(data.offsets, this._element) || {}
         }

         return data
       }
     } else {
       offset.offset = this._config.offset
     }

     return offset
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
     }

     // Disable Popper.js if we have a static display
     if (this._config.display === 'static') {
       popperConfig.modifiers.applyStyle = {
         enabled: false
       }
     }

     return {
       ...popperConfig,
       ...this._config.popperConfig
     }
   }

   // Static

   static dropdownInterface(element, config) {
     let data = Data.getData(element, DROPDOWN_DATA_KEY)
     const _config = typeof config === 'object' ? config : null

     if (!data) {
       data = new Dropdown(element, _config)
     }

     if (typeof config === 'string') {
       if (typeof data[config] === 'undefined') {
         throw new TypeError(`No method named "${config}"`)
       }

       data[config]()
     }
   }

   static clearMenus(event) {
     if (event && (event.button === DROPDOWN_RIGHT_MOUSE_BUTTON ||
       (event.type === 'keyup' && event.key !== DROPDOWN_TAB_KEY))) {
       return
     }

     const toggles = SelectorEngine.find(DROPDOWN_SELECTOR_DATA_TOGGLE)

     for (let i = 0, len = toggles.length; i < len; i++) {
       const parent = Dropdown.getParentFromElement(toggles[i])
       const context = Data.getData(toggles[i], DROPDOWN_DATA_KEY)
       const relatedTarget = {
         relatedTarget: toggles[i]
       }

       if (event && event.type === 'click') {
         relatedTarget.clickEvent = event
       }

       if (!context) {
         continue
       }

       const dropdownMenu = context._menu
       if (!toggles[i].classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)) {
         continue
       }

       if (event && ((event.type === 'click' &&
           /input|textarea/i.test(event.target.tagName)) ||
           (event.type === 'keyup' && event.key === DROPDOWN_TAB_KEY)) &&
           dropdownMenu.contains(event.target)) {
         continue
       }

       const hideEvent = EventHandler.trigger(parent, DROPDOWN_EVENT_HIDE, relatedTarget)
       if (hideEvent.defaultPrevented) {
         continue
       }

       // If this is a touch-enabled device we remove the extra
       // empty mouseover listeners we added for iOS support
       if ('ontouchstart' in document.documentElement) {
         [].concat(...document.body.children)
           .forEach(elem => EventHandler.off(elem, 'mouseover', null, noop()))
       }

       toggles[i].setAttribute('aria-expanded', 'false')

       if (context._popper) {
         context._popper.destroy()
       }

       dropdownMenu.classList.remove(DROPDOWN_CLASS_NAME_ACTIVE)
       toggles[i].classList.remove(DROPDOWN_CLASS_NAME_ACTIVE)
       EventHandler.trigger(parent, DROPDOWN_EVENT_HIDDEN, relatedTarget)
     }
   }

   static getParentFromElement(element) {
     return getElementFromSelector(element) || element.parentNode
   }

   static dataApiKeydownHandler(event) {
     // If not input/textarea:
     //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
     // If input/textarea:
     //  - If space key => not a dropdown command
     //  - If key is other than escape
     //    - If key is not up or down => not a dropdown command
     //    - If trigger inside the menu => not a dropdown command
     if (/input|textarea/i.test(event.target.tagName) ?
       event.key === DROPDOWN_SPACE_KEY || (event.key !== DROPDOWN_ESCAPE_KEY &&
       ((event.key !== DROPDOWN_ARROW_DOWN_KEY && event.key !== DROPDOWN_ARROW_UP_KEY) ||
         event.target.closest(DROPDOWN_SELECTOR_MENU))) :
       !DROPDOWN_REGEXP_KEYDOWN.test(event.key)) {
       return
     }

     event.preventDefault()
     event.stopPropagation()

     if (this.disabled || this.classList.contains(DROPDOWN_CLASS_NAME_DISABLED)) {
       return
     }

     const parent = Dropdown.getParentFromElement(this)
     const isActive = this.classList.contains(DROPDOWN_CLASS_NAME_ACTIVE)

     if (event.key === DROPDOWN_ESCAPE_KEY) {
       const button = this.matches(SDROPDOWN_ELECTOR_DATA_TOGGLE) ? this : SelectorEngine.prev(this, DROPDOWN_SELECTOR_DATA_TOGGLE)[0]
       button.focus()
       Dropdown.clearMenus()
       return
     }

     if (!isActive || event.key === DROPDOWN_SPACE_KEY) {
       Dropdown.clearMenus()
       return
     }

     const items = SelectorEngine.find(DROPDOWN_SELECTOR_VISIBLE_ITEMS, parent)
       .filter(isVisible)

     if (!items.length) {
       return
     }

     let index = items.indexOf(event.target)

     if (event.key === DROPDOWN_ARROW_UP_KEY && index > 0) { // Up
       index--
     }

     if (event.key === DROPDOWN_ARROW_DOWN_KEY && index < items.length - 1) { // Down
       index++
     }

     // index is -1 if the first keydown is an ArrowUp
     index = index === -1 ? 0 : index

     items[index].focus()
   }

   static getInstance(element) {
     return Data.getData(element, DROPDOWN_DATA_KEY)
   }
 }

/**
* ------------------------------------------------------------------------
* Data Api implementation
* ------------------------------------------------------------------------
*/

 EventHandler.on(document, DROPDOWN_EVENT_KEYDOWN_DATA_API, DROPDOWN_SELECTOR_DATA_TOGGLE, Dropdown.dataApiKeydownHandler)
 EventHandler.on(document, DROPDOWN_EVENT_KEYDOWN_DATA_API, DROPDOWN_SELECTOR_MENU, Dropdown.dataApiKeydownHandler)
 EventHandler.on(document, DROPDOWN_EVENT_CLICK_DATA_API, Dropdown.clearMenus)
 EventHandler.on(document, DROPDOWN_EVENT_KEYUP_DATA_API, Dropdown.clearMenus)
 EventHandler.on(document, DROPDOWN_EVENT_CLICK_DATA_API, DROPDOWN_SELECTOR_DATA_TOGGLE, function (event) {
   event.preventDefault()
   event.stopPropagation()
   Dropdown.dropdownInterface(this, 'toggle')
 })
 EventHandler
   .on(document, DROPDOWN_EVENT_CLICK_DATA_API, DROPDOWN_SELECTOR_FORM_CHILD, e => e.stopPropagation())

/**
* ------------------------------------------------------------------------
* Exports
* ------------------------------------------------------------------------
*/

 export default Dropdown
