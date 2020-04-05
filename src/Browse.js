import React, { Component } from 'react'
import { streamMyGames, createGame, deleteGame, changeTitle } from 'api/browse'
import styled from 'styled-components'
import { logout } from 'api/login'

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

const CodeBox = styled.input.attrs({
  type: 'text'
})`
  padding: 1rem;
`

class Browse extends Component {
  constructor (props) {
    super(props)

    this.state = {
      games: [],
      error: null
    }

    this.streamMyGames = null
  }

  componentDidMount () {
    const { user } = this.props
    this.streamMyGames = streamMyGames(user.uid).subscribe(games => {
      console.log(games)
      this.setState({ games })
    })
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

    console.log(games)

    return (
      <>
        <Top>
          <span>Logget ind som {user.name} ({user.email})</span>
          <Button onClick={() => logout()}>Log ud</Button>
        </Top>
        {error && <Error>{error}</Error>}
        <Root>
          <Header>Dine spil</Header>
          <button onClick={() => createGame(user)}>Nyt spil</button>
          {games.map(game => (
            <Game key={game.id}>
              <h2 onClick={() => changeTitle(game.id)}>{game.title}</h2>
              Del denne kode med vennerne for at lade dem joine!<br />
              <CodeBox value={game.id} onChange={() => null} />
              <br />
              <button onClick={() => deleteGame(game)}>Slet spil</button>
              <Button onClick={() => onJoinGame(game.id)}>Join</Button>
            </Game>
          ))}
        </Root>
      </>
    )
  }
}

export default Browse
