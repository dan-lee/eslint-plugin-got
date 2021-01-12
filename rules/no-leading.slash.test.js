const { RuleTester } = require('eslint')
const rule = require('./no-leading-slash')

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
})

ruleTester.run('no-leading-slash', rule, {
  valid: [
    {
      code: `
      import unicornApi from '../../UnicornApi'

      unicornApi('http://example.com')
      unicornApi.get('http://example.com')
      unicornApi.get('correct')
      unicornApi.post('correct')
      unicornApi.put('correct')
      unicornApi.patch('correct')
      unicornApi.delete('correct')
      `,
      options: [{ imports: ['.+/UnicornApi$'] }],
    },
    {
      code: `
      import ky from 'ky'
      const id = 1234
      ky(\`/user/\${id}\`)
      `,
    },
  ],
  invalid: [
    {
      code: `
      import got from 'got'
      got.get('/test')
      `,
      output: `
      import got from 'got'
      got.get('test')
      `,
      options: [{ imports: ['^got$'] }],
      errors: 1,
    },
    {
      code: `
      import api from 'api'
      api('/wrong')
      api.get('/wrong')
      api.post('/wrong')
      api.put('/wrong')
      api.patch('/wrong')
      api.delete('/wrong')
      `,
      output: `
      import api from 'api'
      api('wrong')
      api.get('wrong')
      api.post('wrong')
      api.put('wrong')
      api.patch('wrong')
      api.delete('wrong')
      `,
      options: [{ imports: ['^api'] }],
      errors: 6,
    },
    {
      code: `
      import api from 'api'
      api(\`/user/\${id}\`)
      api.get(\`/user/\${id}\`)
      api.post(\`/user/\${id}\`)
      api.put(\`/user/\${id}\`)
      api.patch(\`/user/\${id}\`)
      api.delete(\`/user/\${id}\`)
      `,
      output: `
      import api from 'api'
      api(\`user/\${id}\`)
      api.get(\`user/\${id}\`)
      api.post(\`user/\${id}\`)
      api.put(\`user/\${id}\`)
      api.patch(\`user/\${id}\`)
      api.delete(\`user/\${id}\`)
      `,
      options: [{ imports: ['^api$'] }],
      errors: 6,
    },
    {
      code: `
      import api from 'api'
      
      class User {
        static update(data) {
          api.put(\`/user/\${id}\`, { json: data})
        }
      }`,
      output: `
      import api from 'api'
      
      class User {
        static update(data) {
          api.put(\`user/\${id}\`, { json: data})
        }
      }`,
      errors: 1,
      options: [{ imports: ['^api$'] }],
    },
  ],
})
