# beauty-xml
Formatting XML for display in html, or copy.

## Install
```
npm i beauty-xml
```

## Usage

### basic
```js
import compile from 'beauty-xml'

const xml = `<?xml verison="1.0" encoding="utf-8"?><person><jake><age>21</age><hair>yellow</hair></jake><rose><age>20</age><hair>red</hair></rose></person>`

// React
<pre>
  <code
    dangerouslySetInnerHTML={{
      __html: compile(xml)
    }}
  />
</pre>

// display in html
// <?xml verison="1.0" encoding="utf-8"?>
// <person>
//   <jake>
//     <age>21</age>
//    <hair>yellow</hair>
//   </jake>
//   <rose>
//     <age>20</age>
//     <hair>red</hair>
//   </rose>
// </person>
```

### options
- options.type - 'html' | 'text'
  ```js
  // if `html` (default), the output is html
  // if `text`, the output is plain text
  const output = compile(xml, options)
  ```
- options.indent {number} - define indent number 
  ```js
  const output = compile(xml, {
    indent: 2
  })
  ```
- options.hooks - { text(originText): string }
  ```js
  // you can modify text via hooks.text
  const output = compile(xml, {
    hooks: {
      text(t) { return t.repeat(n) }
    }
  })
  ```
