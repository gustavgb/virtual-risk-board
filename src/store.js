import { createStore } from 'redux'

const defaultState = {
  user: null,
  timeOffset: 0
}

const store = window.store = createStore(
  (state = { ...defaultState }, action) => {
    switch (action.type) {
      case 'LOGIN':
        return {
          ...state,
          user: action.user
        }
      case 'REGISTER':
        return {
          ...state,
          user: action.user
        }
      case 'LOGOUT':
        return {
          ...state,
          user: null
        }
      case 'SET_TIME_OFFSET':
        return {
          ...state,
          timeOffset: action.offset
        }
      default:
        return state
    }
  },
  {}
)

export default store
