import { database } from 'api'
import { list } from 'rxfire/database'
import { map } from 'rxjs/operators'
import { countries } from 'constants/countries'
import { v4 as uuid } from 'uuid'

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

export const checkCode = (code) => {
  return new Promise((resolve, reject) => {
    database.ref(`games/${code}`).once('value').then(doc => {
      if (doc.exists()) {
        resolve()
      } else {
        reject(new Error('Koden er ikke gyldig'))
      }
    })
  })
}

export const deleteGame = (game) => {
  if (window.confirm('Er du sikker? Det kan ikke laves om.')) {
    return Promise.all([
      database.ref(`games/${game.id}`).remove(),
      database.ref(`boards/${game.id}`).remove(),
      database.ref(`events/${game.id}`).remove(),
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
