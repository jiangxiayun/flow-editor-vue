import ORYX_Log from './Log'
import ORYX_Config from './CONFIG'
import ORYX_Editor from './Editor'
import ORYX_Utils from './Utils'
import Plugins_s from './Plugins'
import ORYX_Edge from './core/Edge'
import ORYX_Node from './core/Node'
import ORYX_Shape from './core/Shape'
import ORYX_Canvas from './core/Canvas'
import ORYX_StencilSet from './core/StencilSet'

import ORYX_Command from './core/Command'
import ORYX_Controls_Docker from './core/Controls/Docker'

const Plugins = Plugins_s
/**
 * The Editor class.
 * @class ORYX.Editor
 * @extends Clazz
 * @param {Object} config An editor object, passed to {@link ORYX.Editor#loadSerialized}
 * @param {String} config.id Any ID that can be used inside the editor. If fullscreen=false, any HTML node with this id
 *   must be present to render the editor to this node.
 * @param {boolean} [config.fullscreen=true] Render editor in fullscreen mode or not.
 * @param {String} config.stencilset.url Stencil set URL.
 * @param {String} [config.stencil.id] Stencil type used for creating the canvas.
 * @param {Object} config.properties Any properties applied to the canvas.
 */
export default class Editor {
  /** @lends ORYX.Editor.prototype */
  constructor (config) {
    // Defines the global dom event listener
    this.DOMEventListeners = new Hash()
    // Defines the selection
    this.selection = []
    // Defines the current zoom level
    this.zoomLevel = 1.0
    // initialization.
    this._eventsQueue = []
    this.loadedPlugins = []
    this.pluginsData = []

    // meta data about the model for the signavio warehouse
    // directory, new, name, description, revision, model (the model data)

    let model = config
    this.id = model.modelId

    if (config.model) {
      model = config.model
    }

    if (!this.id) {
      this.id = model.id
      if (!this.id) {
        this.id = ORYX_Utils.provideId()
      }
    }

    // Defines if the editor should be fullscreen or not
    this.fullscreen = config.fullscreen !== false

    // Initialize the eventlistener
    this._initEventListener()
    // CREATES the canvas
    this._createCanvas(model.stencil ? model.stencil.id : null, model.properties)
    // 生成整个 EXT.VIEWPORT
    this._generateGUI()

    // Initializing of a callback to check loading ends
    let loadPluginFinished = false
    let loadContentFinished = false
    let initFinished = function () {
      if (!loadPluginFinished || !loadContentFinished) {
        return
      }
      this._finishedLoading()
    }.bind(this)

    // LOAD the plugins
    this.loadPlugins()
    loadPluginFinished = true
    initFinished()

    // LOAD the content of the current editor instance
    window.setTimeout(function () {
      this.loadSerialized(model, true) // Request the meta data as well
      this.getCanvas().update()
      loadContentFinished = true
      initFinished()
      this.handleEvents({ type: ORYX_Config.EVENT_EDITOR_INIT_COMPLETED })
    }.bind(this), 200)

    this.Cookie = {
      callbacks: [],
      onChange: function (callback, interval) {
        this.callbacks.push(callback)
        this.start(interval)
      },
      start: function (interval) {
        if (this.pe) {
          return
        }
        let currentString = document.cookie
        this.pe = new PeriodicalExecuter(function () {
          if (currentString != document.cookie) {
            currentString = document.cookie
            this.callbacks.each(function (callback) {
              callback(this.getParams())
            }.bind(this))
          }

        }.bind(this), (interval || 10000) / 1000)
      },
      stop: function () {
        if (this.pe) {
          this.pe.stop()
          this.pe = null
        }
      },
      getParams: function () {
        let res = {}
        let p = document.cookie
        p.split('; ').each(function (param) {
          res[param.split('=')[0]] = param.split('=')[1]
        })
        return res
      },
      toString: function () {
        return document.cookie
      }
    }
  }

  _finishedLoading () {
    // Raise Loaded Event
    this.handleEvents({ type: ORYX_Config.EVENT_LOADED })
  }

  _initEventListener () {
    // Register on Events
    document.documentElement.addEventListener(ORYX_Config.EVENT_KEYDOWN, this.catchKeyDownEvents.bind(this), false)
    document.documentElement.addEventListener(ORYX_Config.EVENT_KEYUP, this.catchKeyUpEvents.bind(this), false)

    // Enable Key up and down Event
    this._keydownEnabled = true
    this._keyupEnabled = true

    this.DOMEventListeners.set(ORYX_Config.EVENT_MOUSEDOWN, [])
    this.DOMEventListeners.set(ORYX_Config.EVENT_MOUSEUP, [])
    this.DOMEventListeners.set(ORYX_Config.EVENT_MOUSEOVER, [])
    this.DOMEventListeners.set(ORYX_Config.EVENT_MOUSEOUT, [])
    this.DOMEventListeners.set(ORYX_Config.EVENT_SELECTION_CHANGED, [])
    this.DOMEventListeners.set(ORYX_Config.EVENT_MOUSEMOVE, [])
  }

  /**
   * Generate the whole viewport of the
   * Editor and initialized the Ext-Framework
   */
  _generateGUI () {
    // Defines the layout height if it's NOT fullscreen
    let layoutHeight = ORYX_Config.WINDOW_HEIGHT
    let canvasParent = this.getCanvas().rootNode.parentNode

    jQuery('#canvasSection').append(canvasParent)
    if (canvasParent.parentNode) {
      // Set the editor to the center, and refresh the size
      canvasParent.parentNode.setAttributeNS(null, 'align', 'center')
      canvasParent.setAttributeNS(null, 'align', 'left')
      this.getCanvas().setSize({
        width: ORYX_Config.CustomConfigs.CANVAS_WIDTH,
        height: ORYX_Config.CustomConfigs.CANVAS_HEIGHT
      })
    }
  }

  getAvailablePlugins () {
    let curAvailablePlugins = ORYX_Utils.availablePlugins.clone()
    curAvailablePlugins.each(function (plugin) {
      if (this.loadedPlugins.find(function (loadedPlugin) {
        return loadedPlugin.type == this.name
      }.bind(plugin))) {
        plugin.engaged = true
      } else {
        plugin.engaged = false
      }
    }.bind(this))
    return curAvailablePlugins
  }

  loadScript (url, callback) {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    if (script.readyState) {  //IE
      script.onreadystatechange = function () {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null
          callback()
        }
      }
    } else {  //Others
      script.onload = function () {
        callback()
      }
    }
    script.src = url
    document.getElementsByTagName('head')[0].appendChild(script)
  }

  /**
   * activate Plugin
   *
   * @param {String} name
   * @param {Function} callback
   *    callback(sucess, [errorCode])
   *      errorCodes: NOTUSEINSTENCILSET, REQUIRESTENCILSET, NOTFOUND, YETACTIVATED
   */
  activatePluginByName (name, callback, loadTry) {
    let match = this.getAvailablePlugins().find(function (value) {
      return value.name == name
    })
    if (match && (!match.engaged || (match.engaged === 'false'))) {
      let loadedStencilSetsNamespaces = this.getStencilSets().keys()
      let facade = this._getPluginFacade()
      let newPlugin
      const me = this
      ORYX_Log.debug('Initializing plugin \'%0\'', match.name)

      if (!match.requires || !match.requires.namespaces || match.requires.namespaces.any(function (req) {
        return loadedStencilSetsNamespaces.indexOf(req) >= 0
      })) {
        if (!match.notUsesIn || !match.notUsesIn.namespaces || !match.notUsesIn.namespaces.any(function (req) {
          return loadedStencilSetsNamespaces.indexOf(req) >= 0
        })) {

          try {
            let className = eval(match.name)
            let newPlugin = new className(facade, match)
            newPlugin.type = match.name

            // If there is an GUI-Plugin, they get all Plugins-Offer-Meta-Data
            if (newPlugin.registryChanged)
              newPlugin.registryChanged(me.pluginsData)

            // If there have an onSelection-Method it will pushed to the Editor Event-Handler
            if (newPlugin.onSelectionChanged)
              me.registerOnEvent(ORYX_Config.EVENT_SELECTION_CHANGED, newPlugin.onSelectionChanged.bind(newPlugin))
            this.loadedPlugins.push(newPlugin)
            this.loadedPlugins.each(function (loaded) {
              if (loaded.registryChanged)
                loaded.registryChanged(this.pluginsData)
            }.bind(me))
            callback(true)

          } catch (e) {
            ORYX_Log.warn('Plugin %0 is not available', match.name)
            if (!!loadTry) {
              callback(false, 'INITFAILED')
              return
            }
            this.loadScript('plugins/scripts/' + match.source, this.activatePluginByName.bind(this, match.name, callback, true))
          }
        } else {
          callback(false, 'NOTUSEINSTENCILSET')
          ORYX_Log.info('Plugin need a stencilset which is not loaded\'', match.name)
        }

      } else {
        callback(false, 'REQUIRESTENCILSET')
        ORYX_Log.info('Plugin need a stencilset which is not loaded\'', match.name)
      }

    } else {
      callback(false, match ? 'NOTFOUND' : 'YETACTIVATED')
      //TODO error handling
    }
  }

  /**
   *  Laden der Plugins
   */
  loadPlugins () {
    const me = this
    let newPlugins = []
    let loadedStencilSetsNamespaces = this.getStencilSets().keys()

    // Available Plugins will be initalize
    let facade = this._getPluginFacade()

    Plugins.availablePlugins.each(function (value) {
      ORYX_Log.debug('Initializing plugin \'%0\'', value.get('name'))
      try {
        let className = eval(value.get('name'))
        // let className = value.get('name')
        if (className) {
          let plugin = new className(facade, value)
          plugin.type = value.get('name')
          newPlugins.push(plugin)
          plugin.engaged = true
        }
      } catch (e) {
        ORYX_Log.warn('Plugin %0 is not available %1', value.get('name'), e)
      }

    })
    newPlugins.each(function (value) {
      // If there is an GUI-Plugin, they get all Plugins-Offer-Meta-Data
      if (value.registryChanged)
        value.registryChanged(me.pluginsData)

      // If there have an onSelection-Method it will pushed to the Editor Event-Handler
      if (value.onSelectionChanged)
        me.registerOnEvent(ORYX_Config.EVENT_SELECTION_CHANGED, value.onSelectionChanged.bind(value))
    })

    this.loadedPlugins = newPlugins
    this.registerPluginsOnKeyEvents()
    this.setSelection()
  }

  /**
   * Creates the Canvas
   * @param {String} [stencilType] The stencil type used for creating the canvas.
   * If not given, a stencil with myBeRoot = true from current stencil set is taken.
   *
   * @param {Object} [canvasConfig] Any canvas properties (like language).
   */
  _createCanvas (stencilType, canvasConfig) {
    if (stencilType) {
      // Add namespace to stencilType
      if (stencilType.search(/^http/) === -1) {
        stencilType = this.getStencilSets().values()[0].namespace() + stencilType
      }
    } else {
      // Get any root stencil type
      stencilType = this.getStencilSets().values()[0].findRootStencilName()
    }
    // get the stencil associated with the type
    let canvasStencil = ORYX_StencilSet.stencil(stencilType)

    if (!canvasStencil) {
      ORYX_Log.fatal('初始化失败, 因为类型为 %0 的模具不是加载的模具集的一部分。', stencilType)
    }

    // create all dom
    // TODO fix border, so the visible canvas has a double border and some spacing to the scrollbars
    let div = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', null, ['div'])
    // set class for custom styling
    div.addClassName('ORYX_Editor')

    // create the canvas
    this._canvas = new ORYX_Canvas({
      width: ORYX_Config.CustomConfigs.CANVAS_WIDTH,
      height: ORYX_Config.CustomConfigs.CANVAS_HEIGHT,
      'eventHandlerCallback': this.handleEvents.bind(this),
      id: this.id,
      parentNode: div
    }, canvasStencil, this._getPluginFacade())

    if (canvasConfig) {
      // Migrate canvasConfig to an RDF-like structure
      //FIXME this isn't nice at all because we don't want rdf any longer
      let properties = []
      for (let field in canvasConfig) {
        properties.push({
          prefix: 'oryx',
          name: field,
          value: canvasConfig[field]
        })
      }
      this._canvas.deserialize(properties)
    }
  }

  /**
   * Returns a per-editor singleton plugin facade.
   * To be used in plugin initialization.
   */
  _getPluginFacade () {
    // if there is no pluginfacade already created:
    if (!(this._pluginFacade))

    // create it.
      this._pluginFacade = {
        activatePluginByName: this.activatePluginByName.bind(this),
        //deactivatePluginByName:		this.deactivatePluginByName.bind(this),
        getAvailablePlugins: this.getAvailablePlugins.bind(this),
        offer: this.offer.bind(this),
        getStencilSets: this.getStencilSets.bind(this),
        getStencilSetExtensionDefinition: function () {
          return Object.clone(this.ss_extensions_def || {})
        }.bind(this),
        getRules: this.getRules.bind(this),
        loadStencilSet: this.loadStencilSet.bind(this),
        createShape: this.createShape.bind(this),
        deleteShape: this.deleteShape.bind(this),
        getSelection: this.getSelection.bind(this),
        setSelection: this.setSelection.bind(this),
        updateSelection: this.updateSelection.bind(this),
        getCanvas: this.getCanvas.bind(this),

        importJSON: this.importJSON.bind(this),
        getJSON: this.getJSON.bind(this),
        getSerializedJSON: this.getSerializedJSON.bind(this),

        executeCommands: this.executeCommands.bind(this),
        isExecutingCommands: this.isExecutingCommands.bind(this),

        registerOnEvent: this.registerOnEvent.bind(this),
        unregisterOnEvent: this.unregisterOnEvent.bind(this),
        raiseEvent: this.handleEvents.bind(this),
        enableEvent: this.enableEvent.bind(this),
        disableEvent: this.disableEvent.bind(this),

        eventCoordinates: this.eventCoordinates.bind(this),
        eventCoordinatesXY: this.eventCoordinatesXY.bind(this),

        getModelMetaData: this.getModelMetaData.bind(this)
      }

    // return it.
    return this._pluginFacade
  }

  isExecutingCommands () {
    return !!this.commandExecuting
  }

  /**
   * Implementes the command pattern
   * (The real usage of the command pattern
   * is implemented and shown in the Plugins/undo.js)
   *
   * @param <Oryx.Core.Command>[] Array of commands
   */
  executeCommands (commands) {
    if (!this.commandStack) {
      this.commandStack = []
    }
    if (!this.commandStackExecuted) {
      this.commandStackExecuted = []
    }


    this.commandStack = [].concat(this.commandStack)
      .concat(commands)

    // Check if already executes
    if (this.commandExecuting) {
      return
    }

    // Start execution
    this.commandExecuting = true

    // Iterate over all commands
    while (this.commandStack.length > 0) {
      let command = this.commandStack.shift()
      // and execute it
      command.execute()
      this.commandStackExecuted.push(command)
    }

    // Raise event for executing commands
    this.handleEvents({
      type: ORYX_Config.EVENT_EXECUTE_COMMANDS,
      commands: this.commandStackExecuted
    })

    // Remove temporary vars
    delete this.commandStack
    delete this.commandStackExecuted
    delete this.commandExecuting


    this.updateSelection()
  }

  /**
   * Returns JSON of underlying canvas (calls ORYX.Canvas#toJSON()).
   * @return {Object} Returns JSON representation as JSON object.
   */
  getJSON () {
    let canvasJSON = this.getCanvas().toJSON()
    canvasJSON.ssextensions = this.getStencilSets().values()[0].extensions().keys().findAll(function (sse) {
      return !sse.endsWith('/meta#')
    })
    return canvasJSON
  }

  /**
   * Serializes a call to toJSON().
   * @return {String} Returns JSON representation as string.
   */
  getSerializedJSON () {
    return JSON.stringify(this.getJSON())
  }

  /**
   * Imports shapes in JSON as expected by {@link ORYX.Editor#loadSerialized}
   * @param {Object|String} jsonObject The (serialized) json object to be imported
   * @param {boolean } [noSelectionAfterImport=false] Set to true if no shapes should be selected after import
   * @throws {SyntaxError} If the serialized json object contains syntax errors
   */
  importJSON (jsonObject, noSelectionAfterImport) {
    try {
      jsonObject = this.renewResourceIds(jsonObject)
    } catch (error) {
      throw error
    }
    //check, if the imported json model can be loaded in this editor
    // (stencil set has to fit)
    if (jsonObject.stencilset.namespace && jsonObject.stencilset.namespace !== this.getCanvas().getStencil().stencilSet().namespace()) {
      let wrongSS = 'The stencil set of the imported file ({0}) does not match to the loaded stencil set ({1}).'
      alert(String.format(wrongSS, jsonObject.stencilset.namespace, this.getCanvas().getStencil().stencilSet().namespace()))
      // alert(String.format(ORYX.I18N.JSONImport.wrongSS, jsonObject.stencilset.namespace, this.getCanvas().getStencil().stencilSet().namespace()))
      return null
    } else {
      class commandClass extends ORYX_Command {
        constructor (jsonObject, loadSerializedCB, noSelectionAfterImport, facade) {
          super()
          this.jsonObject = jsonObject
          this.noSelection = noSelectionAfterImport
          this.facade = facade
          this.shapes
          this.connections = []
          this.parents = new Hash()
          this.selection = this.facade.getSelection()
          this.loadSerialized = loadSerializedCB
        }
        execute () {
          if (!this.shapes) {
            // Import the shapes out of the serialization
            this.shapes = this.loadSerialized(this.jsonObject)
            //store all connections
            this.shapes.each(function (shape) {
              if (shape.getDockers) {
                let dockers = shape.getDockers()
                if (dockers) {
                  if (dockers.length > 0) {
                    this.connections.push([dockers.first(), dockers.first().getDockedShape(), dockers.first().referencePoint])
                  }
                  if (dockers.length > 1) {
                    this.connections.push([dockers.last(), dockers.last().getDockedShape(), dockers.last().referencePoint])
                  }
                }
              }

              //store parents
              this.parents[shape.id] = shape.parent
            }.bind(this))
          } else {
            this.shapes.each(function (shape) {
              this.parents[shape.id].add(shape)
            }.bind(this))

            this.connections.each(function (con) {
              con[0].setDockedShape(con[1])
              con[0].setReferencePoint(con[2])
              con[0].update()
            })
          }

          //this.parents.values().uniq().invoke("update");
          this.facade.getCanvas().update()

          if (!this.noSelection)
            this.facade.setSelection(this.shapes)
          else
            this.facade.updateSelection()

          // call updateSize again, because during loadSerialized the edges' bounds
          // are not yet initialized properly
          this.facade.getCanvas().updateSize()

        }
        rollback () {
          let selection = this.facade.getSelection()
          this.shapes.each(function (shape) {
            selection = selection.without(shape)
            this.facade.deleteShape(shape)
          }.bind(this))

          /*this.parents.values().uniq().each(function(parent) {
           if(!this.shapes.member(parent))
           parent.update();
           }.bind(this));*/

          this.facade.getCanvas().update()
          this.facade.setSelection(selection)
        }
      }
      const command = new commandClass(jsonObject,
        this.loadSerialized.bind(this),
        noSelectionAfterImport,
        this._getPluginFacade())

      this.executeCommands([command])
      return command.shapes.clone()
    }
  }

  /**
   * This method renew all resource Ids and according references.
   * Warning: The implementation performs a substitution on the serialized object for
   * easier implementation. This results in a low performance which is acceptable if this
   * is only used when importing models.
   * @param {Object|String} jsonObject
   * @throws {SyntaxError} If the serialized json object contains syntax errors.
   * @return {Object} The jsonObject with renewed ids.
   * @private
   */
  renewResourceIds (jsonObject) {
    let serJsonObject
    // For renewing resource ids, a serialized and object version is needed
    if (Object.prototype.toString.call(jsonObject) === 'String') {
      try {
        serJsonObject = jsonObject
        jsonObject = JSON.parse(jsonObject)
      } catch (error) {
        throw new SyntaxError(error.message)
      }
    } else {
      serJsonObject = JSON.stringify(jsonObject)
    }

    // collect all resourceIds recursively
    let collectResourceIds = function (shapes) {
      if (!shapes) return []

      return shapes.map(function (shape) {
        return collectResourceIds(shape.childShapes).concat(shape.resourceId)
      }).flatten()
    }
    let resourceIds = collectResourceIds(jsonObject.childShapes)

    // Replace each resource id by a new one
    resourceIds.each(function (oldResourceId) {
      let newResourceId = ORYX_Utils.provideId()
      serJsonObject = serJsonObject.replace(new RegExp(oldResourceId, 'g'), newResourceId)
    })

    return JSON.parse(serJsonObject)
  }

  /**
   * Loads serialized model to the oryx.
   * @example
   * editor.loadSerialized({
   *    resourceId: "mymodel1",
   *    childShapes: [
   *       {
   *          stencil:{ id:"Subprocess" },
   *          outgoing:[{resourceId: 'aShape'}],
   *          target: {resourceId: 'aShape'},
   *          bounds:{ lowerRight:{ y:510, x:633 }, upperLeft:{ y:146, x:210 } },
   *          resourceId: "myshape1",
   *          childShapes:[],
   *          properties:{},
   *       }
   *    ],
   *    properties:{
   *       language: "English"
   *    },
   *    stencilset:{
   *       url:"http://localhost:8080/oryx/stencilsets/bpmn1.1/bpmn1.1.json"
   *    },
   *    stencil:{
   *       id:"BPMNDiagram"
   *    }
   * });
   * @param {Object} model Description of the model to load.
   * @param {Array} [model.ssextensions] List of stenctil set extensions.
   * @param {String} model.stencilset.url
   * @param {String} model.stencil.id
   * @param {Array} model.childShapes
   * @param {Array} [model.properties]
   * @param {String} model.resourceId
   * @return {ORYX.Core.Shape[]} List of created shapes
   * @methodOf ORYX.Editor.prototype
   */
  loadSerialized (model, requestMeta) {
    let canvas = this.getCanvas()
    // Bugfix (cf. http://code.google.com/p/oryx-editor/issues/detail?id=240)
    // Deserialize the canvas' stencil set extensions properties first!
    this.loadSSExtensions(model.ssextensions)

    // Load Meta Data Extension if available
    // #Signavio
    if (requestMeta === true) {
      let metaDataExtension = this.getExtensionForMetaData()
      if (metaDataExtension) {
        this.loadSSExtension(metaDataExtension)
      }
    }
    let shapes = this.getCanvas().addShapeObjects(model.childShapes, this.handleEvents.bind(this))

    if (model.properties) {
      for (let key in model.properties) {
        let value = model.properties[key]
        let prop = this.getCanvas().getStencil().property('oryx-' + key)
        if (!(typeof value === 'string') && (!prop || !prop.isList())) {
          value = JSON.stringify(value)
        }
        this.getCanvas().setProperty('oryx-' + key, value)
      }
    }

    this.getCanvas().updateSize()

    // Force to update the selection
    this.selection = [null]
    this.setSelection([])

    return shapes
  }

  /**
   * Return the namespace of the extension which
   * provided all the self defined meta data
   * @return {String} Returns null if no extension is defined, otherwise the namespace
   *
   */
  getExtensionForMetaData () {
    if (!this.ss_extensions_def || !(this.ss_extensions_def.extensions instanceof Array)) {
      return null
    }

    let stencilsets = this.getStencilSets()
    let extension = this.ss_extensions_def.extensions.find(function (ex) {
      return !!stencilsets[ex['extends']] && ex.namespace.endsWith('/meta#')
    })

    return extension ? extension.namespace || null : null
  }

  /**
   * Calls ORYX.Editor.prototype.ss_extension_namespace for each element
   * @param {Array} ss_extension_namespaces An array of stencil set extension namespaces.
   */
  loadSSExtensions (ss_extension_namespaces) {
    if (!ss_extension_namespaces) return

    ss_extension_namespaces.each(function (ss_extension_namespace) {
      this.loadSSExtension(ss_extension_namespace)
    }.bind(this))
  }

  /**
   * Loads a stencil set extension.
   * The stencil set extensions definiton file must already
   * be loaded when the editor is initialized.
   */
  loadSSExtension (ss_extension_namespace) {
    if (this.ss_extensions_def) {
      let extension = this.ss_extensions_def.extensions.find(function (ex) {
        return (ex.namespace == ss_extension_namespace)
      })
      if (!extension) {
        return
      }

      let stencilset = this.getStencilSets()[extension['extends']]
      if (!stencilset) {
        return
      }

      // Check if absolute or relative url
      if ((extension['definition'] || '').startsWith('/')) {
        stencilset.addExtension(extension['definition'])
      } else {
        stencilset.addExtension(ORYX_Config.SS_EXTENSIONS_FOLDER + extension['definition'])
      }

      //stencilset.addExtension("/oryx/build/stencilsets/extensions/" + extension["definition"])
      this.getRules().initializeRules(stencilset)

      this._getPluginFacade().raiseEvent({
        type: ORYX_Config.EVENT_STENCIL_SET_LOADED
      })
    }

  }

  disableEvent (eventType) {
    if (eventType == ORYX_Config.EVENT_KEYDOWN) {
      this._keydownEnabled = false
    }
    if (eventType == ORYX_Config.EVENT_KEYUP) {
      this._keyupEnabled = false
    }
    if (this.DOMEventListeners.keys().member(eventType)) {
      let value = this.DOMEventListeners.unset(eventType)
      this.DOMEventListeners.set('disable_' + eventType, value)
    }
  }

  enableEvent (eventType) {
    if (eventType == ORYX_Config.EVENT_KEYDOWN) {
      this._keydownEnabled = true
    }

    if (eventType == ORYX_Config.EVENT_KEYUP) {
      this._keyupEnabled = true
    }

    if (this.DOMEventListeners.keys().member('disable_' + eventType)) {
      let value = this.DOMEventListeners.unset('disable_' + eventType)
      this.DOMEventListeners.set(eventType, value)
    }
  }

  /**
   *  Methods for the PluginFacade
   */
  registerOnEvent (eventType, callback) {
    if (!(this.DOMEventListeners.keys().member(eventType))) {
      this.DOMEventListeners.set(eventType, [])
    }
    this.DOMEventListeners.get(eventType).push(callback)
  }

  unregisterOnEvent (eventType, callback) {
    if (this.DOMEventListeners.keys().member(eventType)) {
      this.DOMEventListeners.set(eventType, this.DOMEventListeners.get(eventType).without(callback))
    } else {
      // Event is not supported
      // TODO: Error Handling
    }
  }

  getSelection () {
    return this.selection || []
  }

  getStencilSets () {
    return ORYX_StencilSet.stencilSets(this.id)
  }

  getRules () {
    return ORYX_StencilSet.rules(this.id)
  }

  loadStencilSet (source) {
    try {
      ORYX_StencilSet.loadStencilSet(source, this.modelMetaData, this.id)
      this.handleEvents({ type: ORYX_Config.EVENT_STENCIL_SET_LOADED })
    } catch (e) {
      ORYX_Log.warn('Requesting stencil set file failed. (' + e + ')')
    }
  }

  offer (pluginData) {
    if (!this.pluginsData.member(pluginData)) {
      this.pluginsData.push(pluginData)
    }
  }

  /**
   * It creates an new event or adds the callback, if already existing,
   * for the key combination that the plugin passes in keyCodes attribute
   * of the offer method.
   *
   * The new key down event fits the schema:
   *    key.event[.metactrl][.alt][.shift].'thekeyCode'
   */
  registerPluginsOnKeyEvents () {
    this.pluginsData.each(function (pluginData) {
      if (pluginData.keyCodes) {
        pluginData.keyCodes.each(function (keyComb) {
          let eventName = 'key.event'

          /* Include key action */
          eventName += '.' + keyComb.keyAction

          if (keyComb.metaKeys) {
            /* Register on ctrl or apple meta key as meta key */
            if (keyComb.metaKeys.indexOf(ORYX_Config.META_KEY_META_CTRL) > -1) {
              eventName += '.' + ORYX_Config.META_KEY_META_CTRL
            }

            /* Register on alt key as meta key */
            if (keyComb.metaKeys.indexOf(ORYX_Config.META_KEY_ALT) > -1) {
              eventName += '.' + ORYX_Config.META_KEY_ALT
            }

            /* Register on shift key as meta key */
            if (keyComb.metaKeys.indexOf(ORYX_Config.META_KEY_SHIFT) > -1) {
              eventName += '.' + ORYX_Config.META_KEY_SHIFT
            }
          }

          /* Register on the actual key */
          if (keyComb.keyCode) {
            eventName += '.' + keyComb.keyCode
          }

          /* Register the event */
          ORYX_Log.debug('Register Plugin on Key Event: %0', eventName)
          if (pluginData.toggle === true && pluginData.buttonInstance) {
            this.registerOnEvent(eventName, function () {
              pluginData.buttonInstance.toggle(!pluginData.buttonInstance.pressed) // Toggle
              pluginData.functionality.call(
                pluginData,
                pluginData.buttonInstance,
                pluginData.buttonInstance.pressed) // Call function
            })
          } else {
            this.registerOnEvent(eventName, pluginData.functionality)
          }

        }.bind(this))
      }
    }.bind(this))
  }

  isEqual (a, b) {
    return a === b || (a.length === b.length && a.all(function (r) {
      return b.include(r)
    }))
  }

  isDirty (a) {
    return a.any(function (shape) {
      return shape.isPropertyChanged()
    })
  }

  setSelection (elements, subSelectionElement, force) {
    if (!elements) {
      elements = []
    }
    if (!(elements instanceof Array)) {
      elements = [elements]
    }

    elements = elements.findAll(function (n) {
      return n && n instanceof ORYX_Shape
    })

    if (elements[0] instanceof ORYX_Canvas) {
      elements = []
    }

    if (!force && this.isEqual(this.selection, elements) && !this.isDirty(elements)) {
      return
    }

    this.selection = elements
    this._subSelection = subSelectionElement

    this.handleEvents({
      type: ORYX_Config.EVENT_SELECTION_CHANGED,
      elements: elements,
      subSelection: subSelectionElement,
      force: !!force
    })
  }

  updateSelection () {
    this.setSelection(this.selection, this._subSelection, true)
    /*var s = this.selection;
     this.setSelection();
     this.setSelection(s);*/
  }

  getCanvas () {
    return this._canvas
  }

  /**
   *  option = {
   *		type: string,
   *		position: {x:int, y:int},
   *		connectingType:	uiObj-Class
   *		connectedShape: uiObj
   *		draggin: bool
   *		namespace: url
   *       parent: ORYX.Core.AbstractShape
   *		template: a template shape that the newly created inherits properties from.
   *		}
   */
  // 创建图形元素
  createShape (option) {
    console.log(12, option)
    // If there is no argument, throw an exception
    if (!option || !option.type || !option.namespace) {
      throw 'To create a new shape you have to give an argument with type and namespace'
    }

    let newShapeObject

    if (option && option.serialize && option.serialize instanceof Array) {
      let type = option.serialize.find(function (obj) {
        return (obj.prefix + '-' + obj.name) == 'oryx-type'
      })
      let stencil = ORYX_StencilSet.stencil(type.value)
      if (stencil.type() == 'node') {
        newShapeObject = new ORYX_Node({ 'eventHandlerCallback': this.handleEvents.bind(this) }, stencil, this._getPluginFacade())
      } else {
        newShapeObject = new ORYX_Edge({ 'eventHandlerCallback': this.handleEvents.bind(this) }, stencil, this._getPluginFacade())
      }
      this.getCanvas().add(newShapeObject)
      newShapeObject.deserialize(option.serialize)

      return newShapeObject
    }

    let canvas = this.getCanvas()
    // Get the shape type
    let shapetype = option.type
    // Get the stencil set
    let sset = ORYX_StencilSet.stencilSet(option.namespace)
    // Create an New Shape, dependents on an Edge or a Node
    if (sset.stencil(shapetype).type() == 'node') {
      newShapeObject = new ORYX_Node({ 'eventHandlerCallback': this.handleEvents.bind(this) }, sset.stencil(shapetype), this._getPluginFacade())
    } else {
      newShapeObject = new ORYX_Edge({ 'eventHandlerCallback': this.handleEvents.bind(this) }, sset.stencil(shapetype), this._getPluginFacade())
    }

    // when there is a template, inherit the properties.
    if (option.template) {
      newShapeObject._jsonStencil.properties = option.template._jsonStencil.properties
      newShapeObject.postProcessProperties()
    }

    // Add to the canvas
    if (option.parent && newShapeObject instanceof ORYX_Node) {
      option.parent.add(newShapeObject)
    } else {
      canvas.add(newShapeObject)
    }

    // Set the position
    let point = option.position ? option.position : { x: 100, y: 200 }
    let con
    // If there is create a shape and in the argument there is given an ConnectingType and is instance of an edge
    if (option.connectingType && option.connectedShape && !(newShapeObject instanceof ORYX_Edge)) {
      // there will be create a new Edge
      con = new ORYX_Edge({ 'eventHandlerCallback': this.handleEvents.bind(this) }, sset.stencil(option.connectingType), this._getPluginFacade())

      // And both endings dockers will be referenced to the both shapes
      con.dockers.first().setDockedShape(option.connectedShape)

      let magnet = option.connectedShape.getDefaultMagnet()
      let cPoint = magnet ? magnet.bounds.center() : option.connectedShape.bounds.midPoint()
      con.dockers.first().setReferencePoint(cPoint)
      con.dockers.last().setDockedShape(newShapeObject)
      con.dockers.last().setReferencePoint(newShapeObject.getDefaultMagnet().bounds.center())

      // The Edge will be added to the canvas and be updated
      canvas.add(con)
      //con.update();
    }

    // Move the new Shape to the position
    if (newShapeObject instanceof ORYX_Edge && option.connectedShape) {
      newShapeObject.dockers.first().setDockedShape(option.connectedShape)

      if (option.connectedShape instanceof ORYX_Node) {
        newShapeObject.dockers.first().setReferencePoint(option.connectedShape.getDefaultMagnet().bounds.center())
        newShapeObject.dockers.last().bounds.centerMoveTo(point)
      } else {
        newShapeObject.dockers.first().setReferencePoint(option.connectedShape.bounds.midPoint())
      }

      let start = newShapeObject.dockers.first()
      let end = newShapeObject.dockers.last()

      if (start.getDockedShape() && end.getDockedShape()) {
        let startPoint = start.getAbsoluteReferencePoint()
        let endPoint = end.getAbsoluteReferencePoint()

        let docker = newShapeObject.createDocker()
        docker.bounds.centerMoveTo({
          x: startPoint.x + (endPont.x - startPoint.x) / 2,
          y: startPoint.y + (endPont.y - startPoint.y) / 2
        })
      }

    } else {
      let b = newShapeObject.bounds
      if (newShapeObject instanceof ORYX_Node && newShapeObject.dockers.length == 1) {
        b = newShapeObject.dockers.first().bounds
      }

      b.centerMoveTo(point)

      let upL = b.upperLeft()
      b.moveBy(-Math.min(upL.x, 0), -Math.min(upL.y, 0))

      let lwR = b.lowerRight()
      b.moveBy(-Math.max(lwR.x - canvas.bounds.width(), 0), -Math.max(lwR.y - canvas.bounds.height(), 0))

      // 处理泳道
      // let canvasBound = this.facade.getCanvas().bounds
      let nodeTypeId = newShapeObject.getStencil().idWithoutNs()
      // .endsWith('Lane')
      if (nodeTypeId === 'V-Pool') {
        let po = {
          a: { x: b.a.x, y: 0 },
          b: { x: b.b.x, y: canvas.bounds.height() }
        }
        newShapeObject.bounds.set(po)
      } else if (nodeTypeId === 'V-Lane') {
        let po = {
          a: { x: b.a.x, y: 30 },
          b: { x: b.b.x, y: canvas.bounds.height() }
        }
        newShapeObject.bounds.set(po)
      } else if (nodeTypeId === 'Pool') {
        let po = {
          a: { x: 0, y: b.a.y },
          b: { x: canvas.bounds.width(), y: b.b.y }
        }
        newShapeObject.bounds.set(po)
      }
    }

    this.handleEvents({ type: 'newshape_addin_canvas', shape: newShapeObject })

    // Update the shape
    if (newShapeObject instanceof ORYX_Edge) {
      newShapeObject._update(false)
    }

    // And refresh the selection
    if (!(newShapeObject instanceof ORYX_Edge) && !(option.dontUpdateSelection)) {
      this.setSelection([newShapeObject])
    }

    if (con && con.alignDockers) {
      // con.alignDockers();
    }
    if (newShapeObject.alignDockers) {
      newShapeObject.alignDockers()
    }

    return newShapeObject
  }

  deleteShape (shape) {
    if (!shape || !shape.parent) {
      return
    }

    // remove shape from parent
    // this also removes it from DOM
    shape.parent.remove(shape)

    // delete references to outgoing edges
    shape.getOutgoingShapes().each(function (os) {
      let docker = os.getDockers().first()
      if (docker && docker.getDockedShape() == shape) {
        docker.setDockedShape(undefined)
      }
    })

    // delete references to incoming edges
    shape.getIncomingShapes().each(function (is) {
      let docker = is.getDockers().last()
      if (docker && docker.getDockedShape() == shape) {
        docker.setDockedShape(undefined)
      }
    })

    // delete references of the shape's dockers
    shape.getDockers().each(function (docker) {
      docker.setDockedShape(undefined)
    })
  }

  /**
   * Returns an object with meta data about the model.
   * Like name, description, ...
   *
   * Empty object with the current backend.
   *
   * @return {Object} Meta data about the model
   */
  getModelMetaData () {
    return this.modelMetaData
  }

  /* Event-Handler Methods */

  /**
   * Helper method to execute an event immediately. The event is not
   * scheduled in the _eventsQueue. Needed to handle Layout-Callbacks.
   */
  _executeEventImmediately (eventObj) {
    if (this.DOMEventListeners.keys().member(eventObj.event.type)) {
      this.DOMEventListeners.get(eventObj.event.type).each((function (value) {
        value(eventObj.event, eventObj.arg)
      }).bind(this))
    }
  }

  _executeEvents () {
    this._queueRunning = true
    while (this._eventsQueue.length > 0) {
      let val = this._eventsQueue.shift()
      this._executeEventImmediately(val)
    }
    this._queueRunning = false
  }

  /**
   * Leitet die Events an die Editor-Spezifischen Event-Methoden weiter
   * @param {Object} event Event , welches gefeuert wurde
   * @param {Object} uiObj Target-UiObj
   */
  handleEvents (event, uiObj) {
    ORYX_Log.trace('Dispatching event type %0 on %1', event.type, uiObj)
    switch (event.type) {
      case ORYX_Config.EVENT_MOUSEDOWN:
        this._handleMouseDown(event, uiObj)
        break
      case ORYX_Config.EVENT_MOUSEMOVE:
        this._handleMouseMove(event, uiObj)
        break
      case ORYX_Config.EVENT_MOUSEUP:
        this._handleMouseUp(event, uiObj)
        break
      case ORYX_Config.EVENT_MOUSEOVER:
        this._handleMouseHover(event, uiObj)
        break
      case ORYX_Config.EVENT_MOUSEOUT:
        this._handleMouseOut(event, uiObj)
        break
    }
    /* Force execution if necessary. Used while handle Layout-Callbacks. */
    if (event.forceExecution) {
      this._executeEventImmediately({ event: event, arg: uiObj })
    } else {
      this._eventsQueue.push({ event: event, arg: uiObj })
    }

    if (!this._queueRunning) {
      this._executeEvents()
    }

    // TODO: Make this return whether no listener returned false.
    // So that, when one considers bubbling undesireable, it won't happen.
    return false
  }

  isValidEvent (e) {
    try {
      let isInput = ['INPUT', 'TEXTAREA'].include(e.target.tagName.toUpperCase())
      let gridHasFocus = e.target.className.include('x-grid3-focus') && !e.target.className.include('x-grid3-focus-canvas')
      return !isInput && !gridHasFocus
    } catch (e) {
      return false
    }
  }

  catchKeyUpEvents (event) {
    if (!this._keyupEnabled) {
      return
    }
    /* assure we have the current event. */
    if (!event)
      event = window.event

    // Checks if the event comes from some input field
    if (!this.isValidEvent(event)) {
      return
    }

    /* Create key up event type */
    let keyUpEvent = this.createKeyCombEvent(event, ORYX_Config.KEY_ACTION_UP)

    ORYX_Log.debug('Key Event to handle: %0', keyUpEvent)

    /* forward to dispatching. */
    this.handleEvents({ type: keyUpEvent, event: event })
  }

  /**
   * Catches all key down events and forward the appropriated event to
   * dispatching concerning to the pressed keys.
   *
   * @param {Event}
   *    The key down event to handle
   */
  catchKeyDownEvents (event) {
    if (!this._keydownEnabled) {
      return
    }
    /* Assure we have the current event. */
    if (!event) {
      event = window.event
    }

    /* Fixed in FF3 */
    // This is a mac-specific fix. The mozilla event object has no knowledge
    // of meta key modifier on osx, however, it is needed for certain
    // shortcuts. This fix adds the metaKey field to the event object, so
    // that all listeners that registered per Oryx plugin facade profit from
    // this. The original bug is filed in
    // https://bugzilla.mozilla.org/show_bug.cgi?id=418334
    //if (this.__currentKey == ORYX.CONFIG.KEY_CODE_META) {
    //	event.appleMetaKey = true;
    //}
    //this.__currentKey = pressedKey;

    // Checks if the event comes from some input field
    if (!this.isValidEvent(event)) {
      return
    }

    /* Create key up event type */
    let keyDownEvent = this.createKeyCombEvent(event, ORYX_Config.KEY_ACTION_DOWN)

    ORYX_Log.debug('Key Event to handle: %0', keyDownEvent)

    /* Forward to dispatching. */
    this.handleEvents({ type: keyDownEvent, event: event })
  }

  /**
   * Creates the event type name concerning to the pressed keys.
   *
   * @param {Event} keyDownEvent
   *    The source keyDownEvent to build up the event name
   */
  createKeyCombEvent (keyEvent, keyAction) {
    /* Get the currently pressed key code. */
    let pressedKey = keyEvent.which || keyEvent.keyCode
    //this.__currentKey = pressedKey;

    /* Event name */
    let eventName = 'key.event'

    /* Key action */
    if (keyAction) {
      eventName += '.' + keyAction
    }

    /* Ctrl or apple meta key is pressed */
    if (keyEvent.ctrlKey || keyEvent.metaKey) {
      eventName += '.' + ORYX_Config.META_KEY_META_CTRL
    }

    /* Alt key is pressed */
    if (keyEvent.altKey) {
      eventName += '.' + ORYX_Config.META_KEY_ALT
    }

    /* Alt key is pressed */
    if (keyEvent.shiftKey) {
      eventName += '.' + ORYX_Config.META_KEY_SHIFT
    }

    /* Return the composed event name */
    return eventName + '.' + pressedKey
  }

  _handleMouseDown (event, uiObj) {
    // get canvas.
    let canvas = this.getCanvas()
    // Try to get the focus
    canvas.focus()

    // find the shape that is responsible for this element's id.
    let element = event.currentTarget
    let elementController = uiObj

    // gather information on selection.
    let currentIsSelectable = (elementController !== null) &&
      (elementController !== undefined) && (elementController.isSelectable)
    let currentIsMovable = (elementController !== null) &&
      (elementController !== undefined) && (elementController.isMovable)
    let modifierKeyPressed = event.shiftKey || event.ctrlKey
    let noObjectsSelected = this.selection.length === 0
    let currentIsSelected = this.selection.member(elementController)

    // Rule #1: When there is nothing selected, select the clicked object.
    if (currentIsSelectable && noObjectsSelected) {
      this.setSelection([elementController])
      ORYX_Log.trace('Rule #1 applied for mouse down on %0', element.id)

      // Rule #3: When at least one element is selected, and there is no
      // control key pressed, and the clicked object is not selected, select
      // the clicked object.
    } else if (currentIsSelectable && !noObjectsSelected && !modifierKeyPressed && !currentIsSelected) {
      this.setSelection([elementController])
      //var objectType = elementController.readAttributes();
      //alert(objectType[0] + ": " + objectType[1]);

      ORYX_Log.trace('Rule #3 applied for mouse down on %0', element.id)

      // Rule #4: When the control key is pressed, and the current object is
      // not selected, add it to the selection.
    } else if (currentIsSelectable && modifierKeyPressed && !currentIsSelected) {
      let newSelection = this.selection.clone()
      newSelection.push(elementController)
      this.setSelection(newSelection)

      ORYX_Log.trace('Rule #4 applied for mouse down on %0', element.id)
      // Rule #6
    } else if (currentIsSelectable && currentIsSelected && modifierKeyPressed) {
      let newSelection = this.selection.clone()
      this.setSelection(newSelection.without(elementController))

      ORYX_Log.trace('Rule #6 applied for mouse down on %0', elementController.id)

      // Rule #5: When there is at least one object selected and no control
      // key pressed, we're dragging.
      /*} else if(currentIsSelectable && !noObjectsSelected
       && !modifierKeyPressed) {

       if(this.log.isTraceEnabled())
       this.log.trace("Rule #5 applied for mouse down on "+element.id);
       */
      // Rule #2: When clicked on something that is neither
      // selectable nor movable, clear the selection, and return.
    } else if (!currentIsSelectable && !currentIsMovable) {
      this.setSelection([])
      ORYX_Log.trace('Rule #2 applied for mouse down on %0', element.id)
      return

      // Rule #7: When the current object is not selectable but movable,
      // it is probably a control. Leave the selection unchanged but set
      // the movedObject to the current one and enable Drag. Dockers will
      // be processed in the dragDocker plugin.
    } else if (!currentIsSelectable && currentIsMovable && !(elementController instanceof ORYX_Controls_Docker)) {

      // TODO: If there is any moveable elements, do this in a plugin
      //ORYX.Core.UIEnableDrag(event, elementController);

      ORYX_Log.trace('Rule #7 applied for mouse down on %0', element.id)

      // Rule #8: When the element is selectable and is currently selected and no
      // modifier key is pressed
    } else if (currentIsSelectable && currentIsSelected && !modifierKeyPressed) {
      this._subSelection = this._subSelection != elementController ? elementController : undefined
      this.setSelection(this.selection, this._subSelection)
      ORYX_Log.trace('Rule #8 applied for mouse down on %0', element.id)
    }

    // prevent event from bubbling, return.
    //Event.stop(event);
    return
  }

  _handleMouseMove (event, uiObj) {
    return;
  }

  _handleMouseUp (event, uiObj) {
    // get canvas.
    let canvas = this.getCanvas()

    // find the shape that is responsible for this elemement's id.
    let elementController = uiObj

    //get event position
    let evPos = this.eventCoordinates(event)

    //Event.stop(event);
  }

  _handleMouseHover (event, uiObj) {
    return
  }

  _handleMouseOut (event, uiObj) {
    return
  }

  /**
   * Calculates the event coordinates to SVG document coordinates.
   * @param {Event} event
   * @return {SVGPoint} The event coordinates in the SVG document
   */
  eventCoordinates (event) {
    let canvas = this.getCanvas()

    let svgPoint = canvas.node.ownerSVGElement.createSVGPoint()
    svgPoint.x = event.clientX
    svgPoint.y = event.clientY

    let additionalIEZoom = 1
    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
      let ua = navigator.userAgent
      if (ua.indexOf('MSIE') >= 0) {
        //IE 10 and below
        let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
        if (zoom !== 100) {
          additionalIEZoom = zoom / 100
        }
      }
    }

    if (additionalIEZoom !== 1) {
      svgPoint.x = svgPoint.x * additionalIEZoom
      svgPoint.y = svgPoint.y * additionalIEZoom
    }

    let matrix = canvas.node.getScreenCTM()
    return svgPoint.matrixTransform(matrix.inverse())
  }

  eventCoordinatesXY (x, y) {
    let canvas = this.getCanvas()

    let svgPoint = canvas.node.ownerSVGElement.createSVGPoint()
    svgPoint.x = x
    svgPoint.y = y

    let additionalIEZoom = 1
    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
      let ua = navigator.userAgent
      if (ua.indexOf('MSIE') >= 0) {
        // IE 10 and below
        let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
        if (zoom !== 100) {
          additionalIEZoom = zoom / 100
        }
      }
    }

    if (additionalIEZoom !== 1) {
      svgPoint.x = svgPoint.x * additionalIEZoom
      svgPoint.y = svgPoint.y * additionalIEZoom
    }

    let matrix = canvas.node.getScreenCTM()
    return svgPoint.matrixTransform(matrix.inverse())
  }

  /**
   * Creates a new ORYX.Editor instance by fetching a model from given url and passing it to the constructur
   * @param {String} modelUrl The JSON URL of a model.
   * @param {Object} config Editor config passed to the constructur, merged with the response of the request to modelUrl
   */
  createByUrl (modelUrl) {
    new Ajax.Request(modelUrl, {
      method: 'GET',
      onSuccess: function (transport) {
        var editorConfig = JSON.parse(transport.responseText)
        new ORYX_Editor(editorConfig)
      }.bind(this)
    })
  }

  // provideId () {
  //   let res = [], hex = '0123456789ABCDEF'
  //
  //   for (let i = 0; i < 36; i++) res[i] = Math.floor(Math.random() * 0x10)
  //
  //   res[14] = 4
  //   res[19] = (res[19] & 0x3) | 0x8
  //
  //   for (let i = 0; i < 36; i++) res[i] = hex[res[i]]
  //
  //   res[8] = res[13] = res[18] = res[23] = '-'
  //
  //   return 'oryx_' + res.join('')
  // }

  /**
   * When working with Ext, conditionally the window needs to be resized. To do
   * so, use this class method. Resize is deferred until 100ms, and all subsequent
   * resizeBugFix calls are ignored until the initially requested resize is
   * performed.
   */
  resizeFix () {
    if (!ORYX_Editor._resizeFixTimeout) {
      ORYX_Editor._resizeFixTimeout = window.setTimeout(function () {
        window.resizeBy(1, 1)
        window.resizeBy(-1, -1)
        ORYX_Editor._resizefixTimeout = null
      }, 100)
    }
  }
}


