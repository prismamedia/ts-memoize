import assert from 'node:assert';

/**
 * The "MemoizeGetter" decorator is used to avoid multiple computations for multiple calls of the same getter
 */
export function MemoizeGetter<This, TReturn>(
  target: (this: This) => TReturn,
  context: ClassGetterDecoratorContext<This, TReturn>,
) {
  assert.equal(context.kind, 'getter');

  return function (this: This) {
    const value = target.apply(this);

    Object.defineProperty(this, context.name, {
      configurable: true,
      value,
    });

    return value;
  };
}
