import Vue from 'vue'
import Vuex from 'vuex'
import Flowable from './modules/flowable'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    Flowable
  },
  strict: debug
})
