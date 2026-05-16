/**
 * Vitest setup file — installs a functional localStorage mock for jsdom.
 *
 * jsdom requires an http:// origin for window.localStorage to be a real
 * Storage object. Rather than rely on jsdom config options that differ across
 * versions, we install a Map-backed mock that is fully functional and resets
 * between tests via the test file's beforeEach.
 */

const createStorage = () => {
  let store = new Map()
  return {
    getItem:    (key) => store.has(key) ? store.get(key) : null,
    setItem:    (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear:      () => store.clear(),
    key:        (i) => [...store.keys()][i] ?? null,
    get length () { return store.size },
    [Symbol.iterator]: function* () { yield* store.keys() },
  }
}

const storage = createStorage()

// Make Object.keys(localStorage) work (used in test beforeEach)
Object.defineProperty(storage, 'keys', {
  value: () => [...storage[Symbol.iterator]()],
  enumerable: false,
})

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})

// Patch Object.keys support — vitest's beforeEach uses it
const original = Object.keys.bind(Object)
Object.keys = function (obj) {
  if (obj === storage) {
    return [...storage[Symbol.iterator]()]
  }
  return original(obj)
}
