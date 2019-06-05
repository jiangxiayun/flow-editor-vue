import ORYX_Utils from '../../Utils'
import ORYX_Config from '../../CONFIG'
import Property from './Property'

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 *
 * This class represents one stencil of a stencil set.
 */
export default class Stencil {
  constructor (jsonStencil, namespace, source, stencilSet, propertyPackages, defaultPosition) {
    // arguments.callee.$.construct.apply(this, arguments); // super();
    // check arguments and set defaults.
    if (!jsonStencil) throw 'Stencilset seems corrupt.'
    if (!namespace) throw 'Stencil does not provide namespace.'
    if (!source) throw 'Stencil does not provide SVG source.'
    if (!stencilSet) throw 'Fatal internal error loading stencilset.'
    // if(!propertyPackages) throw "Fatal internal error loading stencilset.";

    this._source = source
    this._jsonStencil = jsonStencil
    this._stencilSet = stencilSet
    this._namespace = namespace
    this._propertyPackages = propertyPackages

    if (defaultPosition && !this._jsonStencil.position)
      this._jsonStencil.position = defaultPosition

    this._view = null
    this._properties = new Hash()

    // init all JSON values
    if (!this._jsonStencil.type ||
      !(this._jsonStencil.type === 'edge' || this._jsonStencil.type === 'node')) {
      throw 'ORYX.Core.StencilSet.Stencil(construct): Type is not defined.'
    }
    if (!this._jsonStencil.id || this._jsonStencil.id === '') {
      throw 'ORYX.Core.StencilSet.Stencil(construct): Id is not defined.'
    }
    if (!this._jsonStencil.title || this._jsonStencil.title === '') {
      throw 'ORYX.Core.StencilSet.Stencil(construct): Title is not defined.'
    }

    if (!this._jsonStencil.description) {
      this._jsonStencil.description = ''
    }
    if (!this._jsonStencil.groups) {
      this._jsonStencil.groups = []
    }
    if (!this._jsonStencil.roles) {
      this._jsonStencil.roles = []
    }

    // add id of stencil to its roles
    this._jsonStencil.roles.push(this._jsonStencil.id)

    // prepend namespace to each role
    this._jsonStencil.roles.each((function (role, index) {
      this._jsonStencil.roles[index] = namespace + role
    }).bind(this))

    // delete duplicate roles
    this._jsonStencil.roles = this._jsonStencil.roles.uniq()

    // make id unique by prepending namespace of stencil set
    this._jsonStencil.id = namespace + this._jsonStencil.id

    this.postProcessProperties()

    // init serialize callback
    if (!this._jsonStencil.serialize) {
      this._jsonStencil.serialize = {}
      //this._jsonStencil.serialize = function(shape, data) { return data;};
    }

    // init deserialize callback
    if (!this._jsonStencil.deserialize) {
      this._jsonStencil.deserialize = {}
      // this._jsonStencil.deserialize = function(shape, data) { return data;};
    }

    // init layout callback
    if (!this._jsonStencil.layout) {
      this._jsonStencil.layout = []
      // this._jsonStencil.layout = function() {return true;}
    }

    // TODO does not work correctly, if the url does not exist
    // How to guarantee that the view is loaded correctly before leaving the constructor???
    const url = source + 'view/' + jsonStencil.view
    // override content type when this is webkit.

    /*
     if(Prototype.Browser.WebKit) {

     var req = new XMLHttpRequest;
     req.open("GET", url, false);
     req.overrideMimeType('text/xml');
     req.send(null);
     req.onload = (function() { _loadSVGOnSuccess(req.responseXML); }).bind(this);

     // else just do it.
     } else
     */

    if (this._jsonStencil.view.trim().match(/</)) {
      let parser = new DOMParser()
      let xml = parser.parseFromString(this._jsonStencil.view, 'text/xml')

      // check if result is a SVG document
      if (ORYX_Utils.checkClassType(xml.documentElement, SVGSVGElement)) {
        this._view = xml.documentElement
      } else {
        throw 'ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a valid SVG document.'
      }
    } else {
      new Ajax.Request(url, {
        asynchronous: false, method: 'get',
        onSuccess: this._loadSVGOnSuccess.bind(this),
        onFailure: this._loadSVGOnFailure.bind(this)
      })
    }
  }

  postProcessProperties () {
    // add image path to icon
    this._jsonStencil.icon = ORYX_Config.SERVER_HANDLER_ROOT + '/stencilsetitem/' + this._jsonStencil.objectId + '/image'

    // init property packages
    if (this._jsonStencil.propertyPackages && this._jsonStencil.propertyPackages instanceof Array) {
      const hiddenPropertyPackages = this._jsonStencil.hiddenPropertyPackages

      this._jsonStencil.propertyPackages.each((ppId) => {
        const pp = this._propertyPackages.get(ppId)
        if (pp) {
          pp.each((prop) => {
            let oProp = new Property(prop, this._namespace, this)
            // let key = oProp.prefix() + '-' + oProp.id()
            this._properties.set(oProp.id(), oProp)

            // Check if we need to hide this property (ie it is there for display purposes,
            // if the user has filled it in, but it can no longer be edited)
            if (hiddenPropertyPackages.indexOf(oProp.id()) > -1) {
              oProp.hide()
            }

          } )
        }
      })
    }

    // init properties
    if (this._jsonStencil.properties && this._jsonStencil.properties instanceof Array) {
      this._jsonStencil.properties.each((function (prop) {
        let oProp = new Property(prop, this._namespace, this)
        // let key = oProp.prefix() + '-' + oProp.id()
        this._properties.set(oProp.id(), oProp)
      }).bind(this))
    }

  }

  /**
   * @param {ORYX.Core.StencilSet.Stencil} stencil
   * @return {Boolean} True, if stencil has the same namespace and type.
   */
  equals (stencil) {
    return (this.id() === stencil.id())
  }

  stencilSet () {
    return this._stencilSet
  }

  type () {
    return this._jsonStencil.type
  }

  namespace () {
    return this._namespace
  }

  id () {
    return this._jsonStencil.id
  }

  idWithoutNs () {
    return this.id().replace(this.namespace(), '')
  }

  title () {
    return this._jsonStencil.title
  }

  description () {
    return this._jsonStencil.description
  }

  groups () {
    return this._jsonStencil.groups
  }

  position () {
    return (isNaN(this._jsonStencil.position) ? 0 : this._jsonStencil.position)
  }

  view () {
    return this._view.cloneNode(true) || this._view
  }

  icon () {
    return this._jsonStencil.icon
  }

  fixedAspectRatio () {
    return this._jsonStencil.fixedAspectRatio === true
  }

  hasMultipleRepositoryEntries () {
    return (this.getRepositoryEntries().length > 0)
  }

  getRepositoryEntries () {
    return (this._jsonStencil.repositoryEntries) ?
      $A(this._jsonStencil.repositoryEntries) : $A([])
  }

  properties () {
    return this._properties.values()
  }

  property (id) {
    return this._properties.get(id)
  }

  roles () {
    return this._jsonStencil.roles
  }

  defaultAlign () {
    if (!this._jsonStencil.defaultAlign)
      return 'east'
    return this._jsonStencil.defaultAlign
  }

  serialize (shape, data) {
    return this._jsonStencil.serialize
    // return this._jsonStencil.serialize(shape, data);
  }

  deserialize (shape, data) {
    return this._jsonStencil.deserialize
    // return this._jsonStencil.deserialize(shape, data);
  }

  // in which case is targetShape used?
  //	layout(shape, targetShape) {
  //		return this._jsonStencil.layout(shape, targetShape);
  //	},
  // layout property to store events for layouting in plugins
  layout (shape) {
    return this._jsonStencil.layout
  }

  addProperty (property, namespace) {
    if (property && namespace) {
      let oProp = new Property(property, namespace, this)
      // this._properties[oProp.prefix() + '-' + oProp.id()] = oProp
      this._properties[oProp.id()] = oProp
    }
  }

  removeProperty (propertyId) {
    if (propertyId) {
      let oProp = this._properties.values().find(function (prop) {
        return (propertyId == prop.id())
      })
      if (oProp) {
        // delete this._properties[oProp.prefix() + '-' + oProp.id()]
        delete this._properties[oProp.id()]
      }
    }
  }

  _loadSVGOnSuccess (result) {
    let xml = null

    /*
     * We want to get a dom object for the requested file. Unfortunately,
     * safari has some issues here. this is meant as a fallback for all
     * browsers that don't recognize the svg mimetype as XML but support
     * data: urls on Ajax calls.
     */

    // responseXML != undefined.
    // if(!(result.responseXML))

    // get the dom by data: url.
    // xml = _evenMoreEvilHack(result.responseText, 'text/xml');

    // else

    // get it the usual way.
    xml = result.responseXML

    // check if result is a SVG document
    if (ORYX_Utils.checkClassType(xml.documentElement, SVGSVGElement)) {
      this._view = xml.documentElement
    } else {
      throw 'ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a SVG document.'
    }
  }

  _loadSVGOnFailure (result) {
    throw 'ORYX.Core.StencilSet.Stencil(_loadSVGOnFailure): Loading SVG document failed.'
  }

  toString () {
    return 'Stencil ' + this.title() + ' (' + this.id() + ')'
  }
}

