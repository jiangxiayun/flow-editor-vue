/**
 * This class represents a stencil set. It offers methods for accessing
 *  the attributes of the stencil set description JSON file and the stencil set's
 *  stencils.
 */
import Stencil from './Stencil'
import Property from './Property'
import PropertyItem from './PropertyItem'
import ComplexPropertyItem from './ComplexPropertyItem'
import Rules from './Rules'
import _StencilSet from './StencilSet'
import _Index from './_Index'
import ORYX_Log from '../../Log'


const StencilSet = {
  Stencil: Stencil,
  Property: Property,
  PropertyItem: PropertyItem,
  ComplexPropertyItem: ComplexPropertyItem,
  Rules: Rules,
  StencilSet: _StencilSet,
  Index: _Index,
  // storage for loaded stencil sets by namespace
  _stencilSetsByNamespace: new Hash(),
  // storage for stencil sets by url
  _stencilSetsByUrl: new Hash(),
  // storage for stencil set namespaces by editor instances
  _StencilSetNSByEditorInstance: new Hash(),
  // storage for rules by editor instances
  _rulesByEditorInstance: new Hash(),

  /**
   *
   * @param {String} namespace
   *
   * @return {ORYX.Core.StencilSet.StencilSet} Returns the stencil set with the specified
   *                    namespace.
   *
   * The method can handle namespace strings like
   *  http://www.example.org/stencilset
   *  http://www.example.org/stencilset#
   *  http://www.example.org/stencilset#ANode
   */
  stencilSet:function (namespace) {
    ORYX_Log.trace('Getting stencil set %0', namespace)
    let splitted = namespace.split('#', 1)
    if (splitted.length === 1) {
      ORYX_Log.trace('Getting stencil set %0', splitted[0])
      return this._stencilSetsByNamespace.get(splitted[0] + '#')
    } else {
      return undefined
    }
  },
  /**
   *
   * @param {String} editorId
   *
   * @return {Hash} Returns a hash map with all stencil sets that are loaded by
   *          the editor with the editorId.
   */
  stencilSets:function (editorId) {
    let stencilSetNSs = this._StencilSetNSByEditorInstance.get(editorId)
    let stencilSets = new Hash()
    const me = this
    if (stencilSetNSs) {
      stencilSetNSs.each(function (stencilSetNS) {
        let stencilSet = me.stencilSet(stencilSetNS)
        stencilSets.set(stencilSet.namespace(), stencilSet)
      })
    }
    return stencilSets
  },
  /**
   * @param {String} id
   * @return {ORYX.Core.StencilSet.Stencil} Returns the stencil specified by the id.
   *
   * The id must be unique and contains the namespace of the stencil's stencil set.
   * e.g. http://www.example.org/stencilset#ANode
   */
  stencil:function (id) {
    ORYX_Log.trace('Getting stencil for %0', id)
    let ss = this.stencilSet(id)
    if (ss) {
      return ss.stencil(id)
    } else {
      ORYX_Log.trace('Cannot fild stencil for %0', id)
      return undefined
    }
  },

  /**
   *
   * @param {String} editorId
   *
   * @return {ORYX.Core.StencilSet.Rules} Returns the rules object for the editor
   *                  specified by its editor id.
   */
  rules:function (editorId) {
    if (!this._rulesByEditorInstance.get(editorId)) {
      this._rulesByEditorInstance.set(editorId, new Rules())
    }
    return this._rulesByEditorInstance.get(editorId)
  },

  /**
   *
   * @param {String} url
   * @param {String} editorId
   *
   * Loads a stencil set from url, if it is not already loaded.
   * It also stores which editor instance loads the stencil set and
   * initializes the Rules object for the editor instance.
   */
  loadStencilSet:function (url, stencilSet, editorId) {
    let namespace = stencilSet.namespace()

    // store stencil set
    this._stencilSetsByNamespace.set(namespace, stencilSet)
    // store stencil set by url
    this._stencilSetsByUrl.set(url, stencilSet)

    // store which editorInstance loads the stencil set
    if (this._StencilSetNSByEditorInstance.get(editorId)) {
      this._StencilSetNSByEditorInstance.get(editorId).push(namespace)
    } else {
      this._StencilSetNSByEditorInstance.set(editorId, [namespace])
    }

    // store the rules for the editor instance
    if (this._rulesByEditorInstance.get(editorId)) {
      this._rulesByEditorInstance.get(editorId).initializeRules(stencilSet)
    } else {
      let rules = new Rules()
      rules.initializeRules(stencilSet)
      this._rulesByEditorInstance.set(editorId, rules)
    }
  }
}

export default StencilSet