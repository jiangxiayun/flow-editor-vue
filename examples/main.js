import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './plugins/VTable.js'
import './directives.js'
import commonMix from './mixin'
import i18n from './i18n'

import flowEditor from './../packages/index'
Vue.use(flowEditor)

import stencilDragItemTemplate from '@/components/flowable/stencil-drag-item-template'
Vue.component('stencilDragItem', stencilDragItemTemplate)

Vue.config.productionTip = false

Vue.filter('limitLength', function (value, len) {
  if (!value) return ''
  if (value.length <= len) return value
  return value.slice(0, len)
})

Vue.filter('dateformat', function (date, format) {
  if (date) {
    // if (format) {
    //   return moment(date).format(format)
    // } else {
    //   return moment(date).calendar()
    // }
    return date
  }
  return ''
})

Vue.mixin(commonMix)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
