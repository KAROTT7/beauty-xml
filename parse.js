import types from './types.js'

const DOCTYPE = /^<\?xml/
const COMMENT = /^<!--(.*)-->/
const COMMENT_CLOSE = /-->/
const ATTR = /^[\s\r\n]*[a-zA-Z][a-zA-Z0-9:]*(?:=(?:"[^"]*"|'[^']*'))/
const TAG_START_OPEN = /^<([a-zA-Z][a-zA-Z0-9:-]*)/
const TAG_START_CLOSE = /^[\s\n]*(\/)?>/
const TAG_END = /^<\/([a-zA-Z][a-zA-Z0-9]*[^>]*)>/

function parse(template) {
  if (!DOCTYPE.test(template)) {
    throw new Error('请输入 xml 格式字符串')
  }

  const tokens = []
  const stack = []
  let index = 0, lastTag, lastTemplate

  while (template) {
    if (lastTemplate === template) {
      throw new Error(`模版重复：${template}`)
    }
    lastTemplate = template

    const i = template.indexOf('<')
    let matched, end, parent = stack[stack.length - 1]
    if (i === 0) {
      // 节点处理
      if (matched = template.match(DOCTYPE)) {
        const element = {
          type: types.DOCUMENT,
          attrs: [],
          start: index,
        }

        forward(matched[0].length)

        while (!(end = template.match(/^[\s\n]*\?>/)) && (matched = template.match(ATTR))) {
          element.attrs.push(matched[0].trim())
          forward(matched[0].length)
          continue
        }

        if (end) {
          element.end = index + end[0].length
          forward(end[0].length)
        }

        tokens.push(element)
        continue
      }

      if (matched = template.match(COMMENT)) {
        if (matched[1].trim()) {
          const element = {
            type: types.COMMENT,
            value: matched[1].trim(),
            start: index,
            end: index + matched[0].length,
          }

          if (parent) {
            parent.children.push(element)
          } else {
            tokens.push(element)
          }
        }

        forward(matched[0].length)
        continue
      }

      if (matched = template.match(TAG_END)) {
        const el = stack[stack.length - 1]
        if (el) {
          el.end = index + matched[0].length
          el.close = true
          stack.pop()

          parent = stack[stack.length - 1]
          if (parent) {
            parent.children.push(el)
          } else {
            tokens.push(el)
          }

          forward(matched[0].length)
        } else {
          throw new Error('no matched element')
        }

        continue
      }

      if (matched = template.match(TAG_START_OPEN)) {
        const element = {
          type: types.ELEMENT,
          tag: matched[1],
          lowerCaseTagName: matched[1].toLowerCase(),
          start: index,
          attrs: [],
          children: [],
          close: false,
          isSelfClose: false
        }

        forward(matched[0].length)

        while (!(end = template.match(TAG_START_CLOSE)) && (matched = template.match(ATTR))) {
          element.attrs.push(matched[0].trim())
          forward(matched[0].length)
          continue
        }

        if (end && end[1] === '/') {
          element.isSelfClose = true
          element.close = true
          element.end = index + end[0].length
          parent = stack[stack.length - 1]
          if (parent) {
            parent.children.push(element)
          } else {
            tokens.push(element)
          }
        } else {
          stack.push(element)
          lastTag = element.tag
        }

        forward(end[0].length)
        continue
      }
    }

    if (/^(\n|\s)/.test(template)) {
      forward(1)
      continue
    }

    const endTagRe = new RegExp('^([\\s\\S]*)<\\/(' + lastTag + ')>', 'i')
    let rest = template.replace(endTagRe, (all, text, endTag) => {
      if (text && text.trim()) {
        const element = {
          type: types.TEXT,
          value: text.trim(),
          start: index,
          end: index + text.length
        }

        parent.children.push(element)

        forward(text.length)
      }

      return ''
    })
  }

  function forward(length) {
    template = template.slice(length)
    index += length
  }

  return tokens
}

export default parse
