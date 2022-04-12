import types from '../types.js'
import parse from '../parse.js'

describe('测试 parse 方法', () => {
  it('是否是 XML 文档', () => {
    expect(() => parse('123')).toThrow()
  })

  it('文档标记', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?>'
    expect(
      parse(input)
    ).toEqual([{
      type: types.DOCUMENT,
      attrs: ['version="1.0"', 'encoding="utf-8"'],
      start: 0,
      end: input.length
    }])
  })

  it('文档标记 + 评论', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment-->'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: input.length
      }
    ])
  })

  it('文档标记 + 评论 + 空元素', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a />'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: input.length,
        attrs: [],
        children: [],
        close: true,
        isSelfClose: true
      }
    ])
  })

  it('文档标记 + 评论 + 空元素(带属性)', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a b="c" c=\'d\' />'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: input.length,
        attrs: ['b="c"', "c='d'"],
        children: [],
        close: true,
        isSelfClose: true
      }
    ])
  })

  it('文档标记 + 评论 + 空元素 + 非空元素', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a /><B>b</B>'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: 57,
        attrs: [],
        children: [],
        close: true,
        isSelfClose: true
      },
      {
        type: types.ELEMENT,
        tag: 'B',
        lowerCaseTagName: 'b',
        start: 57,
        end: input.length,
        attrs: [],
        children: [
          {
            type: types.TEXT,
            value: 'b',
            start: 60,
            end: 61
          }
        ],
        close: true,
        isSelfClose: false
      }
    ])
  })

  it('文档标记 + 评论 + 空元素 + 非空元素(带属性)', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a /><B c="d" e="f">b</B>'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: 57,
        attrs: [],
        children: [],
        close: true,
        isSelfClose: true
      },
      {
        type: types.ELEMENT,
        tag: 'B',
        lowerCaseTagName: 'b',
        start: 57,
        end: input.length,
        attrs: ['c="d"', 'e="f"'],
        children: [
          {
            type: types.TEXT,
            value: 'b',
            start: 72,
            end: 73
          }
        ],
        close: true,
        isSelfClose: false
      }
    ])
  })

  it('文档标记 + 评论 + 空元素 + 非空元素 + 嵌套元素', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a /><B>b</B><c><d><e>e</e></d></c>'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: 57,
        attrs: [],
        children: [],
        close: true,
        isSelfClose: true
      },
      {
        type: types.ELEMENT,
        tag: 'B',
        lowerCaseTagName: 'b',
        start: 57,
        end: 65,
        attrs: [],
        children: [
          {
            type: types.TEXT,
            value: 'b',
            start: 60,
            end: 61
          }
        ],
        close: true,
        isSelfClose: false
      },
      {
        type: types.ELEMENT,
        tag: 'c',
        lowerCaseTagName: 'c',
        start: 65,
        end: 87,
        attrs: [],
        children: [
          {
            type: types.ELEMENT,
            tag: 'd',
            lowerCaseTagName: 'd',
            start: 68,
            end: 83,
            attrs: [],
            children: [
              {
                type: types.ELEMENT,
                tag: 'e',
                lowerCaseTagName: 'e',
                start: 71,
                end: 79,
                attrs: [],
                children: [
                  {
                    type: types.TEXT,
                    value: 'e',
                    start: 74,
                    end: 75
                  }
                ],
                close: true,
                isSelfClose: false
              },
            ],
            close: true,
            isSelfClose: false
          },
        ],
        close: true,
        isSelfClose: false
      },
    ])
  })

  it('文档标记 + 评论 + 空元素 + 非空元素 + 嵌套多个元素', () => {
    const input = '<?xml version="1.0" encoding="utf-8"?><!--comment--><a /><B>b</B><c><d><e>e</e><F>f</F></d></c>'
    expect(
      parse(input)
    ).toEqual([
      {
        type: types.DOCUMENT,
        attrs: ['version="1.0"', 'encoding="utf-8"'],
        start: 0,
        end: 38
      },
      {
        type: types.COMMENT,
        value: 'comment',
        start: 38,
        end: 52
      },
      {
        type: types.ELEMENT,
        tag: 'a',
        lowerCaseTagName: 'a',
        start: 52,
        end: 57,
        attrs: [],
        children: [],
        close: true,
        isSelfClose: true
      },
      {
        type: types.ELEMENT,
        tag: 'B',
        lowerCaseTagName: 'b',
        start: 57,
        end: 65,
        attrs: [],
        children: [
          {
            type: types.TEXT,
            value: 'b',
            start: 60,
            end: 61
          }
        ],
        close: true,
        isSelfClose: false
      },
      {
        type: types.ELEMENT,
        tag: 'c',
        lowerCaseTagName: 'c',
        start: 65,
        end: 95,
        attrs: [],
        children: [
          {
            type: types.ELEMENT,
            tag: 'd',
            lowerCaseTagName: 'd',
            start: 68,
            end: 91,
            attrs: [],
            children: [
              {
                type: types.ELEMENT,
                tag: 'e',
                lowerCaseTagName: 'e',
                start: 71,
                end: 79,
                attrs: [],
                children: [
                  {
                    type: types.TEXT,
                    value: 'e',
                    start: 74,
                    end: 75
                  }
                ],
                close: true,
                isSelfClose: false
              },
              {
                type: types.ELEMENT,
                tag: 'F',
                lowerCaseTagName: 'f',
                start: 79,
                end: 87,
                attrs: [],
                children: [
                  {
                    type: types.TEXT,
                    value: 'f',
                    start: 82,
                    end: 83
                  }
                ],
                close: true,
                isSelfClose: false
              },
            ],
            close: true,
            isSelfClose: false
          },
        ],
        close: true,
        isSelfClose: false
      },
    ])
  })
})

