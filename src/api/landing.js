import { database } from 'api'

export const saveMission = (gameId, missionIndex, text) => {
  return database.ref(`games/${gameId}/missions`).transaction(missions => {
    if (!missions) {
      missions = []
    }

    missions[missionIndex] = text

    return missions
  })
}

export const addMission = (gameId, text) => {
  return database.ref(`games/${gameId}/missions`).transaction(missions => {
    if (!missions) {
      missions = []
    }

    missions.push(text)

    return missions
  })
}

export const deleteMission = (gameId, missionIndex) => {
  return database.ref(`games/${gameId}/missions`).transaction(missions => {
    if (!missions) {
      missions = []
    }

    missions.splice(missionIndex, 1)

    return missions
  })
}
