import UIObject from '../UIObject'

/**
 * @classDescription Abstract base class for all Controls.
 */
export default class Control extends UIObject{
  toString () {
    return 'Control ' + this.id
  }
}