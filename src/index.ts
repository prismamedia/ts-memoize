export const doNotCache = Symbol('Memoize: do not cache');
export const cacheProperty = Symbol('Memoize: cache property');

/**
 * The "Memoize" decorator is used to avoid multiple computations for multiple calls of the same method or getter
 *
 * @param hashFunction Given the same arguments than the decorated method, it has to compute the cache key
 */
export function Memoize(hashFunction?: (...args: any) => any): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (typeof descriptor.value === 'function') {
      if (!hashFunction) {
        if (descriptor.value.length > 1) {
          throw TypeError(
            `${target.constructor.name}.${descriptor.value.name}'s "@Memoize()" decorator needs a "hashFunction" to compute a cache key`,
          );
        } else if (descriptor.value.length === 1) {
          hashFunction = (...args: any) => args[0];
        }
      }

      const originalFunction = descriptor.value!;

      descriptor.value = (
        hashFunction
          ? function (...args: any[]) {
              let globalCache: Map<string | symbol, Map<any, any>> | undefined =
                this[cacheProperty];

              if (!globalCache) {
                Object.defineProperty(this, cacheProperty, {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: (globalCache = new Map()),
                });
              }

              let cache = globalCache.get(propertyKey);

              if (!cache) {
                globalCache.set(propertyKey, (cache = new Map()));
              }

              const key = hashFunction!.apply(this, args);

              if (key === doNotCache) {
                return originalFunction.apply(this, args);
              }

              let value;

              if (!cache.has(key)) {
                cache.set(key, (value = originalFunction.apply(this, args)));
              } else {
                value = cache.get(key);
              }

              return value;
            }
          : function () {
              const value = originalFunction.apply(this);

              Object.defineProperty(this, propertyKey, {
                configurable: true,
                enumerable: false,
                writable: false,
                value: () => value,
              });

              return value;
            }
      ) as any;
    } else if (typeof descriptor.get === 'function') {
      const originalFunction = descriptor.get!;

      descriptor.get = function () {
        const value = originalFunction.apply(this);

        Object.defineProperty(this, propertyKey, {
          configurable: true,
          enumerable: false,
          writable: false,
          value,
        });

        return value;
      };
    } else {
      throw TypeError(
        `"@Memoize()" can be used only for method and getter: it has been used on ${target}.${String(
          propertyKey,
        )}`,
      );
    }
  };
}
