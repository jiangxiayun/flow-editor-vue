import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './plugins/VTable.js'
import './directives.js'
import commonMix from './mixin'
import i18n from './i18n'

Vue.config.productionTip = false

Vue.filter('translate', function (value) {
  if (!value) return ''
  return value
})
Vue.filter('limitLength', function (value, len) {
  if (!value) return ''
  if (value.length <= len) return value
  return value.slice(0, len)
})

Vue.mixin(commonMix)



new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
