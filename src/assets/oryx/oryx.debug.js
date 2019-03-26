function assert(expr, m) {
  if (!expr) throw m;
};

function DMCommand(action, triple) {

  // store action and triple.
  this.action = action;
  this.triple = triple;

  this.toString = function () {
    return 'Command(' + action + ', ' + triple + ')';
  };
}

function DMCommandHandler(nextHandler) {

  /**
   * Private method to set the next handler in the Chain of Responsibility
   * (see http://en.wikipedia.org/wiki/Chain-of-responsibility_pattern for
   * details).
   * @param {DMCommandHandler} handler The handler that is next in the chain.
   */
  this.__setNext = function (handler) {
    var _next = this.__next;
    this.__next = nextHandler;
    return _next ? _next : true;
  };
  this.__setNext(nextHandler);

  /**
   * Invokes the next handler. If there is no next handler, this method
   * returns false, otherwise it forwards the result of the handling.
   * @param {Object} command The command object to be processed.
   */
  this.__invokeNext = function (command) {
    return this.__next ? this.__next.handle(command) : false;
  };

  /**
   * Handles a command. The abstract method process() is called with the
   * command object that has been passed. If the process method catches the
   * command (returns true on completion), the handle() method returns true.
   * If the process() method doesn't catch the command, the next handler will
   * be invoked.
   * @param {Object} command The command object to be processed.
   */
  this.handle = function (command) {
    return this.process(command) ? true : this.__invokeNext(command);
  }

  /**
   * Empty process() method returning false. If javascript knew abstract
   * class members, this would be one.
   * @param {Object} command The command object to process.
   */
  this.process = function (command) {
    return false;
  };
};

/**
 * This Handler manages the addition and the removal of meta elements in the
 * head of the document.
 * @param {DMCommandHandler} next The handler that is next in the chain.
 */
function MetaTagHandler(next) {

  DMCommandHandler.apply(this, [next]);
  this.process = function (command) {

    with (command.triple) {

      /* assert prerequisites */
      if (!(
        (subject instanceof ERDF.Resource) &&
        (subject.isCurrentDocument()) &&
        (object instanceof ERDF.Literal)
      )) return false;
    }

  };
};

var chain = new MetaTagHandler();
var command = new DMCommand(TRIPLE_ADD, new ERDF.Triple(
  new ERDF.Resource(''),
  'rdf:tool',
  new ERDF.Literal('')
));

/*
if(chain.handle(command))
	alert('Handled!');
*/




function printf() {

  var result = arguments[0];
  for (var i = 1; i < arguments.length; i++)
    result = result.replace('%' + (i - 1), arguments[i]);
  return result;
}


var idCounter = 0;
var ID_PREFIX = "resource";



