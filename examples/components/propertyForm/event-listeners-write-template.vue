<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="modal-body">
<!--{{selectedListener}}-->
      <div class="row row-no-gutter">
        <div class="col-xs-10">
          <table-sort-template :property="property"
                               :tableData="eventListeners"
                               @add-newRow="addNewListener"
                               @currentRowChange="currentRowChange">
            <el-table-column
                prop="event"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.EVENT')">
            </el-table-column>
            <el-table-column
                prop="implementation"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.IMPLEMENTATION')">
            </el-table-column>
          </table-sort-template>
        </div>
      </div>

      <!--事件监听器详细信息配置-->
      <div class="row row-no-gutter">
        <!--事件-->
        <div v-show="hasSelectRow" class="col-xs-6">
          <div class="form-group">
            <label>{{$t('PROPERTY.EVENTLISTENERS.EVENTS')}}</label>
            <div v-for="(eventDefinition, index) in selectedListener.events"
                 :key="index">
              <select class="form-control"
                      v-model="eventDefinition.event"
                      @change="listenerDetailsChanged"
                      style="display:inline-block; width:80%;margin-bottom: 10px;">
                <option v-for="option in events_options"
                        :key="option.label"
                        :title="$t(option.title)">{{option.label}}</option>
              </select>
              <i v-if="index > 0" class="glyphicon glyphicon-minus clickable-property"
                 @click="removeEventValue(index)"
                 style="margin: 5px 0 5px 10px; font-size: 16px; cursor:pointer;"></i>
              <i class="glyphicon glyphicon-plus clickable-property"
                 @click="addEventValue(index)"
                 style="margin: 5px 0 5px 10px; font-size: 16px; cursor:pointer;"></i>
            </div>

            <div class="form-group" v-show="selectedListener.event" style="margin-top: 10px;">
              <input type="checkbox" id="rethrowField" class="checkbox"
                     v-model="selectedListener.rethrowEvent"
                     @change="listenerDetailsChanged" style="display:inline-block;"/>
              <label for="classField"
                     @click="selectedListener.rethrowEvent = !selectedListener.rethrowEvent"
                     style="cursor:pointer;">{{$t('PROPERTY.EVENTLISTENERS.RETHROW')}}</label>
            </div>
          </div>
        </div>


        <div v-show="selectedListener && selectedListener.event" class="col-xs-6">
          <template v-if="!selectedListener.rethrowEvent">
            <div class="form-group">
              <!--类-->
              <label for="classField"> {{$t('PROPERTY.EVENTLISTENERS.CLASS')}}</label>
              <input type="text" id="classField" class="form-control"
                     v-model="selectedListener.className"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.CLASS.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="delegateExpressionField">{{$t('PROPERTY.EVENTLISTENERS.DELEGATEEXPRESSION')}}</label>
              <input type="text" id="delegateExpressionField" class="form-control"
                     v-model="selectedListener.delegateExpression"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.DELEGATEEXPRESSION.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="entityTypeField">{{$t('PROPERTY.EVENTLISTENERS.ENTITYTYPE')}}</label>
              <input type="text" id="entityTypeField" class="form-control"
                     v-model="selectedListener.entityType"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.ENTITYTYPE.PLACEHOLDER')"/>
            </div>
          </template>

          <template v-else>
            <div class="form-group">
              <label for="delegateExpressionField">{{$t('PROPERTY.EVENTLISTENERS.RETHROWTYPE')}}</label>
              <select id="rethrowTypeField" class="form-control"
                      v-model="selectedListener.rethrowType">
                <option>error</option>
                <option>message</option>
                <option>signal</option>
                <option>globalSignal</option>
              </select>
            </div>
            <div class="form-group" v-if="selectedListener.rethrowType === 'error'">
              <label for="errorCodeField">{{$t('PROPERTY.EVENTLISTENERS.ERRORCODE')}}</label>
              <input type="text" id="errorCodeField" class="form-control"
                     v-model="selectedListener.errorcode"
                     @input="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.ERRORCODE.PLACEHOLDER')"/>
            </div>
            <div class="form-group" v-if="selectedListener.rethrowType === 'message'">
              <label for="messageNameField">{{$t('PROPERTY.EVENTLISTENERS.MESSAGENAME')}}</label>
              <input type="text" id="messageNameField" class="form-control"
                     v-model="selectedListener.messagename"
                     @input="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.MESSAGENAME.PLACEHOLDER')"/>
            </div>
            <div class="form-group" v-if="(selectedListener.rethrowType === 'signal' || selectedListener.rethrowType === 'globalSignal')">
              <label for="messageNameField">{{$t('PROPERTY.EVENTLISTENERS.SIGNALNAME')}}</label>
              <input type="text" id="signalNameField" class="form-control"
                     v-model="selectedListener.signalname"
                     @input="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EVENTLISTENERS.SIGNALNAME.PLACEHOLDER')"/>
            </div>
          </template>
        </div>
        <div v-show="!selectedListener" class="col-xs-6 muted no-property-selected">
          {{$t('PROPERTY.EVENTLISTENERS.UNSELECTED')}}
          <!--没有选择事件监听器-->
        </div>
      </div>

    </div>
  </DialogWrapper>
</template>

<script>
  import DialogWrapper from './DialogWrapper'
  import tableSortTemplate from './table-sort-template'
  import { EVENTS_SELECT_OPTION } from 'src/flowable/_config'

  export default {
    name: 'event-listeners-write-template',
    data () {
      return {
        hasSelectRow: false,
        selectedListener: {},
        events_options: EVENTS_SELECT_OPTION
      }
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    components: { DialogWrapper, tableSortTemplate },
    computed: {
      eventListeners () {
        let eventListeners = []
        // Put json representing form properties on scope
        if (this.property.value !== undefined && this.property.value !== null
          && this.property.value.eventListeners !== undefined
          && this.property.value.eventListeners !== null) {
          if (this.property.value.eventListeners.constructor === String) {
            eventListeners = JSON.parse(this.property.value.eventListeners)
          } else {
            // Note that we clone the json object rather then setting it directly,
            // this to cope with the fact that the user can click the cancel button and no changes should have happened
           eventListeners = jQuery.extend(true, [], this.property.value.eventListeners)
          }
        }
        return eventListeners
      }
    },
    mounted () {},
    methods: {
      currentRowChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedListener = row

        if (this.selectedListener) {
          let fields = this.selectedListener.fields
          if (fields !== undefined && fields !== null) {
            for (let i = 0; i < fields.length; i++) {
              let field = fields[i]
              if (field.stringValue !== undefined && field.stringValue !== '') {
                field.implementation = field.stringValue
              } else if (field.expression !== undefined && field.expression !== '') {
                field.implementation = field.expression
              } else if (field.string !== undefined && field.string !== '') {
                field.implementation = field.string
              }
            }
          } else {
            this.selectedListener.fields = []
          }
          if (!this.selectedListener.events) {
            this.selectedListener.events = [{ event: '' }]
          }
        }
      },
      // Click handler for + button after enum value
      addEventValue (index) {
        this.selectedListener.events.splice(index + 1, 0, { event: '' })
      },
      // Click handler for - button after enum value
      removeEventValue (index) {
        this.selectedListener.events.splice(index, 1)
        this.listenerDetailsChanged()
      },
      listenerDetailsChanged () {
        let listener = this.selectedListener
        let eventText = []
        listener.events.map((item) => {
          eventText.push(item.event)
        })
        this.selectedListener.event = eventText.toString()

        if (listener.rethrowEvent) {
          let implementationText = ''
          if (listener.rethrowType && listener.rethrowType.length > 0) {
            if (listener.rethrowType === 'error' && listener.errorcode !== '') {
              implementationText = 'Rethrow as error ' + listener.errorcode
            } else if (listener.rethrowType === 'message' && listener.messagename !== '') {
              implementationText = 'Rethrow as message ' + listener.messagename
            } else if ((listener.rethrowType === 'signal' || listener.rethrowType === 'globalSignal') &&
              listener.signalname !== '') {
              implementationText = 'Rethrow as signal ' + listener.signalname
            }
          }
          this.selectedListener.implementation = implementationText
        } else {
          if (this.selectedListener.className !== '') {
            this.selectedListener.implementation = this.selectedListener.className
          } else if (this.selectedListener.delegateExpression !== '') {
            this.selectedListener.implementation = this.selectedListener.delegateExpression
          } else {
            this.selectedListener.implementation = ''
          }
        }
      },
      // Click handler for add button
      addNewListener () {
        const newListener = {
          event: '',
          implementation: '',
          className: '',
          delegateExpression: '',
          rethrowEvent: false
        }
        this.eventListeners.push(newListener)
      },
      // Click handler for save button
      save () {
        if (this.eventListeners.length > 0) {
          this.property.value = {
            eventListeners: this.eventListeners
          }
        } else {
          this.property.value = null
        }
        this.$emit('updateProperty', {property: this.property})
        this.close()
      },
      close () {
        this.property.mode = 'read'
      }
    }
  }
</script>

<style scoped>

</style>
