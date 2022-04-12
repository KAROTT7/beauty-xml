import types from './types.js'

function generate(tokens, options = {}) {
  const toText = options.type === 'text'
  const hooks = options.hooks ? options.hooks : {}

  function createSpan(text, className) {
    return toText ? text : `<span${className ? ` class="${className}"` : ''}>${text}</span>`
  }

  function createTokenLine(text, className, br) {
    return createSpan(text + (br ? marks.br : ''), `token-line${className ? ` ${className}` : ''}`)
  }

  const marks = {
    whitespace: toText ? ' ' : createSpan(' '),
    slash: createSpan('/', 'slash'),
    lessThan: createSpan('<', 'less-than'),
    greaterThan: createSpan('>', 'greater-than'),
    singleQuotation: createSpan("'", 'single-quotation'),
    doubleQuotation: createSpan('"', 'double-quotation'),
    doubleHyphen: createSpan('--', 'double-hyphen'),
    questionMark: createSpan('?', 'question-mark'),
    equal: createSpan('=', 'equal'),
    attrName: n => createSpan(n, 'attr-name'),
    attrValue: n => createSpan(n, 'attr-value'),
    tag: n => createSpan(n, 'tag'),
    plain: n => createSpan(n, 'plain'),
    br: toText ? '\n' : '<br/>'
  }

  function geneAttrs(attrs = []) {
    if (!Array.isArray(attrs) || !attrs.length) {
      return ''
    }

    return attrs.reduce((t, item, i) => {
      const last = i === attrs.length - 1

      let [name, value] = item.split('=')
      value = value.slice(1, -1)

      return t + marks.attrName(name) + marks.equal + marks.doubleQuotation + marks.attrValue(value) + marks.doubleQuotation + (last ? '' : marks.whitespace)
    }, ' ')
  }

  function genElement(nodes, depth, parent) {
    const padding = marks.whitespace.repeat(depth * 2)
    let code = ''

    nodes.forEach((node, i) => {
      const needBreakLink = i !== nodes.length - 1
      const attrs = geneAttrs(node.attrs)

      if (node.type === types.DOCUMENT) {

        code += createTokenLine(marks.lessThan + marks.questionMark + marks.tag('xml') + attrs + marks.questionMark + marks.greaterThan, 'doctype', needBreakLink)

      } else if (node.type === types.COMMENT) {

        code += createTokenLine(padding + marks.lessThan + marks.questionMark + marks.doubleHyphen + marks.whitespace + marks.plain(node.value) + marks.whitespace + marks.doubleHyphen + marks.greaterThan, 'comment', needBreakLink)

      } else if (node.type === types.ELEMENT) {

        const tag = marks.tag(node.tag)
        const child = genElement(node.children, depth + 1)
        const children = child.newLine ? marks.br + child.code + marks.br : child.code

        code += createTokenLine(padding + marks.lessThan + tag + attrs + marks.greaterThan + children + (child.newLine ? padding : '') + marks.lessThan + marks.slash + tag + marks.greaterThan, 'element', needBreakLink)

      } else if (node.type === types.TEXT) {

        code += marks.plain(hooks.text ? hooks.text(node.value) : node.value)

      } else {
        throw new Error('Unknown node type: ' + node.type)
      }
    })

    return {
      code,
      newLine: depth !== 0 && (nodes.length > 1 || (nodes.length === 1 && nodes[0].type !== types.TEXT))
    }
  }

  const { code } = genElement(tokens, 0)

  return code
}

export default generate
