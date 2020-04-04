import React, { Component } from 'react'

import styled from 'styled-components'

import { auth } from 'api'
import Login from 'Login'
import Browse from 'Browse'
import Board from 'Board'

const Root = styled.div`
`

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null,
      loaded: false,
      joinedGame: null
    }
  }

  componentDidMount () {
    const self = this

    auth.onAuthStateChanged(function (user) {
      self.setState({
        user,
        loaded: true
      })
    })
  }

  render () {
    const {
      loaded,
      user,
      joinedGame
    } = this.state

    return (
      <Root>
        {!loaded && 'Loading...'}
        {loaded && !user && (
          <Login />
        )}
        {loaded && user && !joinedGame && (
          <Browse user={user} onJoinGame={(game) => this.setState({ joinedGame: game })} />
        )}
        {loaded && user && joinedGame && <Board joinedGame={joinedGame} user={user} />}
      </Root>
    )
  }
}

export default App
