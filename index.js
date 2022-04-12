import parse from './parse.js'
import generate from './generate.js'

/**
 * beauty xml text in html
 * @param {string} xml - input text.
 * @param {object} options
 * @param {string} options.type - returned text type.
 * @param {object} options.hooks
 * @param {function} options.hooks.text - (origin: string) => string
 * @returns {string}
 */
function compile(xml, options = {}) {
  const type = options.type || 'html'
  const hooks = options.hooks || {}

  const ast = parse(xml.trim())
  const code = generate(ast, {
    type,
    hooks
  })

  return code
}

export default compile
