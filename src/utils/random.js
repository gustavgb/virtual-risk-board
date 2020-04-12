export const getRandom = (min = 0, max = 1) =>
  (window.crypto.getRandomValues(new Uint32Array(1)) / 4294967295) * max + min
