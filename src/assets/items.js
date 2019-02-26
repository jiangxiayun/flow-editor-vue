/**
 * 设置自定义命令
 */
import G6Editor from '@antv/g6-editor'


const Command = G6Editor.Command


export default function setCustomCommand () {
  // 保存命令
  Command.registerCommand('save', {
    queue: false,  // 命令是否进入队列，默认是 true
    // 命令是否可用
    enable() {
      return true
    },
    // 正向命令
    execute(eidtor) {
      const data = eidtor.getCurrentPage().save()
      console.log('save-Command', data)
    },
    // shortcutCodes: [['ctrlKey', 'shiftKey', 's']] // 快捷键：Ctrl+shirt+s
    shortcutCodes: [['ctrlKey', 's']] // 快捷键：Ctrl+s
  })
}

