import shortid from 'shortid'

const idChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
const charsList = idChars.split('')

shortid.characters(idChars)

export const fromString = (str) =>
  str.split('').filter(letter => charsList.indexOf(letter) > -1).join('')

export const generateId = () => shortid.generate()
