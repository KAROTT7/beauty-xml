import parse from './parse.js'
import generate from './generate.js'

function compile(xml) {
  const ast = parse(xml.trim())
  const code = generate(ast)

  return code
}

export default compile
