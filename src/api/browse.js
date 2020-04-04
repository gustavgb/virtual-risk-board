import { firestore } from 'api'
import { collectionData } from 'rxfire/firestore'
import { map } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { countries } from 'countries'

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

export const streamGames = (id) => {
  const ref1 = firestore.collection('games').where('members', 'array-contains', id)
  const ref2 = firestore.collection('games').where('creator', '==', id)

  return combineLatest(
    collectionData(ref1, 'id'),
    collectionData(ref2, 'id')
  )
    .pipe(
      map(([one, two]) => [...one, ...two.filter(a => !one.find(b => b.id === a.id))]),
      map(games => games.sort((a, b) => {
        if (a.creationDate.seconds > b.creationDate.seconds) {
          return -1
        } else if (a.creationDate.seconds < b.creationDate.seconds) {
          return 1
        }
        return 0
      }))
    )
}

export const createGame = (user) => {
  return new Promise((resolve, reject) => {
    const title = window.prompt('Skriv spillets titel')

    if (!title) {
      reject(new Error('No title written'))
    }

    firestore.collection('games').add({
      title,
      creationDate: new Date(),
      creator: user.email,
      members: [user.email],
      countries: countries.map(country => ({
        name: country.name,
        troops: []
      })),
      events: []
    })
  })
}

export const joinGame = (user, gameId) => {
  firestore.runTransaction(transaction => {
    const ref = firestore.collection('hands').doc(gameId + user.email)
    return transaction.get(ref).then(doc => {
      if (!doc.exists) {
        transaction.set(ref, {
          cards: [],
          player: user.email,
          game: gameId
        })
      }
    })
  })
}

export const deleteGame = (gameId) => {
  if (window.confirm('Er du sikker? Det kan ikke laves om.')) {
    return firestore.collection('games').doc(gameId).delete()
  }
}

export const changeTitle = (gameId) => {
  return new Promise((resolve, reject) => {
    const title = window.prompt('Skriv en ny titel')

    try {
      if (!title) {
        throw new Error('No title written')
      }

      const ref = firestore.collection('games').doc(gameId)

      ref.update({
        title
      })
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

export const addMember = (gameId) => {
  return new Promise((resolve, reject) => {
    const memberEmail = window.prompt('Skriv spillerens email her')

    if (!memberEmail) {
      reject(new Error('No email written'))
    }

    const ref = firestore.collection('games').doc(gameId)

    firestore.runTransaction((transaction) => {
      return transaction.get(ref).then(doc => {
        if (!doc.exists) {
          throw new Error('Document does not exist!')
        }

        const newMembers = [
          ...doc.data().members,
          memberEmail
        ]

        transaction.update(ref, {
          members: newMembers
        })
      })
    })
      .then(resolve)
      .catch(reject)
  })
}

export const removeMember = (gameId, memberEmail) => {
  const ref = firestore.collection('games').doc(gameId)

  return firestore.runTransaction((transaction) => {
    return transaction.get(ref).then(doc => {
      if (!doc.exists) {
        throw new Error('Document does not exist!')
      }

      const newMembers = doc.data().members.filter(member => member !== memberEmail)

      transaction.update(ref, {
        members: newMembers
      })
    })
  })
}

export const startGame = (gameId) => {
  const gameRef = firestore.collection('games').doc(gameId)
  const boardRef = firestore.collection('boards').doc(gameId)

  return firestore.runTransaction(transaction => {
    return transaction.get(gameRef).then(doc => {
      if (!doc.exists) {
        throw new Error('Document does not exist')
      }

      const game = doc.data()

      if (game.started) {
        throw new Error('Game already started')
      }

      const countryFlatList = shuffle(countries.map(country => country.name))
      const countryShares = countryFlatList.reduce((acc, country) => {
        const turn = acc.turn
        return {
          ...acc,
          turn: (turn + 1) % game.members.length,
          [country]: game.members[turn]
        }
      }, {
        turn: 0
      })
      const hands = game.members.map(member => ({
        player: member,
        game: gameId,
        id: gameId + member
      }))

      transaction.update(gameRef, {
        started: true
      })

      transaction.set(boardRef, {
        countries: countries.map(country => ({
          name: country.name,
          troops: {
            [countryShares[country.name]]: 1
          }
        })),
        hands,
        events: []
      })

      hands.forEach(hand => {
        const handRef = firestore.collection('hands').doc(hand.id)
        transaction.set(handRef, {
          player: hand.player,
          game: hand.game,
          cards: []
        })
      })
    })
  })
}
