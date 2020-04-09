export const shuffle = (basis) => {
  const array = [...basis]
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const distribute = (users, items) => {
  const itemsShuffled = shuffle(items)
  let turn = 0
  return itemsShuffled.reduce((acc, country) => {
    turn = (turn + 1) % users.length
    return {
      ...acc,
      [users[turn]]: [
        ...(acc[users[turn]] || []),
        country
      ]
    }
  }, {})
}

export const giveRandom = (users, items) => {
  const countriesShuffled = shuffle(items)
  return users.reduce((acc, user) => {
    acc[user] = countriesShuffled.pop()
    return acc
  }, {})
}

export const removeRandom = (array) => {
  const r = Math.floor(Math.random() * array.length)
  const result = [...array]
  result.splice(r, 1)
  return result
}
