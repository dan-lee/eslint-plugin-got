const create = (context) => {
  const importNames = []
  const requestMethods = ['get', 'post', 'put', 'patch', 'head', 'delete']

  const imports =
    !context.options ||
    context.options.length === 0 ||
    !context.options[0] ||
    !context.options[0].imports
      ? []
      : context.options[0].imports

  const reportNode = (node) => {
    context.report({
      node,
      message: 'The request input should not start with a leading slash.',
      fix: (fixer) => fixer.removeRange([node.range[0] + 1, node.range[0] + 2]),
    })
  }

  const checkCallArgument = (input, options) => {
    if (!input) return

    if (input.type === 'Literal' && input.value.startsWith('/')) {
      // api.post('/…')
      reportNode(input)
    } else if (input.type === 'TemplateLiteral') {
      // api.post(`/${path}`)
      const [firstTemplateString] = input.quasis

      if (firstTemplateString.value.raw.startsWith('/')) {
        reportNode(firstTemplateString)
      }
    }
  }

  return {
    ImportDeclaration(node) {
      const { value } = node.source

      const shouldLint = imports
        .map((pattern) => new RegExp(pattern))
        .some((regex) => regex.test(value))

      if (shouldLint) {
        if (node.specifiers[0].type === 'ImportDefaultSpecifier') {
          importNames.push(node.specifiers[0].local.name)
        }
      }
    },
    'CallExpression Identifier[name]': (node) => {
      if (importNames.includes(node.name)) {
        const { parent } = node
        if (parent.type === 'CallExpression') {
          // got('…')
          checkCallArgument(parent.arguments[0])
        } else if (
          parent.type === 'MemberExpression' &&
          parent.object.type === 'Identifier' &&
          parent.property.type === 'Identifier' &&
          importNames.includes(parent.object.name) &&
          requestMethods.includes(parent.property.name)
        ) {
          // got.post, got.get, got.delete…
          checkCallArgument(parent.parent.arguments[0])
        }
      }
    },
  }
}

module.exports = {
  create,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow leading slashes in got/ky/… requests.',
      recommended: true,
      url: 'https://github.com/sindresorhus/got/blob/master/readme.md#prefixurl',
    },
    fixable: 'code',
    schema: [
      {
        properties: {
          imports: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            additionalItems: true,
          },
        },
        additionalProperties: false,
        required: ['imports'],
      },
    ],
  },
}
