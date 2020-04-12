import { database, getServerTime } from 'api'
import { object } from 'rxfire/database'
import { map, switchMap } from 'rxjs/operators'
import { fromString } from 'utils/makeId'
import { combineLatest } from 'rxjs'
import { countries, countriesDir } from 'constants/countries'
import store from 'store'
import { distribute, removeRandom, shuffle } from 'utils/cards'
import { getRandom } from 'utils/random'

const mapGame = (game) => {
  const timeOffset = store.getState().timeOffset

  return {
    colors: {},
    members: [],
    creator: null,
    title: null,
    id: null,
    initialCountries: [],
    status: {},
    missions: [],
    dice: {},
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
  mission: '',
  ...hand
})

export const startGame = (gameId) => {
  const memberMissions = {}
  const members = []

  database.ref(`games/${gameId}`).transaction(game => {
    if (game) {
      if (!game.members) {
        game.members = []
      }

      if (!game.missions) {
        game.missions = []
      }

      game.members = shuffle(game.members)

      if (game.missions.length > game.members.length) {
        game.missions = shuffle(game.missions)

        game.members.forEach(member => {
          memberMissions[member] = game.missions.pop()
          members.push(member)
        })

        game.initialCountries = distribute(game.members, countries.map(country => country.name))
      } else {
        throw new Error('Not enough missions')
      }
    }

    return game
  })
    .then(() => Promise.all(
      members.map(member => database.ref(`hands/${gameId}/${member}`).transaction(hand => {
        if (!hand) {
          return {
            cards: [],
            player: member,
            game: gameId,
            mission: memberMissions[member]
          }
        }
        return hand
      }))
    ))
    .then(() => database.ref(`games/${gameId}`).transaction(game => {
      if (game) {
        game.started = true
      }
      return game
    }))
}

export const joinGame = (user, gameId) => {
  return getServerTime()
    .then(({ data: serverTime }) => store.dispatch({
      type: 'SET_TIME_OFFSET',
      offset: serverTime - Date.now()
    }))
    .then(() => database.ref(`games/${gameId}`).transaction(game => {
      if (game && !game.started) {
        if (!game.members) {
          game.members = []
        }

        if (!game.members.find(member => member === user.uid)) {
          game.members.push(user.uid)
        }
      }

      return game
    }))
}

export const streamState = ({ uid }, gameId) => {
  return combineLatest(
    object(database.ref(`games/${gameId}`)),
    object(database.ref(`boards/${gameId}/events`)),
    object(database.ref(`boards/${gameId}/display`)),
    object(database.ref(`boards/${gameId}/colors`)),
    combineLatest(
      ...Object.keys(countriesDir).map(key => (
        object(database.ref(`boards/${gameId}/countries/${key}`))
      ))
    ).pipe(map(countries => countries.map(country => ({
      ...country.snapshot.val(),
      id: country.snapshot.key
    })))),
    object(database.ref(`games/${gameId}/members`)).pipe(
      switchMap(members => combineLatest(
        ...(members.snapshot.exists() ? members.snapshot.val() : [])
          .map(member => object(database.ref(`users/${member}`)))
      )),
      map(users => users.map(user => ({ ...user.snapshot.val(), id: user.snapshot.key })))
    )
  ).pipe(
    map(([game, events, display, colors, countries, users]) => game.snapshot.exists() ? ({
      game: mapGame({
        ...game.snapshot.val(),
        display: display.snapshot.val() || {},
        colors: colors.snapshot.val() || {},
        events: events.snapshot.val() || [],
        countries,
        id: gameId,
        timestamp: Date.now()
      }),
      user: {
        ...users.find(u => u.id === uid),
        uid
      },
      users
    }) : null)
  )
}

export const streamHand = ({ uid }, gameId) => {
  const handRef = database.ref(`hands/${gameId}/${uid}`)

  return object(handRef).pipe(
    map(hand => mapHand({
      ...hand.snapshot.val(),
      id: gameId + uid
    }))
  )
}

export const setColors = (gameId, uid, color) => {
  return database.ref(`boards/${gameId}/colors`).transaction(colors => {
    if (!colors) {
      colors = {}
    }

    colors = {
      ...colors,
      [uid]: color
    }
    return colors
  })
}

export const takeCard = (gameId, userId) => {
  const cardType = Math.floor(getRandom(0, 3))

  return database.ref(`hands/${gameId}/${userId}`).transaction(hand => {
    if (hand) {
      if (!hand.cards) {
        hand.cards = []
      }

      hand.cards.push(cardType)
    }
    return hand
  })
}

export const placeArmy = (gameId, userId, countryKey, color, amount = 1) => {
  return database.ref(`boards/${gameId}/countries/${countryKey}`).transaction(country => {
    if (country && color) {
      const armies = country.armies || {}
      const key = fromString(color)
      const prevAmount = armies[key] ? armies[key].amount : 0

      country.armies = {
        ...armies,
        [key]: {
          color,
          amount: prevAmount + amount
        }
      }
    }
    return country
  })
}

export const removeArmy = (gameId, userId, countryKey, armyId, amount = 1) => {
  return database.ref(`boards/${gameId}/countries/${countryKey}`).transaction(country => {
    if (country && armyId) {
      if (armyId) {
        const armies = country.armies || {}
        const prevAmount = armies[armyId] ? armies[armyId].amount : 0

        if (prevAmount - amount > 0) {
          country.armies = {
            ...armies,
            [armyId]: {
              ...armies[armyId],
              amount: prevAmount - amount
            }
          }
        } else {
          country.armies = {
            ...armies,
            [armyId]: null
          }
        }
      }
    }
    return country
  })
}

export const displayCard = (gameId, userId, cardType, cardIndex) => {
  return database.ref(`boards/${gameId}/display/cards`).transaction(cards => {
    if (!cards) {
      cards = {}
    }

    if (!cards[userId]) {
      cards[userId] = []
    }

    cards[userId].push({
      cardType,
      cardIndex
    })

    return cards
  })
}

export const removeDisplayedCard = (gameId, userId, cardIndex) => {
  return database.ref(`boards/${gameId}/display/cards`).transaction(cards => {
    if (cards && cards[userId]) {
      cards[userId] = cards[userId].filter(
        card => card.cardIndex !== cardIndex
      )
    }

    return cards
  })
}

export const discardDisplayedCards = (gameId, userId, displayedCards) => {
  return database.ref(`hands/${gameId}/${userId}`).transaction(hand => {
    if (hand) {
      if (!hand.cards) {
        hand.cards = []
      }

      hand.cards = hand.cards.filter((card, index) => !displayedCards.find(c => c.cardIndex === index))
    }

    return hand
  })
    .then(() => database.ref(`boards/${gameId}/display/cards`).transaction(cards => {
      if (cards && cards[userId]) {
        cards[userId] = null
      }

      return cards
    }))
}

export const throwRandomCard = (gameId, userId) => {
  const out = {}
  return database.ref(`hands/${gameId}/${userId}`).transaction(hand => {
    if (hand) {
      if (!hand.cards) {
        hand.cards = []
      }

      hand.cards = removeRandom(hand.cards, out)
    }

    return hand
  })
    .then(database.ref(`boards/${gameId}/display/cards`).transaction(cards => {
      if (cards && cards[userId]) {
        cards[userId] = cards[userId].filter(card => card.cardIndex !== out.index)
      }

      return cards
    }))
}

export const pushToLog = (gameId, userId, code, content) => {
  const timeOffset = store.getState().timeOffset

  database.ref(`boards/${gameId}/events`).transaction(events => {
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

export const connectToPresence = (gameId, uid) => {
  const userStatusRef = database.ref(`users/${uid}/currentGame`)

  database.ref('.info/connected').on('value', function (snapshot) {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() === false) {
      return
    };

    // If we are currently connected, then use the 'onDisconnect()'
    // method to add a set which will only trigger once this
    // client has disconnected by closing the app,
    // losing internet, or any other means.
    userStatusRef.onDisconnect().set(null).then(function () {
      // The promise returned from .onDisconnect().set() will
      // resolve as soon as the server acknowledges the onDisconnect()
      // request, NOT once we've actually disconnected:
      // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

      // We can now safely set ourselves as 'online' knowing that the
      // server will mark us as offline once we lose connection.
      userStatusRef.set(gameId)
    })
  })

  return () => {
    userStatusRef.onDisconnect().cancel()
    userStatusRef.set(null)
  }
}

export const rollDice = (gameId, userId, removeOld) => {
  return database.ref(`boards/${gameId}/display/dice`).transaction(dice => {
    if (!dice) {
      dice = {}
    }
    if (!dice[userId] || removeOld) {
      dice[userId] = []
    }

    dice[userId].push(Math.floor(getRandom(1, 6)))
    dice[userId].sort((a, b) => {
      if (a > b) {
        return -1
      } else if (a < b) {
        return 1
      }
      return 0
    })
    return dice
  })
}

export const removeDice = (gameId, userId) => {
  return database.ref(`boards/${gameId}/display/dice`).transaction(dice => {
    if (dice && dice[userId]) {
      dice[userId] = null
    }
    return dice
  })
}
