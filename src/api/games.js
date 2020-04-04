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
  ).pipe(map(([one, two]) => [...one, ...two.filter(a => !one.find(b => b.id === a.id))]))
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
      started: false
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

    if (!title) {
      reject(new Error('No title written'))
    }

    const ref = firestore.collection('games').doc(gameId)

    ref.update({
      title
    })
      .then(resolve)
      .catch(reject)
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

      // transaction.update(gameRef, {
      //   started: true
      // })

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

      transaction.set(boardRef, {
        countries: countries.map(country => ({
          name: country.name,
          troops: {
            [countryShares[country.name]]: 1
          }
        }))
      })
    })
  })
}
