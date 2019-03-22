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
  }
}

export default Utils