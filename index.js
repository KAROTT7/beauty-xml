const xml = `
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <UploadInvoiceAutoTrackNoV2Response
      xmlns="http://www.uxb2b.com/"
    >
      <UploadInvoiceAutoTrackNoV2Result>
        <Root
          xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns=""
        >
          <UXB2B>電子發票系統</UXB2B>
          <Result>
            <value>1</value>
            <timeStamp>2022-03-29T17:59:26.1813469+08:00</timeStamp>
          </Result>
          <Automation>
            <Item>
              <Status>1</Status>
              <Description />
              <Invoice>
                <SellerId>82968252</SellerId>
                <InvoiceNumber>ZC14235963</InvoiceNumber>
                <DataNumber>FPSMP220329000753</DataNumber>
                <InvoiceDate>2022/03/29</InvoiceDate>
                <InvoiceTime>17:59:26</InvoiceTime>
              </Invoice>
            </Item>
          </Automation>
        </Root>
      </UploadInvoiceAutoTrackNoV2Result>
    </UploadInvoiceAutoTrackNoV2Response>
  </soap:Body>
</soap:Envelope>
`

const DOCUMENT_TYPE = 'DOCUMENT'
const ELEMENT_TYPE  = 'ELEMENT'
const COMMENT_TYPE  = 'COMMENT'
const TEXT_TYPE     = 'TEXT'

const string = `
<?xml version="1.0" encoding="utf-8"?>
<!-- Comment -->
<a
  c="c"
  d="d"
>
  123
</a>
`

const DOCTYPE = /^<\?xml/
const COMMENT = /^<!--(.*)-->/
const COMMENT_CLOSE = /-->/
const ATTR = /^[\s\r\n]*[a-zA-Z][a-zA-Z0-9:]*(?:=(?:"[^"]*"|'[^']*'))/
const TAG_START_OPEN = /^<([a-zA-Z][a-zA-Z0-9:-]*)/
const TAG_START_CLOSE = /^[\s\n]*(\/)?>/
const TAG_END = /^<\/([a-zA-Z][a-zA-Z0-9]*[^>]*)>/

const LIMIT_NUMBER = 5
let lastTemplate

function parse(template) {
  const tokens = []
  const stack = []
  let index = 0, lastTag

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
          type: DOCUMENT_TYPE,
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
            type: COMMENT_TYPE,
            value: ` ${matched[1].trim()} `,
            start: index,
            end: index + matched[0].length,
            parent
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
          type: ELEMENT_TYPE,
          tag: matched[1],
          lowerCaseTagName: matched[1].toLowerCase(),
          start: index,
          attrs: [],
          children: [],
          close: false,
          isSelfClose: false,
          parent
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
          forward(end[0].length)
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
          type: TEXT_TYPE,
          value: text.trim(),
          start: index,
          end: text.length,
          parent
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

const tokens = parse(xml.trim())
