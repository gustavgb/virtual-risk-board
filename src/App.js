import React, { Component } from 'react'

import styled from 'styled-components'

import { auth } from 'api'
import Login from 'Login'
import Browse from 'Browse'
import Board from 'Board'
import { joinGame } from 'api/browse'

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

  onJoinGame (gameId) {
    const { user } = this.state

    joinGame(user, gameId)

    this.setState({ joinedGame: gameId })
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
          <Browse user={user} onJoinGame={this.onJoinGame.bind(this)} />
        )}
        {loaded && user && joinedGame && <Board joinedGame={joinedGame} user={user} />}
      </Root>
    )
  }
}

export default App
