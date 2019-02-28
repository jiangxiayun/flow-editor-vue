import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import commonMix from './mixin'
import i18n from './i18n'

Vue.config.productionTip = false

Vue.filter('translate', function (value) {
  if (!value) return ''
  return value
})
Vue.mixin(commonMix)



new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
