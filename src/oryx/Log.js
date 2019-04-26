const ORYX_LOGLEVEL_TRACE = 5
const ORYX_LOGLEVEL_DEBUG = 4
const ORYX_LOGLEVEL_INFO = 3
const ORYX_LOGLEVEL_WARN = 2
const ORYX_LOGLEVEL_ERROR = 1
const ORYX_LOGLEVEL_FATAL = 0
const ORYX_LOGLEVEL = 3


function printf () {
  var result = arguments[0]
  for (let i = 1; i < arguments.length; i++)
    result = result.replace('%' + (i - 1), arguments[i])
  return result
}

const ORYX_Log = {
  __appenders: [
    {
      append: function (message) {
        if (typeof(console) !== 'undefined' && console.log !== undefined) {
          console.log(message)
        }
      }
    }
  ],

  trace: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_TRACE)
      ORYX_Log.__log('TRACE', arguments)
  },
  debug: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_DEBUG)
      ORYX_Log.__log('DEBUG', arguments)
  },
  info: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_INFO)
      ORYX_Log.__log('INFO', arguments)
  },
  warn: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_WARN)
      ORYX_Log.__log('WARN', arguments)
  },
  error: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_ERROR)
      ORYX_Log.__log('ERROR', arguments)
  },
  fatal: function () {
    if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_FATAL)
      ORYX_Log.__log('FATAL', arguments)
  },

  __log: function (prefix, messageParts) {

    messageParts[0] = (new Date()).getTime() + ' '
      + prefix + ' ' + messageParts[0]
    var message = printf.apply(null, messageParts)

    ORYX_Log.__appenders.each(function (appender) {
      appender.append(message)
    })
  },

  addAppender: function (appender) {
    ORYX_Log.__appenders.push(appender)
  }
}

export default ORYX_Log
