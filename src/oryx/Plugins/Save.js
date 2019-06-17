import ORYX_Config from '../CONFIG'

export default class Save {
  changeSymbol = '*'
  constructor (facade) {
    this.facade = facade
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.keyCode === 83) {
        Event.stop(e)
      }
    }, false)

    this.onUnLoadFun = this.onUnLoad.bind(this)

    window.onbeforeunload = this.onUnLoadFun

    this.changeDifference = 0

    // Register on event for executing commands --> store all commands in a stack
    // --> Execute
    this.facade.registerOnEvent(ORYX_Config.EVENT_UNDO_EXECUTE, function () {
      this.changeDifference++
      this.updateTitle()
    }.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_EXECUTE_COMMANDS, function () {
      this.changeDifference++
      this.updateTitle()
    }.bind(this))
    // --> Saved from other places in the editor
    this.facade.registerOnEvent(ORYX_Config.EVENT_SAVED, function () {
      this.changeDifference = 0
      this.updateTitle()
    }.bind(this))

    // --> Rollback
    this.facade.registerOnEvent(ORYX_Config.EVENT_UNDO_ROLLBACK, function () {
      this.changeDifference--
      this.updateTitle()
    }.bind(this))

    //TODO very critical for load time performance!!!
    // this.serializedDOM = DataManager.__persistDOM(this.facade);

    this.hasChanges = this._hasChanges.bind(this)
  }

  updateTitle () {
    let value = window.document.title || document.getElementsByTagName('title')[0].childNodes[0].nodeValue

    if (this.changeDifference === 0 && value.startsWith(this.changeSymbol)) {
      window.document.title = value.slice(1)
    } else if (this.changeDifference !== 0 && !value.startsWith(this.changeSymbol)) {
      window.document.title = this.changeSymbol + '' + value
    }
  }

  _hasChanges () {
    if (this.changeDifference !== 0) {
      return true
    } else {
      let modelMetaData = this.facade.getModelMetaData()
      if (modelMetaData && modelMetaData['new'] &&
        this.facade.getCanvas().getChildShapes().size() > 0) {
        return true
      }
    }
    return false
  }

  onUnLoad () {
    if (this._hasChanges()) {
      // return ORYX.I18N.Save.unsavedData
      return '666There are unsaved data, please save before you leave, otherwise your changes get lost!'
    }
  }
}
