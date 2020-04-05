const legalChars = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')

export const fromString = (str) =>
  str.split('').filter(letter => legalChars.indexOf(letter) > -1).join('')
