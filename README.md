**Typescript Memoize class method/getter decorator**

[![npm version](https://badge.fury.io/js/%40prismamedia%2Fts-memoize.svg)](https://badge.fury.io/js/%40prismamedia%2Fts-memoize) [![github actions status](https://github.com/prismamedia/ts-memoize/workflows/CI/badge.svg)](https://github.com/prismamedia/ts-memoize/actions) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

It's almost a copy/paste of https://github.com/darrylhodgins/typescript-memoize, without the legacy part

# Usage

```js
import { Memoize } from '@prismamedia/ts-memoize';

class Foo {
  @Memoize()
  public get myCachedGetter(): string {
    return 'OK';
  }

  @Memoize()
  public myCachedMethod(): string {
    return 'OK';
  }

  // If not provided, the "hashFunction" takes the first argument
  @Memoize()
  public myCachedMethod(input: string): string {
    return input;
  }

  // The "hashFunction" can return anything valid as a "Map" key
  @Memoize((a: number, b: number) => [a, b].join('|'))
  public myCachedMethod(a: number, b: number): number {
    return a + b;
  }
}
```
