import axios from 'axios'
import { checkCode, HttpCode } from './_checkCode'
import store from '../store'

const appServer = axios.create({
  baseURL: process.env.APPL_BASE_URL,
  timeout: 35000
})
// appServer.defaults.headers.post['Content-Type'] = 'application/json'
// appServer.defaults.withCredentials = true // 允许跨域带上cookies

//  请求拦截器配置
appServer.interceptors.request.use(
  config => {
    const configNew = config

    // 上传文件时不做处理
    if (configNew.fileUp) {
      return configNew
    }
    // let token = sessionStorage.getItem(configConst.tokenName)
    configNew.data.profile = { __token: store.state.Global.userToken }
    // console.log('configNew::', configNew)
    return configNew
  },
  err => {
    return Promise.reject(err)
  }
)

// 响应拦截器
appServer.interceptors.response.use(
  res => {
    // 判断是否为文件下载接口
    if (res.config.file) {
      return { ...res }
    }
    if (res.data.__statusCode === 'S') {
      return res.data
    }
    checkCode(res)
    return Promise.reject(res.data)
  },
  err => {
    HttpCode(err)
    return Promise.reject(err)
  })

export default appServer
