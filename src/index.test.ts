import { Memoize } from './index';

describe('Memoize', () => {
  it('works for class method without decorator, for reference', () => {
    class Foo {
      public callCount: number = 0;

      public testedMethod(): string {
        this.callCount++;

        return 'OK';
      }
    }

    const instance = new Foo();
    expect(instance.callCount).toBe(0);

    expect(instance.testedMethod()).toEqual('OK');
    expect(instance.callCount).toBe(1);

    expect(instance.testedMethod()).toEqual('OK');
    expect(instance.callCount).toBe(2);
  });

  it('works for class method with decorator without arguments', () => {
    class Foo {
      public callCount: number = 0;

      @Memoize()
      public testedMethod(): string {
        this.callCount++;

        return 'OK';
      }
    }

    const instanceA = new Foo();
    expect(instanceA.callCount).toBe(0);

    const instanceB = new Foo();
    expect(instanceB.callCount).toBe(0);

    expect(instanceA.testedMethod()).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    expect(instanceA.testedMethod()).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(0);

    expect(instanceB.testedMethod()).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(1);

    expect(instanceB.testedMethod()).toEqual('OK');
    expect(instanceA.callCount).toBe(1);
    expect(instanceB.callCount).toBe(1);
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

    const instanceA = new Foo();
    expect(instanceA.callCount).toBe(0);

    const instanceB = new Foo();
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
      `"Foo.testedMethod's \\"@Memoize()\\" decorator needs a \\"hashFunction\\" to compute a cache key"`,
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
});
