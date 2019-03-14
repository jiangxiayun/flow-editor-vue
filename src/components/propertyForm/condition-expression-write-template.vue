<template>
  <div class="modal" ng-controller="FlowableConditionExpressionPopupCtrl">
    <div class="modal-dialog modal-wide">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="close()">&times;
          </button>
          <h2 translate>PROPERTY.SEQUENCEFLOW.CONDITION.TITLE</h2>
        </div>
        <div class="modal-body">

          <div class="detail-group clearfix">

            <div class="col-xs-12">
              <label class="col-xs-3">{{'PROPERTY.SEQUENCEFLOW.CONDITION.STATIC' | translate}}</label>
              <div class="col-xs-9">
                <textarea class="form-control" ng-model="expression.staticValue"
                          style="width:70%; height:100%; max-width: 100%; max-height: 100%; min-height: 50px"/>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button ng-click="close()" class="btn btn-primary" translate>ACTION.CANCEL</button>
            <button ng-click="save()" class="btn btn-primary" translate>ACTION.SAVE</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'condition-expression-write-template',
    data () {
      return {
        expression: {}
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
    mounted () {
      // Put json representing assignment on scope
      if (this.property.value !== undefined && this.property.value !== null
        && this.property.value.expression !== undefined
        && this.property.value.expression !== null) {

        this.expression = this.property.value.expression
      } else if (this.property.value !== undefined && this.property.value !== null) {
        this.expression = { type: 'static', staticValue: this.property.value }
      } else {
        this.expression = {}
      }
    },
    methods: {
      save () {
        this.property.value = { expression: this.expression }
        this.$emit('updateProperty', {property: this.property})
        this.close()
      },
      // Close button handler
      close () {
        this.property.mode = 'read'
        this.$hide()
      }
    }
  }
</script>

<style scoped>

</style>