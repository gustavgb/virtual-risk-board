import React, { Component } from 'react'

import styled from 'styled-components'

import { auth } from 'api'
import Login from 'Login'
import Browse from 'Browse'
import GameContainer from 'Game'
import { Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import CenteredMessage from 'CenteredMessage'

const Root = styled.div`
`

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null,
      loaded: false
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
      user
    } = this.state

    return (
      <Root>
        {!loaded && <CenteredMessage>Loading...</CenteredMessage>}
        {loaded && !user && (
          <Login />
        )}
        {loaded && user && (
          <Switch>
            <Route
              path='/:gameId'
              render={({ match: { params } }) => (
                <GameContainer joinedGame={params.gameId} user={user} />
              )}
            />
            <Route
              path='/'
              render={() => (
                <Browse user={user} />
              )}
            />
          </Switch>
        )}
      </Root>
    )
  }
}

export default connect(
  state => ({
    user: state.user
  })
)(App)
