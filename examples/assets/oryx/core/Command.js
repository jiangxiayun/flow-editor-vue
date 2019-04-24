
export default class Command {
  constructor () {

  }

  execute () {
    throw "Command.execute() has to be implemented!"
  }

  rollback () {
    throw "Command.rollback() has to be implemented!"
  }
}