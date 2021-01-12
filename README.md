# eslint-plugin-got

_(for the sake of a better name)_

## Install

```
yarn add -D eslint-plugin-got

# or

npm install -D eslint-plugin-got
```

Add to `.eslintrc.js` or equivalents in plugins/rules section:

```js
module.exports = {
  plugins: ['got'],
  rules: {
    'got/no-leading-slash': ['error', { imports: ['^got$', '^ky$'] }],
  },
}
```

## Disallow leading slashes in requests

`got/no-leading-slash`

If you are using [`got`](https://github.com/sindresorhus/got) or [`ky`](https://github.com/sindresorhus/ky) with the `prefixUrl` option and constantly forget that you mustn't use a leading slash, this rule is for you.

This works for all request libraries with the same API and input restrictions.
So you can use it for `got`, `ky` or any created instances of it. You just need to specify the `imports` option in the configuration.

**This is auto fixable.**

```ts
// Api.ts
import got from 'got'
export default got.extend({ prefixUrl: 'https://cats.com' })
```

```ts
// .eslintrc.js
module.exports = {
  // all imports matching the pattern ".+/Api$" will be considered for linting
  'got/no-leading-slash': ['error', { imports: ['.+/Api$'] }],
}
```

### Pass

```ts
import api from './Api'
api.get('unicorn')
```

### Fail

```ts
import api from './Api'
// The request input should not start with a leading slash. (at 2:8)
api.get('/unicorn')
// -----^

api.get(`/unicorn/${id}`)
// -----^
```

The import call itself and the request method shortcuts will be checked:

```ts
api('request', ...args)
api.get('request', ...args)
api.post('request', ...args)
api.put('request', ...args)
api.patch('request', ...args)
api.head('request', ...args)
api.delete('request', ...args)
```

### Options

#### imports

Type: `array`  
Default: `[]`

To enable the lint rule you can add regex pattern(s) which should match the import source (file or package):

```json
{
  "got/no-leading-slash": ["error", { "imports": [".+/Api$"] }]
}
```

If you also want to prevent leading slashes in the calls of the packages `got`, `ky` and `ky-universal` you could use following config:

```json
{
  "got/no-leading-slash": [
    "error",
    { "imports": ["^got$", "^ky$", "^ky-universal$", ".+/Api$"] }
  ]
}
```

### Reasoning

This rule enforces that every request going through `got`, `ky` or an instance of it with the `prefixUrl` enabled must not start with a leading slash:

> **Note:** Leading slashes in `input` are disallowed when using this option to enforce consistency and avoid confusion. For example, when the prefix URL is `https://example.com/foo` and the input is `/bar`, there's ambiguity whether the resulting URL would become `https://example.com/foo/bar` or `https://example.com/bar`. The latter is used by browsers.

(Source: https://github.com/sindresorhus/got#prefixurl)
