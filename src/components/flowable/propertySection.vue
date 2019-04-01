<template>
  <!--表单信息区域-->
  <div id="propertiesHelpWrapper" class="col-xs-12">
{{selectedShape}}
    <div class="propertySection" id="propertySection"
         :class="{collapsed: propertyWindowState.collapsed}">
      <div class="selected-item-section">
        <div class="clearfix">
          <div class="pull-right" v-if="selectedItem.auditData && selectedItem.auditData.createDate">
            <strong>{{$t('ELEMENT.DATE_CREATED')}}: </strong> {{selectedItem.auditData.createDate}}
          </div>
          <div class="pull-right" v-if="selectedItem.auditData && selectedItem.auditData.author">
            <strong>{{$t('ELEMENT.AUTHOR')}}: </strong> {{selectedItem.auditData.author}}
          </div>
          <div class="selected-item-title">
            <a @click="propertyWindowStateToggle">
              <i class="glyphicon"
                 :class="{'glyphicon-chevron-right': propertyWindowState.collapsed,
                 'glyphicon-chevron-down': !propertyWindowState.collapsed}"></i>
              <span v-show="selectedItem.title != undefined && selectedItem.title != null &&
              selectedItem.title.length > 0">{{selectedItem.title}}</span>
              <span v-show="!selectedItem || selectedItem.title == undefined ||
              selectedItem.title == null || selectedItem.title.length == 0">{{modelData.name}}</span>
            </a>
          </div>
        </div>
        <div class="selected-item-body">
          <div>
            <div class="property-row" v-for="(property, index) in selectedItem.properties"
                 :key="index"
                 :class="{'clear': index%2 == 0}"
                 @click="propertyClicked(index)">
              <span class="title" v-if="!property.hidden">{{ property.title }}&nbsp;:</span>
              <span class="title-removed" v-if="property.hidden">
                <i>{{ property.title }}&nbsp;({{$t('PROPERTY.REMOVED')}})&nbsp;:</i>
              </span>
              <span class="value">
                {{getTemplateComponentName(property)}}||

                <!--当编辑的属性非弹窗形式，使用此处渲染-->
                <template v-if="!(property.mode === 'write' &&
    showDialogProperties.includes(getTemplateComponentName(currentSelectedProperty)))">

                  <component v-bind:is="getTemplateComponentName(property)"
                             :property="property"
                             :key="`${property.mode}-${property.key}`"
                             :selectedShape="selectedShape"
                             @updateProperty="updatePropertyInModel"></component>
                </template>

              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--当编辑的属性弹窗形式，使用此处渲染，避免弹窗关闭时 与 propertyClicked 事件的冲突-->
    <template v-if="currentSelectedProperty.mode === 'write' &&
    showDialogProperties.includes(getTemplateComponentName(currentSelectedProperty))">
      <component v-bind:is="getTemplateComponentName(currentSelectedProperty)"
                 :property="currentSelectedProperty"
                 :selectedShape="selectedShape"
                 @updateProperty="updatePropertyInModel"></component>
    </template>
  </div>
</template>

<script>
  import ORYX from '@/assets/oryx'
  import { FLOWABLE } from '@/assets/flowable/FLOWABLE_Config'
  import FLOW_OPTIONS from '@/assets/flowable/FLOW_OPTIONS'
  import defaultValueDisplayTemplate from '@/components/propertyForm/default-value-display-template'
  import stringPropertyWriteModeTemplate from '@/components/propertyForm/string-property-write-mode-template'
  import textPropertyWriteTemplate from '@/components/propertyForm/text-property-write-template'
  import processHistorylevelPropertyWriteTemplate
    from '@/components/propertyForm/process-historylevel-property-write-template'
  import booleanPropertyTemplate from '@/components/propertyForm/boolean-property-template'
  import dataPropertiesDisplayTemplate from '@/components/propertyForm/data-properties-display-template'
  import dataPropertiesWriteTemplate from '@/components/propertyForm/data-properties-write-template'
  import executionListenersDisplayTemplate from '@/components/propertyForm/execution-listeners-display-template'
  import executionListenersWriteTemplate from '@/components/propertyForm/execution-listeners-write-template'
  import eventListenersDisplayTemplate from '@/components/propertyForm/event-listeners-display-template'
  import eventListenersWriteTemplate from '@/components/propertyForm/event-listeners-write-template'
  import signalDefinitionsDisplayTemplate from '@/components/propertyForm/signal-definitions-display-template'
  import signalDefinitionsWriteTemplate from '@/components/propertyForm/signal-definitions-write-template'
  import messageDefinitionsDisplayTemplate from '@/components/propertyForm/message-definitions-display-template'
  import messageDefinitionsWriteTemplate from '@/components/propertyForm/message-definitions-write-template'

  import formReferenceDisplayTemplate from '@/components/propertyForm/form-reference-display-template'
  import formReferenceWriteTemplate from '@/components/propertyForm/form-reference-write-template'
  import formPropertiesDisplayTemplate from '@/components/propertyForm/form-properties-display-template'
  import formPropertiesWriteTemplate from '@/components/propertyForm/form-properties-write-template'
  import assignmentDisplayTemplate from '@/components/propertyForm/assignment-display-template'
  import assignmentWriteTemplate from '@/components/propertyForm/assignment-write-template'
  import taskListenersDisplayTemplate from '@/components/propertyForm/task-listeners-display-template'
  import taskListenersWriteTemplate from '@/components/propertyForm/task-listeners-write-template'
  import conditionExpressionDisplayTemplate from '@/components/propertyForm/condition-expression-display-template'
  import conditionExpressionWriteTemplate from '@/components/propertyForm/condition-expression-write-template'
  import multiinstancePropertyWriteTemplate from '@/components/propertyForm/multiinstance-property-write-template'

  export default {
    name: 'propertySection',
    data () {
      return {
        propertyWindowState: { 'collapsed': false },
        currentSelectedProperty: {},
        showDialogProperties: [
          'text-property-write-template',
          'data-properties-write-template',
          'event-listeners-write-template',
          'execution-listeners-write-template',
          'signal-definitions-write-template',
          'message-definitions-write-template',
          'form-reference-write-template',
          'form-properties-write-template',
          'assignment-write-template',
          'condition-expression-write-template'
        ],
        selectedItem: {
          title: '',
          properties: [],
          auditData: {}
        },
        selectedShape: {}
      }
    },
    props: {
      editorManager: {}
    },
    components: {
      defaultValueDisplayTemplate, stringPropertyWriteModeTemplate,
      textPropertyWriteTemplate,
      processHistorylevelPropertyWriteTemplate,
      booleanPropertyTemplate,
      dataPropertiesDisplayTemplate, dataPropertiesWriteTemplate,
      executionListenersDisplayTemplate, executionListenersWriteTemplate,
      eventListenersDisplayTemplate, eventListenersWriteTemplate,
      signalDefinitionsDisplayTemplate, signalDefinitionsWriteTemplate,
      messageDefinitionsDisplayTemplate, messageDefinitionsWriteTemplate,
      formReferenceDisplayTemplate, formReferenceWriteTemplate,
      formPropertiesDisplayTemplate, formPropertiesWriteTemplate,
      assignmentDisplayTemplate, assignmentWriteTemplate,
      taskListenersDisplayTemplate, taskListenersWriteTemplate,
      conditionExpressionDisplayTemplate, conditionExpressionWriteTemplate,
      multiinstancePropertyWriteTemplate
    },
    mounted () {
      /*
       * Listen to property updates and act upon them
       */
      FLOW_OPTIONS.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED, (event) => {
        if (event.property && event.property.key) {
          // If the name property is been updated, we also need to change the title of the currently selected item
          if (event.property.key === 'oryx-name' && this.selectedItem !== undefined && this.selectedItem !== null) {
            this.selectedItem.title = event.newValue
          }
          // Update "no value" flag
          event.property.noValue = (event.property.value === undefined
            || event.property.value === null
            || event.property.value.length == 0)
        }
      })
      FLOW_OPTIONS.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_SELECTION_CHANGED, (event) => {
        if (this.currentSelectedProperty.mode != 'write') {
          this.selectedItem = event.selectedItem
          this.selectedShape = event.selectedShape
        }
      })
    },
    computed: {
      modelData () {
        return this.editorManager ? this.editorManager.getBaseModelData() : {}
      }
    },
    methods: {
      propertyWindowStateToggle () {
        this.propertyWindowState.collapsed = !this.propertyWindowState.collapsed
        setTimeout(function () {
          window.dispatchEvent(new Event('resize'))
        }, 100)
      },
      /* Click handler for clicking a property */
      propertyClicked (index) {
        if (!this.selectedItem.properties[index].hidden) {
          this.selectedItem.properties[index].mode = 'write'
        }
        this.currentSelectedProperty = this.selectedItem.properties[index]
      },
      // 获取字段对应的渲染组件
      getTemplateComponentName (property) {
        let templateUrl = null
        if (!property.hasReadWriteMode) {
          templateUrl = property.templateUrl
        }
        if (property.hasReadWriteMode && property.mode == 'read') {
          templateUrl = property.readModeTemplateUrl
        }
        if (property.hasReadWriteMode && property.mode == 'write') {
          templateUrl = property.writeModeTemplateUrl
        }
        return templateUrl
      },

      /* Method available to all sub controllers (for property controllers) to update the internal Oryx model */
      updatePropertyInModel ({ property, shapeId }) {
        var shape = this.selectedShape
        // Some updates may happen when selected shape is already changed, so when an additional
        // shapeId is supplied, we need to make sure the correct shape is updated (current or previous)
        if (shapeId) {
          if (shape.id != shapeId && this.previousSelectedShape && this.previousSelectedShape.id == shapeId) {
            shape = this.previousSelectedShape
          } else {
            shape = null
          }
        }

        if (!shape) {
          // When no shape is selected, or no shape is found for the alternative
          // shape ID, do nothing
          return
        }

        let key = property.key
        let newValue = property.value
        let oldValue = shape.properties.get(key)

        const _this = this
        if (newValue != oldValue) {
          class commandClass extends ORYX.Core.Command{
            constructor () {
              super()
              this.key = key
              this.oldValue = oldValue
              this.newValue = newValue
              this.shape = shape
              this.facade = _this.editorManager.getEditor()
            }
            execute () {
              this.shape.setProperty(this.key, this.newValue)
              this.facade.getCanvas().update()
              this.facade.updateSelection()
            }
            rollback () {
              this.shape.setProperty(this.key, this.oldValue)
              this.facade.getCanvas().update()
              this.facade.updateSelection()
            }
          }
          // Instantiate the class
          var command = new commandClass()

          // Execute the command
          this.editorManager.executeCommands([command])
          this.editorManager.handleEvents({
            type: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,
            elements: [shape],
            key: key
          })

          // Switch the property back to read mode, now the update is done
          property.mode = 'read'

          // Fire event to all who is interested
          // Fire event to all who want to know about this
          var event = {
            type: FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED,
            property: property,
            oldValue: oldValue,
            newValue: newValue
          }

          this.editorManager.dispatchFlowEvent(event.type, event)
        } else {
          // Switch the property back to read mode, no update was needed
          property.mode = 'read'
        }
      }
    }
  }
</script>

<style scoped>
#propertiesHelpWrapper{
  z-index: 200;
}
</style>