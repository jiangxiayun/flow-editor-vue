import ORYX_Config from '../CONFIG'
import ORYX_Editor from '../Editor'

/**
 * This plugin is responsible for displaying loading indicators and to prevent
 * the user from accidently unloading the page by, e.g., pressing the backspace
 * button and returning to the previous site in history.
 * @param {Object} facade The editor plugin facade to register enhancements with.
 */
export default class Loading {

  constructor (facade) {
    this.facade = facade

    // The parent Node
    this.node = ORYX_Editor.graft('http://www.w3.org/1999/xhtml', this.facade.getCanvas().getHTMLContainer().parentNode, ['div', {
      'class': 'LoadingIndicator'
    }, ''])

    this.facade.registerOnEvent(ORYX_Config.EVENT_LOADING_ENABLE, this.enableLoading.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_LOADING_DISABLE, this.disableLoading.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_LOADING_STATUS, this.showStatus.bind(this))

    this.disableLoading()
  }

  enableLoading (options) {
    if (options.text)
      this.node.innerHTML = options.text + '...'
    else
      this.node.innerHTML = 'Please wait...'
    this.node.removeClassName('StatusIndicator')
    this.node.addClassName('LoadingIndicator')
    this.node.style.display = 'block'

    let pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode

    this.node.style.top = pos.offsetTop + 'px'
    this.node.style.left = pos.offsetLeft + 'px'
  }

  disableLoading () {
    this.node.style.display = 'none'
  }

  showStatus (options) {
    if (options.text) {
      this.node.innerHTML = options.text
      this.node.addClassName('StatusIndicator')
      this.node.removeClassName('LoadingIndicator')
      this.node.style.display = 'block'

      let pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode

      this.node.style.top = pos.offsetTop + 'px'
      this.node.style.left = pos.offsetLeft + 'px'

      let tout = options.timeout ? options.timeout : 2000

      window.setTimeout((function () {

        this.disableLoading()

      }).bind(this), tout)
    }

  }
}

