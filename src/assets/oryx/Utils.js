import ORYX_CONFIG from './CONFIG'

const Utils = {
  /**
   * General helper method for parsing a param out of current location url
   * 获取当前url上的参数
   * @example
   * // Current url in Browser => "http://oryx.org?param=value"
   * ORYX.Utils.getParamFromUrl("param") // => "value"
   * @param {Object} name
   */
  getParamFromUrl: function (name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
    var regexS = '[\\?&]' + name + '=([^&#]*)'
    var regex = new RegExp(regexS)
    var results = regex.exec(window.location.href)
    if (results == null) {
      return null
    }
    else {
      return results[1]
    }
  },

  adjustLightness: function () {
    return arguments[0]
  },

  adjustGradient: function (gradient, reference) {

    if (ORYX_CONFIG.DISABLE_GRADIENT && gradient) {

      var col = reference.getAttributeNS(null, 'stop-color') || '#ffffff'

      $A(gradient.getElementsByTagName('stop')).each(function (stop) {
        if (stop == reference) {
          return
        }
        stop.setAttributeNS(null, 'stop-color', col)
      })
    }
  },

  // TODO Implement namespace awareness on attribute level.
  /**
   * graft() function
   * Originally by Sean M. Burke from interglacial.com, altered for usage with
   * SVG and namespace (xmlns) support. Be sure you understand xmlns before
   * using this funtion, as it creates all grafted elements in the xmlns
   * provided by you and all element's attribures in default xmlns. If you
   * need to graft elements in a certain xmlns and wish to assign attributes
   * in both that and another xmlns, you will need to do stepwise grafting,
   * adding non-default attributes yourself or you'll have to enhance this
   * function. Latter, I would appreciate: martin�apfelfabrik.de
   * @param {Object} namespace The namespace in which
   *          elements should be grafted.
   * @param {Object} parent The element that should contain the grafted
   *          structure after the function returned.
   * @param {Object} t the crafting structure.
   * @param {Object} doc the document in which grafting is performed.
   */
  graft: function (namespace, parent, t, doc) {
    doc = (doc || (parent && parent.ownerDocument) || document)
    let e
    if (t === undefined) {
      throw 'Can\'t graft an undefined value'
    } else if (t.constructor == String) {
      e = doc.createTextNode(t)
    } else {
      for (let i = 0; i < t.length; i++) {
        if (i === 0 && t[i].constructor == String) {
          let snared = t[i].match(/^([a-z][a-z0-9]*)\.([^\s\.]+)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])
            e.setAttributeNS(null, 'class', snared[2])
            continue
          }
          snared = t[i].match(/^([a-z][a-z0-9]*)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])  // but no class
            continue
          }

          // Otherwise:
          e = doc.createElementNS(namespace, 'span')
          e.setAttribute(null, 'class', 'namelessFromLOL')
        }

        if (t[i] === undefined) {
          throw 'Can\'t graft an undefined value in a list!'
        } else if (t[i].constructor == String || t[i].constructor == Array) {
          this.graft(namespace, e, t[i], doc)
        } else if (t[i].constructor == Number) {
          this.graft(namespace, e, t[i].toString(), doc)
        } else if (t[i].constructor == Object) {
          // hash's properties => element's attributes
          for (var k in t[i]) {
            e.setAttributeNS(null, k, t[i][k])
          }
        } else {

        }
      }
    }
    if (parent && parent.appendChild) {
      parent.appendChild(e)
    } else {

    }
    return e // return the topmost created node
  },
  /**
   * Provides an uniq id
   * @overwrite
   * @return {String}
   *
   */
  provideId: function  () {
    let res = [], hex = '0123456789ABCDEF'
    for (let i = 0; i < 36; i++) res[i] = Math.floor(Math.random() * 0x10)

    res[14] = 4
    res[19] = (res[19] & 0x3) | 0x8

    for (let i = 0; i < 36; i++) { res[i] = hex[res[i]] }
    res[8] = res[13] = res[18] = res[23] = '-'

    return 'sid-' + res.join('')
  }
  /**
   * Workaround for SAFARI/Webkit, because
   * when trying to check SVGSVGElement of instanceof there is
   * raising an error
   *
   */
  SVGClassElementsAreAvailable: true
}

export default Utils