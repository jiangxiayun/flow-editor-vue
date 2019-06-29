import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import flowEditor from 'src/index'
import 'packages/styles/src/index.scss'
import demoBlock from '@/components/demo-block.vue'

Vue.use(ElementUI)
Vue.use(flowEditor)
Vue.component('demo-block', demoBlock)
// 注意，在注册全局组件时，一定是叫demo-block。

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

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
