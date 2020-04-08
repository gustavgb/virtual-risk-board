import { database, getServerTime } from 'api'
import { object } from 'rxfire/database'
import { map } from 'rxjs/operators'
import { fromString } from 'makeId'
import { combineLatest } from 'rxjs'
import { countries } from 'constants/countries'
import store from 'store'

function shuffle (array) {
  var currentIndex = array.length; var temporaryValue; var randomIndex

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

const mapGame = (game) => {
  const timeOffset = store.getState().timeOffset

  return {
    colors: {},
    members: [],
    creator: null,
    title: null,
    id: null,
    initialCountries: [],
    ...game,
    events: (game.events || []).map(event => ({
      ...event,
      timestamp: event.timestamp - timeOffset,
      expire: event.expire - timeOffset
    })),
    displayedCards: {
      list: [],
      ...(game.displayedCards || {})
    },
    countries: (game.countries || []).map(country => ({
      armies: {},
      ...country,
      armiesList: Object.keys(country.armies || {}).map(key => ({
        ...country.armies[key],
        id: key
      }))
    }))
  }
}

const mapHand = (hand) => ({
  cards: [],
  player: null,
  game: null,
  id: null,
  ...hand
})

export const joinGame = (user, gameId) => {
  return Promise.all([
    getServerTime().then(({ data: serverTime }) => store.dispatch({
      type: 'SET_TIME_OFFSET',
      offset: serverTime - Date.now()
    })),
    database.ref(`hands/${gameId}${user.uid}`).transaction(hand => {
      if (!hand) {
        return {
          cards: [],
          player: user.uid,
          game: gameId
        }
      }
      return hand
    }),
    database.ref(`games/${gameId}`).transaction(game => {
      if (game) {
        let changedMembers = false

        if (!game.members) {
          game.members = []
          changedMembers = true
        }

        if (!game.members.find(member => member === user.uid)) {
          game.members.push(user.uid)
          changedMembers = true
        }

        if (changedMembers) {
          const countriesShuffled = shuffle(countries.map(country => country.name))
          let turn = 0
          game.initialCountries = countriesShuffled.reduce((acc, country) => {
            turn = (turn + 1) % game.members.length
            return {
              ...acc,
              [game.members[turn]]: [
                ...(acc[game.members[turn]] || []),
                country
              ]
            }
          }, {})
        }

        if (!game.initialCountries) {
          game.initialCountries = []
        }
      }

      return game
    })
  ])
}

export const streamState = (user, gameId) => {
  const gameRef = database.ref(`games/${gameId}`)
  const boardRef = database.ref(`boards/${gameId}`)
  const handRef = database.ref(`hands/${gameId}${user.uid}`)
  const eventsRef = database.ref(`events/${gameId}`)

  return combineLatest(
    object(gameRef),
    object(boardRef),
    object(handRef),
    object(eventsRef)
  ).pipe(
    map(([game, board, hand, events]) => ({
      game: mapGame({
        ...game.snapshot.val(),
        ...board.snapshot.val(),
        events: events.snapshot.val() || [],
        id: gameId,
        timestamp: Date.now()
      }),
      hand: mapHand({
        ...hand.snapshot.val(),
        id: gameId + user.uid
      })
    }))
  )
}

export const getUsers = (gameId) => {
  return database.ref(`games/${gameId}`).once('value').then(doc => {
    if (!doc.exists) {
      throw new Error('Document does not exist!')
    }

    const game = doc.val()
    return Promise.all(
      (game.members || []).map(
        member => database.ref(`users/${member}`).once('value').then(user => ({ ...user.val(), id: member }))
      )
    )
  })
}

export const setColors = (gameId, colors) => {
  return database.ref(`games/${gameId}`).transaction(game => {
    if (game) {
      if (!game.colors) {
        game.colors = {}
      }

      game.colors = {
        ...game.colors,
        ...colors
      }
    }
    return game
  })
}

export const takeCard = (gameId, userId) => {
  const cardType = Math.floor(Math.random() * 3)

  return database.ref(`hands/${gameId}${userId}`).transaction(hand => {
    if (hand) {
      if (!hand.cards) {
        hand.cards = []
      }

      hand.cards.push(cardType)
    }
    return hand
  })
}

export const placeArmy = (gameId, userId, country, color, amount = 1) => {
  return database.ref(`boards/${gameId}`).transaction(board => {
    if (board && color) {
      board.countries = board.countries.map(c => {
        if (country === c.name) {
          const armies = c.armies || {}
          const key = fromString(color)
          const prevAmount = armies[key] ? armies[key].amount : 0

          return {
            ...c,
            armies: {
              ...armies,
              [key]: {
                color,
                amount: prevAmount + amount
              }
            }
          }
        }

        return c
      })
    }
    return board
  })
}

export const removeArmy = (gameId, userId, country, armyId, amount = 1) => {
  return database.ref(`boards/${gameId}`).transaction(board => {
    if (board) {
      if (armyId) {
        board.countries = board.countries.map(c => {
          if (country === c.name) {
            const armies = c.armies || {}
            const prevAmount = armies[armyId] ? armies[armyId].amount : 0

            if (prevAmount - amount > 0) {
              return {
                ...c,
                armies: {
                  ...armies,
                  [armyId]: {
                    ...armies[armyId],
                    amount: prevAmount - amount
                  }
                }
              }
            } else {
              return {
                ...c,
                armies: {
                  ...armies,
                  [armyId]: null
                }
              }
            }
          }

          return c
        })
      }
    }
    return board
  })
}

export const displayCard = (gameId, userId, cardType, cardIndex) => {
  return database.ref(`games/${gameId}`).transaction(game => {
    if (game) {
      if (!game.displayedCards) {
        game.displayedCards = {
          userId
        }
      }

      if (game.displayedCards.userId === userId) {
        if (!game.displayedCards.list) {
          game.displayedCards.list = []
        }
        game.displayedCards.list.push({
          cardType,
          cardIndex
        })
      }
    }

    return game
  })
}

export const removeDisplayedCard = (gameId, userId, cardIndex) => {
  return database.ref(`games/${gameId}`).transaction(game => {
    if (game) {
      if (!game.displayedCards) {
        game.displayedCards = {
          userId,
          list: []
        }
      }

      if (game.displayedCards.userId === userId) {
        if (!game.displayedCards.list) {
          game.displayedCards.list = []
        }
        game.displayedCards.list = game.displayedCards.list.filter(
          card => card.cardIndex !== cardIndex
        )
      }

      if (game.displayedCards.list.length === 0) {
        game.displayedCards = null
      }
    }

    return game
  })
}

export const discardDisplayedCards = (gameId, userId, displayedCards) => {
  return database.ref(`hands/${gameId}${userId}`).transaction(hand => {
    if (hand) {
      if (!hand.cards) {
        hand.cards = []
      }

      hand.cards = hand.cards.filter((card, index) => !displayedCards.find(c => c.cardIndex === index))
    }

    return hand
  })
    .then(() => database.ref(`games/${gameId}`).transaction(game => {
      if (game) {
        if (!game.displayedCards) {
          game.displayedCards = {
            list: []
          }
        }

        if (!game.displayedCards.list) {
          game.displayedCards.list = []
        }

        game.displayedCards.list = game.displayedCards.list.filter(card => !displayedCards.find(c => c.cardIndex === card.cardIndex))

        if (game.displayedCards.list.length === 0) {
          game.displayedCards = null
        }
      }

      return game
    }))
}

export const pushToLog = (gameId, userId, code, content) => {
  const timeOffset = store.getState().timeOffset

  database.ref(`events/${gameId}`).transaction(events => {
    if (!events) {
      events = []
    }

    const now = Date.now() + timeOffset

    events = events.filter(event => event.expire > now)

    events.push({
      timestamp: now,
      expire: now + 7500,
      content,
      code,
      userId
    })

    return events
  })
}
