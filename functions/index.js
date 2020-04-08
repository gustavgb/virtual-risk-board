// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')
admin.initializeApp()

exports.getServerTime = functions
  .region('europe-west1')
  .https.onCall((data, context) => {
    return Date.now()
  })
