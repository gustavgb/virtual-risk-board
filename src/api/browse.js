import { database } from 'api'
import { list } from 'rxfire/database'
import { map } from 'rxjs/operators'
import { countries } from 'constants/countries'
import { v4 as uuid } from 'uuid'

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

export const streamMyGames = (id) => {
  return list(database.ref('games').orderByChild('creator').equalTo(id))
    .pipe(
      map(games => {
        const result = []
        games.forEach(game => result.push(game.snapshot.val()))
        return result
      })
    )
}

export const createGame = (user) => {
  const title = window.prompt('Skriv spillets titel')

  if (!title) {
    return Promise.resolve()
  }

  const id = uuid()

  database.ref(`games/${id}`).set({
    id,
    title,
    creator: user.uid,
    colors: {}
  })
  database.ref(`boards/${id}`).set({
    countries: countries.map(country => ({
      name: country.name,
      armies: []
    })),
    events: []
  })
}

export const joinGame = (user, gameId) => {
  return Promise.all([
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

export const deleteGame = (game) => {
  if (window.confirm('Er du sikker? Det kan ikke laves om.')) {
    return Promise.all([
      database.ref(`games/${game.id}`).remove(),
      database.ref(`boards/${game.id}`).remove(),
      ...(game.members || []).map(member => database.ref(`hands/${game.id}${member}`).remove())
    ])
  }
}

export const changeTitle = (gameId) => {
  const title = window.prompt('Skriv en ny titel')

  if (!title) {
    return Promise.resolve()
  }

  return database.ref(`games/${gameId}`).update({
    title
  })
}
