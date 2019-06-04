import AbstractPlugin from './AbstractPlugin'
import AbstractLayouter from './AbstractLayouter'
import Edit from './Edit'
import View from './View'
import Loading from './Loading'
import CanvasResize from './CanvasResize'
import CanvasResizeButton from './CanvasResizeButton'
import RenameShapes from './RenameShapes'
import ProcessLink from './ProcessLink'
import Save from './Save'
import SelectedRect from './SelectedRect'
import DragDropResize from './DragDropResize'
import PoolResize from './PoolResize'
import GridLine from './GridLine'
import ShapeHighlighting from './ShapeHighlighting'
import HighlightingSelectedShapes from './HighlightingSelectedShapes'
import Resizer from './Resizer'
import DragDocker from './DragDocker'
import AddDocker from './AddDocker'
import SelectionFrame from './SelectionFrame'
import Overlay from './Overlay'
import KeysMove from './KeysMove'
import Layouter from './Layouter'
import BPMN2_0 from './BPMN2_0'
import Arrangement from './Arrangement'
import PoolAsProperty from './PoolAsProperty'
import ORYX_Log from '../Log'

const Plugins = {
  availablePlugins: [],
  AbstractPlugin: AbstractPlugin,
  AbstractLayouter: AbstractLayouter,
  Edit: Edit,
  View: View,
  Loading: Loading,
  CanvasResize: CanvasResize,
  CanvasResizeButton: CanvasResizeButton,
  RenameShapes: RenameShapes,
  ProcessLink: ProcessLink,
  Save: Save,
  SelectedRect: SelectedRect,
  DragDropResize: DragDropResize,
  PoolResize: PoolResize,
  GridLine: GridLine,
  ShapeHighlighting: ShapeHighlighting,
  HighlightingSelectedShapes: HighlightingSelectedShapes,
  Resizer: Resizer,
  DragDocker: DragDocker,
  AddDocker: AddDocker,
  SelectionFrame: SelectionFrame,
  Overlay: Overlay,
  KeysMove: KeysMove,
  Layouter: Layouter,
  BPMN2_0: BPMN2_0,
  Arrangement: Arrangement,
  PoolAsProperty: PoolAsProperty,
  getProperties: function (props) {
    if (!props) return []
    let arry = []
    props.forEach((prop) => {
      let property = new Map()
      let attributes = Object.keys(prop)
      attributes.map(function (attr) {
        property.set(attr, prop[attr])
      })
      if (attributes.length > 0) {
        arry.push(property)
      }
    })
    return arry
  },
  _loadPlugins: function (config) {
    // Get the globale Properties
    let globalProperties = this.getProperties(config.properties)

    const availablePlugins = []
    config.plugins.map(plugin => {
      let pluginData = new Map()
      if (!plugin.name) {
        ORYX_Log.error('A plugin is not providing a name. Ingnoring this plugin.')
        return
      }
      if (plugin.type === 'custom' && plugin.plugin) {
        Plugins[plugin.name] = plugin.plugin
        plugin.name = ` Plugins.${plugin.name}`
      }
      pluginData.set('name', plugin.name)
      // Get all private Properties
      let properties = this.getProperties(plugin.properties)
      // Set all Global-Properties to the Properties
      properties = properties.concat(globalProperties)
      // Set Properties to Plugin-Data
      pluginData.set('properties', properties)
      availablePlugins.push(pluginData)
    })
    this.availablePlugins = availablePlugins
  }
}

export default Plugins
