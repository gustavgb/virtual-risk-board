import React, { Component } from 'react'
import { streamGames, addMember, removeMember, createGame, deleteGame, changeTitle, startGame } from 'api/games'
import styled from 'styled-components'
import dateFormat from 'dateformat'
import { auth } from 'api'

const Root = styled.div`
  width: 50rem;
  margin: 0 auto;
  padding: 10rem 2rem;
  background-color: #ddd;
`

const Top = styled.div`
  background-color: #aaa;
  padding: 2rem;
  margin-bottom: 2rem;

  &::after {
    clear: both;
    content: "";
    display: table;
  }
`

const Header = styled.h1``

const Game = styled.div`
  padding: 1rem;
  width: 100%;
  border: 1px solid black;
  margin: 1rem 0;

  &::after {
    clear: both;
    content: "";
    display: table;
  }
`

const Button = styled.button`
  float: right;
`

const Error = styled.p`
  color: red;
`

class Browse extends Component {
  constructor (props) {
    super(props)

    this.state = {
      games: [],
      error: null
    }

    this.streamGames = null
  }

  componentDidMount () {
    const { user } = this.props
    this.streamGames = streamGames(user.email).subscribe(games => {
      this.setState({ games })
    })
  }

  addMember (game) {
    addMember(game)
      .catch(err => this.setState({
        error: err
      }))
  }

  removeMember (game, id) {
    removeMember(game, id)
      .catch(err => this.setState({
        error: err
      }))
  }

  render () {
    const {
      games,
      error
    } = this.state
    const {
      onJoinGame,
      user
    } = this.props

    return (
      <>
        <Top>
          <span>Logget ind som {user.name} ({user.email})</span>
          <Button onClick={() => auth.signOut()}>Log ud</Button>
        </Top>
        {error && <Error>{error}</Error>}
        <Root>
          <Header>Dine spil</Header>
          <button onClick={() => createGame(user)}>Nyt spil</button>
          {games.map(game => (
            <Game key={game.id}>
              <h2 onClick={() => changeTitle(game.id)}>{game.title}</h2>
              <p>Oprettet: {dateFormat(game.creationDate.seconds * 1000, 'dddd, mmmm dS, yyyy, h:MM:ss TT')}</p>
              <p>Oprettet af {game.creator}</p>
              <p>
                Spillere:
              </p>
              <ul>
                {game.members.map(member => (
                  <li key={member}>
                    {member}&nbsp;
                    {!game.started && <button onClick={() => this.removeMember(game.id, member)}>x</button>}
                  </li>
                ))}
              </ul>
              <button onClick={() => this.addMember(game.id)}>Tilføj spiller</button>
              {user.email === game.creator && (
                <button onClick={() => deleteGame(game.id)}>Slet spil</button>
              )}
              {game.started && <Button onClick={() => onJoinGame(game.id)}>Join</Button>}
              {!game.started && <Button onClick={() => startGame(game.id)}>Start spil</Button>}
            </Game>
          ))}
        </Root>
      </>
    )
  }
}

export default Browse
