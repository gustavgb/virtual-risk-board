import { firestore } from 'api'
import { doc } from 'rxfire/firestore'
import { map } from 'rxjs/operators'

export const streamGame = (user, gameId) => {
  const gameRef = firestore.collection('games').doc(gameId)

  return doc(gameRef).pipe(map(game => game.data()))
}

export const streamHand = (user, gameId) => {
  const handRef = firestore.collection('hands').doc(gameId + user.email)

  return doc(handRef).pipe(map(hand => hand.data()))
}

export const getUsers = (gameId) => {
  return firestore.collection('games').doc(gameId).get().then(doc => {
    if (!doc.exists) {
      throw new Error('Document does not exist!')
    }

    const usersRef = firestore.collection('users').where('email', 'in', doc.data().members)

    return usersRef.get().then(snapshot => {
      const users = []
      snapshot.forEach(doc => users.push(doc.data()))
      return users
    })
  })
}
