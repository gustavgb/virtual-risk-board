import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/functions'

const app = window.firebase = firebase.initializeApp({
  apiKey: 'AIzaSyBLbhRbywY8XTdUXJUvhWBu3ERxOVbFrtE',
  authDomain: 'risk-online-db16c.firebaseapp.com',
  databaseURL: 'https://risk-online-db16c.firebaseio.com',
  projectId: 'risk-online-db16c',
  storageBucket: 'risk-online-db16c.appspot.com',
  messagingSenderId: '761116577753',
  appId: '1:761116577753:web:6dbb747d45eb28c3f553c8',
  measurementId: 'G-JCJPLG5L17'
})

export const auth = app.auth()
export const database = app.database()
export const getServerTime = app.functions('europe-west1').httpsCallable('getServerTime')

export default app
