const parse = require('./parse')
const generate = require('./generate')

function compile(xml) {
  const ast = parse(xml.trim())
  const code = generate(code)

  return code
}

module.exports = {
  parse,
  generate,
  compile
}
