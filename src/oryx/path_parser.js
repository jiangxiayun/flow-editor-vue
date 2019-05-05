// export class Svg {
//   constructor () {
//     this.VERSION = 1.0
//     this.NAMESPACE = 'http://www.w3.org/2000/svg'
//   }
// }

const Svg = {
  VERSION: '1.0',
  NAMESPACE: 'http://www.w3.org/2000/svg'
}

class PathLexer {
  VERSION = 1.0

  constructor (pathData) {
    if (pathData == null) pathData = ''
    this.setPathData(pathData)
  }

  setPathData (pathData) {
    if (typeof(pathData) !== 'string') throw new Error('PathLexer.setPathData: The first parameter must be a string')
    this._pathData = pathData
  }

  getNextToken () {
    let result = null
    let d = this._pathData
    while (result == null) {
      if (d == null || d === '') {
        result = new PathToken(PathToken_const.EOD, '')
      } else if (d.match(/^([ \t\r\n,]+)/)) {
        d = d.substr(RegExp.$1.length)
      } else if (d.match(/^([AaCcHhLlMmQqSsTtVvZz])/)) {
        result = new PathToken(PathToken_const.COMMAND, RegExp.$1)
        d = d.substr(RegExp.$1.length)
      } else if (d.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) {
        result = new PathToken(PathToken_const.NUMBER, parseFloat(RegExp.$1))
        d = d.substr(RegExp.$1.length)
      } else {
        throw new Error('PathLexer.getNextToken: unrecognized path data ' + d)
      }
    }
    this._pathData = d
    return result
  }
}

const PathToken_const = {
  UNDEFINED: 0,
  COMMAND: 1,
  NUMBER: 2,
  EOD: 3,
}

class PathToken {
  constructor (type, text) {
    if (arguments.length > 0) {
      this.init(type, text)
    }
  }

  init (type, text) {
    this.type = type
    this.text = text
  }

  typeis (type) {
    return this.type === type
  }
}

const PathParser_const = {
  PARAMCOUNT: { A: 7, C: 6, H: 1, L: 2, M: 2, Q: 4, S: 4, T: 2, V: 1, Z: 0 },
  METHODNAME: {
    A: 'arcAbs',
    a: 'arcRel',
    C: 'curvetoCubicAbs',
    c: 'curvetoCubicRel',
    H: 'linetoHorizontalAbs',
    h: 'linetoHorizontalRel',
    L: 'linetoAbs',
    l: 'linetoRel',
    M: 'movetoAbs',
    m: 'movetoRel',
    Q: 'curvetoQuadraticAbs',
    q: 'curvetoQuadraticRel',
    S: 'curvetoCubicSmoothAbs',
    s: 'curvetoCubicSmoothRel',
    T: 'curvetoQuadraticSmoothAbs',
    t: 'curvetoQuadraticSmoothRel',
    V: 'linetoVerticalAbs',
    v: 'linetoVerticalRel',
    Z: 'closePath',
    z: 'closePath'
  }
}
export class PathParser {
  constructor () {
    this._lexer = new PathLexer()
    this._handler = null
  }

  parsePath (path) {
    if (path == null || path.namespaceURI !== Svg.NAMESPACE || path.localName !== 'path') {
      throw new Error('PathParser.parsePath: The first parameter must be an SVG path element')
    }
    this.parseData(path.getAttributeNS(null, 'd'))
  }

  parseData (pathData) {
    if (typeof(pathData) !== 'string') {
      throw new Error('PathParser.parseData: The first parameter must be a string')
    }
    if (this._handler != null && this._handler.beginParse != null) {
      this._handler.beginParse()
    }
    let lexer = this._lexer
    lexer.setPathData(pathData)
    let mode = 'BOP'
    let token = lexer.getNextToken()
    while (!token.typeis(PathToken_const.EOD)) {
      let param_count
      let params =[]
      switch (token.type) {
        case PathToken_const.COMMAND:
          if (mode === 'BOP' && token.text !== 'M' && token.text !== 'm') {
            throw new Error('PathParser.parseData: a path must begin with a moveto command')
          }
          mode = token.text
          param_count = PathParser_const.PARAMCOUNT[token.text.toUpperCase()]
          token = lexer.getNextToken()
          break
        case PathToken_const.NUMBER:
          break
        default:
          throw new Error('PathParser.parseData: unrecognized token type: ' + token.type)
      }
      for (let i = 0; i < param_count; i++) {
        switch (token.type) {
          case PathToken_const.COMMAND:
            throw new Error('PathParser.parseData: parameter must be a number: ' + token.text)
          case PathToken_const.NUMBER:
            params[i] = token.text - 0
            break
          default:
            throw new Error('PathParser.parseData: unrecognized token type: ' + token.type)
        }
        token = lexer.getNextToken()
      }
      if (this._handler != null) {
        let handler = this._handler
        let method = PathParser_const.METHODNAME[mode]
        if (handler[method] != null) handler[method].apply(handler, params)
      }
      if (mode === 'M') mode = 'L'
      if (mode === 'm') mode = 'l'
    }
  }

  setHandler (handler) {
    this._handler = handler
  }
}


