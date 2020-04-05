import { createStore } from 'redux'

const defaultState = {
  user: null
}

const store = createStore(
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
      default:
        return state
    }
  },
  {}
)

export default store
