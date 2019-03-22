import ORYX_Log from '../../Log'
import Stencil from './Stencil'

export default class StencilSet {
  /**
   * @param source {URL} A reference to the stencil set specification.
   *
   */
  constructor (baseUrl, data) {
    this._extensions = new Hash()
    this._baseUrl = baseUrl
    this._jsonObject = {}
    this._stencils = new Hash()
    this._availableStencils = new Hash()

    this._init(data)
  }
  /**
   * Finds a root stencil in this stencil set. There may be many of these. If
   * there are, the first one found will be used. In Firefox, this is the
   * topmost definition in the stencil set description file.
   */
  findRootStencilName () {
    // find any stencil that may be root.
    let rootStencil = this._stencils.values().find(function (stencil) {
      return stencil._jsonStencil.mayBeRoot
    })

    // if there is none, just guess the first.
    if (!rootStencil) {
      ORYX_Log.warn('Did not find any stencil that may be root. Taking a guess.')
      rootStencil = this._stencils.values()[0]
    }

    // return its id.
    return rootStencil.id()
  }

  /**
   * @param {ORYX.Core.StencilSet.StencilSet} stencilSet
   * @return {Boolean} True, if stencil set has the same namespace.
   */
  equals (stencilSet) {
    return (this.namespace() === stencilSet.namespace())
  }

  /**
   * @param {Oryx.Core.StencilSet.Stencil} rootStencil If rootStencil is defined, it only returns stencils
   *      that could be (in)direct child of that stencil.
   */
  stencils (rootStencil, rules, sortByGroup) {
    if (rootStencil && rules) {
      const stencils = this._availableStencils.values()
      let containers = [rootStencil]
      let checkedContainers = []
      let result = []

      while (containers.size() > 0) {
        let container = containers.pop()
        checkedContainers.push(container)
        let children = stencils.findAll(function (stencil) {
          let args = {
            containingStencil: container,
            containedStencil: stencil
          }
          return rules.canContain(args)
        })
        for (let i = 0; i < children.size(); i++) {
          if (!checkedContainers.member(children[i])) {
            containers.push(children[i])
          }
        }
        result = result.concat(children).uniq()
      }

      // Sort the result to the origin order
      result = result.sortBy(function (stencil) {
        return stencils.indexOf(stencil)
      })

      if (sortByGroup) {
        result = result.sortBy(function (stencil) {
          return stencil.groups().first()
        })
      }

      let edges = stencils.findAll(function (stencil) {
        return stencil.type() == 'edge'
      })
      result = result.concat(edges)

      return result

    } else {
      if (sortByGroup) {
        return this._availableStencils.values().sortBy(function (stencil) {
          return stencil.groups().first()
        })
      } else {
        return this._availableStencils.values()
      }
    }
  }

  nodes () {
    return this._availableStencils.values().findAll(function (stencil) {
      return (stencil.type() === 'node')
    })
  }

  edges () {
    return this._availableStencils.values().findAll(function (stencil) {
      return (stencil.type() === 'edge')
    })
  }

  stencil (id) {
    return this._stencils.get(id)
  }

  title () {
    return this._jsonObject.title
  }

  description () {
    return this._jsonObject.description
  }

  namespace () {
    return this._jsonObject ? this._jsonObject.namespace : null
  }

  jsonRules () {
    return this._jsonObject ? this._jsonObject.rules : null
  }

  source () {
    return this._source
  }

  extensions () {
    return this._extensions
  }

  addExtension (url) {
    new Ajax.Request(url, {
      method: 'GET',
      asynchronous: false,
      onSuccess: (function (transport) {
        this.addExtensionDirectly(transport.responseText)
      }).bind(this),
      onFailure: (function (transport) {
        ORYX_Log.debug('Loading stencil set extension file failed. The request returned an error.' + transport)
      }).bind(this),
      onException: (function (transport) {
        ORYX_Log.debug('Loading stencil set extension file failed. The request returned an error.' + transport)
      }).bind(this)

    })
  }

  addExtensionDirectly (str) {
    try {
      // eval('var jsonExtension = ' + str)
      let jsonExtension = str

      if (!(jsonExtension['extends'].endsWith('#'))) {
        jsonExtension['extends'] += '#'
      }

      if (jsonExtension['extends'] == this.namespace()) {
        this._extensions.set(jsonExtension.namespace, jsonExtension)

        let defaultPosition = this._stencils.keys().size()
        // load new stencils
        if (jsonExtension.stencils) {
          $A(jsonExtension.stencils).each(function (stencil) {
            defaultPosition++
            let oStencil = new Stencil(stencil, this.namespace(), this._baseUrl, this, undefined, defaultPosition)
            this._stencils.set(oStencil.id(), oStencil)
            this._availableStencils.set(oStencil.id(), oStencil)
          }.bind(this))
        }

        // load additional properties
        if (jsonExtension.properties) {
          let stencils = this._stencils.values()
          stencils.each(function (stencil) {
            let roles = stencil.roles()

            jsonExtension.properties.each(function (prop) {
              prop.roles.any(function (role) {
                role = jsonExtension['extends'] + role
                if (roles.member(role)) {
                  prop.properties.each(function (property) {
                    stencil.addProperty(property, jsonExtension.namespace)
                  })
                  return true
                }
                else
                  return false
              })
            })
          }.bind(this))
        }

        // remove stencil properties
        if (jsonExtension.removeproperties) {
          jsonExtension.removeproperties.each(function (remprop) {
            let stencil = this.stencil(jsonExtension['extends'] + remprop.stencil)
            if (stencil) {
              remprop.properties.each(function (propId) {
                stencil.removeProperty(propId)
              })
            }
          }.bind(this))
        }

        // remove stencils
        if (jsonExtension.removestencils) {
          $A(jsonExtension.removestencils).each(function (remstencil) {
            delete this._availableStencils[jsonExtension['extends'] + remstencil]
          }.bind(this))
        }
      }
    } catch (e) {
      ORYX_Log.debug('StencilSet.addExtension: Something went wrong when initialising the stencil set extension. ' + e)
    }
  }

  removeExtension (namespace) {
    let jsonExtension = this._extensions[namespace]
    if (jsonExtension) {
      //unload extension's stencils
      if (jsonExtension.stencils) {
        $A(jsonExtension.stencils).each(function (stencil) {
          let oStencil = new Stencil(stencil, this.namespace(), this._baseUrl, this)
          this._stencils.unset(oStencil.id())
          this._availableStencils.unset(oStencil.id())
        }.bind(this))
      }

      // unload extension's properties
      if (jsonExtension.properties) {
        let stencils = this._stencils.values()
        stencils.each(function (stencil) {
          let roles = stencil.roles()

          jsonExtension.properties.each(function (prop) {
            prop.roles.any(function (role) {
              role = jsonExtension['extends'] + role
              if (roles.member(role)) {
                prop.properties.each(function (property) {
                  stencil.removeProperty(property.id)
                })
                return true
              }
              else
                return false
            })
          })
        }.bind(this))
      }

      // restore removed stencil properties
      if (jsonExtension.removeproperties) {
        jsonExtension.removeproperties.each(function (remprop) {
          let stencil = this.stencil(jsonExtension['extends'] + remprop.stencil)
          if (stencil) {
            let stencilJson = $A(this._jsonObject.stencils).find(function (s) {
              return s.id == stencil.id()
            })
            remprop.properties.each(function (propId) {
              let propertyJson = $A(stencilJson.properties).find(function (p) {
                return p.id == propId
              })
              stencil.addProperty(propertyJson, this.namespace())
            }.bind(this))
          }
        }.bind(this))
      }

      // restore removed stencils
      if (jsonExtension.removestencils) {
        $A(jsonExtension.removestencils).each(function (remstencil) {
          let sId = jsonExtension['extends'] + remstencil
          this._availableStencils.set(sId, this._stencils.get(sId))
        }.bind(this))
      }
    }
    delete this._extensions[namespace]
  }

  __handleStencilset (response) {
    this._jsonObject = response
    // assert it was parsed.
    if (!this._jsonObject) {
      throw 'Error evaluating stencilset. It may be corrupt.'
    }

    // assert there is a namespace.
    if (!this._jsonObject.namespace || this._jsonObject.namespace === '')
      throw 'Namespace definition missing in stencilset.'

    if (!(this._jsonObject.stencils instanceof Array))
      throw 'Stencilset corrupt.'

    // assert namespace ends with '#'.
    if (!this._jsonObject.namespace.endsWith('#'))
      this._jsonObject.namespace = this._jsonObject.namespace + '#'

    // assert title and description are strings.
    if (!this._jsonObject.title) this._jsonObject.title = ''
    if (!this._jsonObject.description) this._jsonObject.description = ''
  }

  /**
   * This method is called when the HTTP request to get the requested stencil
   * set succeeds. The response is supposed to be a JSON representation
   * according to the stencil set specification.
   * @param {Object} response The JSON representation according to the
   *      stencil set specification.
   */
  _init (response) {
    // init and check consistency.
    this.__handleStencilset(response)

    let pps = new Hash()
    // init property packages
    if (this._jsonObject.propertyPackages) {
      $A(this._jsonObject.propertyPackages).each((function (pp) {
        pps.set(pp.name, pp.properties)
      }).bind(this))
    }

    let defaultPosition = 0
    // init each stencil
    $A(this._jsonObject.stencils).each((function (stencil) {
      defaultPosition++

      // instantiate normally.
      let oStencil = new Stencil(stencil, this.namespace(), this._baseUrl, this, pps, defaultPosition)
      this._stencils.set(oStencil.id(), oStencil)
      this._availableStencils.set(oStencil.id(), oStencil)
    }).bind(this))
  }

  _cancelInit (response) {
    this.errornous = true
  }

  toString () {
    return 'StencilSet ' + this.title() + ' (' + this.namespace() + ')'
  }
}