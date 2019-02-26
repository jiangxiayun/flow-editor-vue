import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import commonMix from './mixin'

Vue.config.productionTip = false

Vue.filter('translate', function (value) {
  if (!value) return ''
  return value
})
Vue.mixin(commonMix)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
