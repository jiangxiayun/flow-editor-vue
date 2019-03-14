import { Message } from 'element-ui'
import router from '../router'

function redoLogin () {
  router.replace({
    path: '/login',
    query: { Rurl: router.currentRoute.fullPath }
  })
  // window.location.reload()
  router.resetRouter()
}

function checkCode (error) {
  console.log('响应错误', error)
  console.log('响应错误2', error.data)

  // 如果code异常，弹出一个错误提示
  let errorInfo = {}
  let reDoLogin = false
  if (error.data.__statusCode === 'I' || error.data.__statusCode === 'L') {
    // 会话失效则跳转至登录页面
    // window.location.href = '#/pages/login'
    errorInfo = {
      msg: '请重新登录'
    }
    reDoLogin = true
  } else {
    errorInfo.msg = error.data.__errorMessage
  }

  // 支持部分接口不用统一的错误提示形式，在这类接口请求中设置 notAutoError: true
  // 当需要重新登录时，不显示错误提示
  if (!error.config.notAutoError) {
    Message({
      type: 'error',
      message: errorInfo.msg
    })
  }

  if (reDoLogin) {
    redoLogin()
  }
}

function HttpCode (error) {
  console.log('Http响应错误', error.response, error.config)

  let errorInfo = {}
  let reDoLogin = false
  if (!error.response) {
    errorInfo = {
      status: -404,
      msg: '服务器异常'
    }
  } else {
    errorInfo.msg = error.response.data.__errorMessage || '请求失败'
    if (error.response.status === 401) {
      reDoLogin = true
    }
  }

  // 支持部分接口不用统一的错误提示形式，在这类接口请求中设置 notAutoError: true
  if (!error.config.notAutoError && !reDoLogin) {
    Message({
      type: 'error',
      message: errorInfo.msg
    })
  }
  if (reDoLogin) {
    redoLogin()
    // window.location.reload()
  }
}

export {
  checkCode,
  HttpCode
}
