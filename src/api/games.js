import { firestore } from 'api'
import { collectionData } from 'rxfire/firestore'

export const streamGames = (id) => {
  const ref = firestore.collection('games').where('members', 'array-contains', id)

  return collectionData(ref, 'id')
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
