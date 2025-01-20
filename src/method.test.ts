import { describe, it } from 'node:test';
import { MemoizeMethod, doNotCache } from './method.js';

describe('Method', () => {
  it('works without decorator, for reference', (t) => {
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

    t.assert.equal(foo.callCount, 0);
    t.assert.equal(bar.callCount, 0);

    t.assert.equal(foo.testedMethod(), 'OK');
    t.assert.equal(foo.callCount, 1);
    t.assert.equal(bar.callCount, 0);

    t.assert.equal(foo.testedMethod(), 'OK');
    t.assert.equal(foo.callCount, 2);
    t.assert.equal(bar.callCount, 0);

    t.assert.equal(bar.testedMethod(), 'OK');
    t.assert.equal(foo.callCount, 2);
    t.assert.equal(bar.callCount, 1);

    t.assert.equal(bar.testedMethod(), 'OK');
    t.assert.equal(foo.callCount, 2);
    t.assert.equal(bar.callCount, 2);
  });

  it('works with decorator overriding decorated method', (t) => {
    abstract class Foo {
      public aCallCount: number = 0;

      @MemoizeMethod()
      public testedMethodA(): string {
        this.aCallCount++;

        return 'A';
      }
    }

    class Bar extends Foo {
      @MemoizeMethod()
      public override testedMethodA(): string {
        return super.testedMethodA();
      }
    }

    const barA = new Bar();
    t.assert.equal(barA.aCallCount, 0);

    barA.testedMethodA();
    t.assert.equal(barA.aCallCount, 1);

    barA.testedMethodA();
    t.assert.equal(barA.aCallCount, 1);
  });

  it('works with decorator without arguments', (t) => {
    abstract class Foo {
      public aCallCount: number = 0;

      @MemoizeMethod()
      public testedMethodA(): string {
        this.aCallCount++;

        return 'A';
      }
    }

    class Bar extends Foo {
      public bCallCount: number = 0;

      @MemoizeMethod()
      public override testedMethodA(): string {
        return super.testedMethodA();
      }

      @MemoizeMethod()
      public testedMethodB(): string {
        this.bCallCount++;

        return 'B';
      }
    }

    const barA = new Bar();
    t.assert.equal(barA.aCallCount, 0);
    t.assert.equal(barA.bCallCount, 0);

    const barB = new Bar();
    t.assert.equal(barB.aCallCount, 0);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barA.testedMethodA(), 'A');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 0);
    t.assert.equal(barB.aCallCount, 0);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barA.testedMethodA(), 'A');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 0);
    t.assert.equal(barB.aCallCount, 0);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barB.testedMethodA(), 'A');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 0);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barB.testedMethodA(), 'A');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 0);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barA.testedMethodB(), 'B');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 1);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barA.testedMethodB(), 'B');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 1);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 0);

    t.assert.equal(barB.testedMethodB(), 'B');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 1);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 1);

    t.assert.equal(barB.testedMethodB(), 'B');
    t.assert.equal(barA.aCallCount, 1);
    t.assert.equal(barA.bCallCount, 1);
    t.assert.equal(barB.aCallCount, 1);
    t.assert.equal(barB.bCallCount, 1);
  });

  it('works with decorator with arguments', (t) => {
    class Foo {
      public callCount: number = 0;

      @MemoizeMethod((a: number, b: number) => [a, b].join(','))
      public testedMethod(a: number, b: number): number {
        this.callCount++;

        return a + b;
      }
    }

    class Bar extends Foo {
      public bCallCount: number = 0;

      @MemoizeMethod((a: number, b: number) => [a, b].join(','))
      public override testedMethod(a: number, b: number): number {
        return super.testedMethod(a, b);
      }
    }

    const instanceA = new Bar();
    t.assert.equal(instanceA.callCount, 0);

    const instanceB = new Bar();
    t.assert.equal(instanceB.callCount, 0);

    t.assert.equal(instanceA.testedMethod(1, 2), 3);
    t.assert.equal(instanceA.callCount, 1);
    t.assert.equal(instanceB.callCount, 0);

    // Same args
    t.assert.equal(instanceA.testedMethod(1, 2), 3);
    t.assert.equal(instanceA.callCount, 1);
    t.assert.equal(instanceB.callCount, 0);

    // Same args on another instance
    t.assert.equal(instanceB.testedMethod(1, 2), 3);
    t.assert.equal(instanceB.callCount, 1);
    t.assert.equal(instanceB.callCount, 1);

    // Different args
    t.assert.equal(instanceA.testedMethod(2, 3), 5);
    t.assert.equal(instanceA.callCount, 2);
    t.assert.equal(instanceB.callCount, 1);
  });

  it('works with exactly 1 argument without a "hashFunction"', (t) => {
    class Foo {
      public callCount: number = 0;

      @MemoizeMethod()
      public testedMethod(a?: number): number {
        this.callCount++;

        return a || 0;
      }
    }

    const instance = new Foo();
    t.assert.equal(instance.callCount, 0);

    t.assert.equal(instance.testedMethod(), 0);
    t.assert.equal(instance.callCount, 1);

    t.assert.equal(instance.testedMethod(), 0);
    t.assert.equal(instance.callCount, 1);

    t.assert.equal(instance.testedMethod(1), 1);
    t.assert.equal(instance.callCount, 2);
  });

  it('fails with more than 1 argument without a proper "hashFunction"', (t) => {
    t.assert.throws(() => {
      class Foo {
        @MemoizeMethod()
        public testedMethod(a?: number, b?: number): number {
          return (a || 0) + (b || 0);
        }
      }
    }, `"Foo.testedMethod's "@Memoize()" decorator needs a "hashFunction" to compute a cache key"`);
  });

  it('is able to not memoize', (t) => {
    class Foo {
      public callCount: number = 0;

      @MemoizeMethod(() => doNotCache)
      public increment(): number {
        return ++this.callCount;
      }
    }

    const foo = new Foo();
    t.assert.equal(foo.callCount, 0);

    foo.increment();
    t.assert.equal(foo.callCount, 1);

    foo.increment();
    t.assert.equal(foo.callCount, 2);
  });
});
