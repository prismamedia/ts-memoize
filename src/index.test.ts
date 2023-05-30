import { describe, expect, it } from '@jest/globals';
import { Memoize, doNotCache } from './index.js';

describe('Memoize', () => {
  it('works for class method without decorator, for reference', () => {
    class Foo {
      public callCount: number = 0;

      public testedMethod(): string {
        this.callCount++;

        return 'OK';
      }
    }

    class Bar extends Foo {
      public override testedMethod(): string {
        this.callCount++;

        return 'OK';
      }
    }

    const foo = new Foo();
    const bar = new Bar();

    expect(foo.callCount).toBe(0);
    expect(bar.callCount).toBe(0);

    expect(foo.testedMethod()).toEqual('OK');
    expect(foo.callCount).toBe(1);
    expect(bar.callCount).toBe(0);

    expect(foo.testedMethod()).toEqual('OK');
    expect(foo.callCount).toBe(2);
    expect(bar.callCount).toBe(0);

    expect(bar.testedMethod()).toEqual('OK');
    expect(foo.callCount).toBe(2);
    expect(bar.callCount).toBe(1);

    expect(bar.testedMethod()).toEqual('OK');
    expect(foo.callCount).toBe(2);
    expect(bar.callCount).toBe(2);
  });

  it('works for class method with decorator overriding decorated method', () => {
    abstract class Foo {
      public aCallCount: number = 0;

      @Memoize()
      public testedMethodA(): string {
        this.aCallCount++;

        return 'A';
      }
    }

    class Bar extends Foo {
      @Memoize()
      public override testedMethodA(): string {
        return super.testedMethodA();
      }
    }

    const barA = new Bar();
    expect(barA.aCallCount).toBe(0);

    barA.testedMethodA();
    expect(barA.aCallCount).toBe(1);

    barA.testedMethodA();
    expect(barA.aCallCount).toBe(1);
  });

  it('works for class method with decorator without arguments', () => {
    abstract class Foo {
      public aCallCount: number = 0;

      @Memoize()
      public testedMethodA(): string {
        this.aCallCount++;

        return 'A';
      }
    }

    class Bar extends Foo {
      public bCallCount: number = 0;

      @Memoize()
      public override testedMethodA(): string {
        return super.testedMethodA();
      }

      @Memoize()
      public testedMethodB(): string {
        this.bCallCount++;

        return 'B';
      }
    }

    const barA = new Bar();
    expect(barA.aCallCount).toBe(0);
    expect(barA.bCallCount).toBe(0);

    const barB = new Bar();
    expect(barB.aCallCount).toBe(0);
    expect(barB.bCallCount).toBe(0);

    expect(barA.testedMethodA()).toEqual('A');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(0);
    expect(barB.aCallCount).toBe(0);
    expect(barB.bCallCount).toBe(0);

    expect(barA.testedMethodA()).toEqual('A');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(0);
    expect(barB.aCallCount).toBe(0);
    expect(barB.bCallCount).toBe(0);

    expect(barB.testedMethodA()).toEqual('A');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(0);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(0);

    expect(barB.testedMethodA()).toEqual('A');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(0);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(0);

    expect(barA.testedMethodB()).toEqual('B');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(1);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(0);

    expect(barA.testedMethodB()).toEqual('B');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(1);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(0);

    expect(barB.testedMethodB()).toEqual('B');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(1);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(1);

    expect(barB.testedMethodB()).toEqual('B');
    expect(barA.aCallCount).toBe(1);
    expect(barA.bCallCount).toBe(1);
    expect(barB.aCallCount).toBe(1);
    expect(barB.bCallCount).toBe(1);
  });

  it('works for class method with decorator with arguments', () => {
    class Foo {
      public callCount: number = 0;

      @Memoize((a: number, b: number) => [a, b].join(','))
      public testedMethod(a: number, b: number): number {
        this.callCount++;

        return a + b;
      }
    }

    class Bar extends Foo {
      public bCallCount: number = 0;

      @Memoize((a: number, b: number) => [a, b].join(','))
      public override testedMethod(a: number, b: number): number {
        return super.testedMethod(a, b);
      }
    }

    const instanceA = new Bar();
    expect(instanceA.callCount).toBe(0);

    const instanceB = new Bar();
    expect(instanceB.callCount).toBe(0);

    expect(instanceA.testedMethod(1, 2)).toEqual(3);
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    // Same args
    expect(instanceA.testedMethod(1, 2)).toEqual(3);
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    // Same args on another instance
    expect(instanceB.testedMethod(1, 2)).toEqual(3);
    expect(instanceB.callCount).toBe(1);
    expect(instanceB.callCount).toBe(1);

    // Different args
    expect(instanceA.testedMethod(2, 3)).toEqual(5);
    expect(instanceA.callCount).toBe(2);
    expect(instanceB.callCount).toBe(1);
  });

  it('works for class method with exactly 1 argument without a "hashFunction"', () => {
    class Foo {
      public callCount: number = 0;

      @Memoize()
      public testedMethod(a?: number): number {
        this.callCount++;

        return a || 0;
      }
    }

    const instance = new Foo();
    expect(instance.callCount).toBe(0);

    expect(instance.testedMethod()).toBe(0);
    expect(instance.callCount).toBe(1);

    expect(instance.testedMethod()).toBe(0);
    expect(instance.callCount).toBe(1);

    expect(instance.testedMethod(1)).toBe(1);
    expect(instance.callCount).toBe(2);
  });

  it('fails for class method with more than 1 argument without a proper "hashFunction"', () => {
    expect(() => {
      class Foo {
        @Memoize()
        public testedMethod(a?: number, b?: number): number {
          return (a || 0) + (b || 0);
        }
      }
    }).toThrowErrorMatchingInlineSnapshot(
      `"Foo.testedMethod's "@Memoize()" decorator needs a "hashFunction" to compute a cache key"`,
    );
  });

  it('works for class getter without decorator, for reference', () => {
    class Foo {
      public callCount: number = 0;

      public get testedGetter(): string {
        this.callCount++;

        return 'OK';
      }
    }

    const instance = new Foo();
    expect(instance.callCount).toBe(0);

    expect(instance.testedGetter).toEqual('OK');
    expect(instance.callCount).toBe(1);

    expect(instance.testedGetter).toEqual('OK');
    expect(instance.callCount).toBe(2);
  });

  it('works for class getter with decorator', () => {
    class Foo {
      public callCount: number = 0;

      @Memoize()
      public get testedGetter(): string {
        this.callCount++;

        return 'OK';
      }
    }

    const instanceA = new Foo();
    expect(instanceA.callCount).toBe(0);

    const instanceB = new Foo();
    expect(instanceB.callCount).toBe(0);

    expect(instanceA.testedGetter).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    expect(instanceA.testedGetter).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    expect(instanceB.testedGetter).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(1);

    expect(instanceB.testedGetter).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(1);
  });

  it('is able to not memoize', () => {
    class Foo {
      public callCount: number = 0;

      @Memoize(() => doNotCache)
      public increment(): number {
        return ++this.callCount;
      }
    }

    const foo = new Foo();
    expect(foo.callCount).toBe(0);

    foo.increment();
    expect(foo.callCount).toBe(1);

    foo.increment();
    expect(foo.callCount).toBe(2);
  });
});
