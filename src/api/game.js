import { database } from 'api'
import { object } from 'rxfire/database'
import { map } from 'rxjs/operators'
import { fromString } from 'makeId'

const mapGame = (game) => ({
  colors: {},
  members: [],
  events: [],
  creator: null,
  title: null,
  id: null,
  initialCountries: [],
  ...game,
  displayedCards: {
    list: [],
    ...(game.displayedCards || {})
  },
  countries: (game.countries || []).map(country => ({
    troops: {},
    ...country,
    troopsList: Object.keys(country.troops || {}).map(key => ({
      ...country.troops[key]
    }))
  }))
})

const mapHand = (hand) => ({
  cards: [],
  player: null,
  game: null,
  id: null,
  ...hand
})

export const streamGame = (user, gameId) => {
  const gameRef = database.ref(`games/${gameId}`)

  return object(gameRef).pipe(map(game => mapGame({ ...game.snapshot.val(), id: gameId, timestamp: Date.now() })))
}

export const streamHand = (user, gameId) => {
  const handRef = database.ref(`hands/${gameId}${user.uid}`)

  return object(handRef).pipe(map(hand => mapHand({ ...hand.snapshot.val(), id: gameId + user.uid })))
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

export const placeArmy = (gameId, userId, country) => {
  return database.ref(`games/${gameId}`).transaction(game => {
    if (game) {
      if (!game.colors) {
        game.colors = {}
      }

      const color = game.colors[userId]

      if (color) {
        game.countries = game.countries.map(c => {
          if (country === c.name) {
            const troops = c.troops || {}
            const key = fromString(color)
            const prevAmount = troops[key] ? troops[key].amount : 0

            return {
              ...c,
              troops: {
                ...troops,
                [key]: {
                  color,
                  amount: prevAmount + 1
                }
              }
            }
          }

          return c
        })
      }
    }
    return game
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
          userId
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
