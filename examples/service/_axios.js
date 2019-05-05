import axios from 'axios'
import { checkCode, HttpCode } from './_checkCode'

const appServer = axios.create({
  baseURL: process.env.VUE_APP_API_PREFIX,
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
    if (res.status === 200) {
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
