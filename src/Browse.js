import React, { Component } from 'react'
import { streamMyGames, createGame, deleteGame, changeTitle, checkCode } from 'api/browse'
import styled from 'styled-components'
import { logout } from 'api/login'
import { withRouter } from 'react-router-dom'

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
  display: block;
  width: 100%;
  margin: 1rem 0;
`

class Browse extends Component {
  constructor (props) {
    super(props)

    this.state = {
      games: [],
      error: null,
      code: ''
    }

    this.streamMyGames = null
  }

  componentDidMount () {
    const { user } = this.props
    this.streamMyGames = streamMyGames(user.uid).subscribe(games => {
      this.setState({ games })
    })
  }

  componentWillUnmount () {
    this.streamMyGames.unsubscribe()
  }

  onChangeCode ({ target: { value } }) {
    this.setState({
      code: value,
      error: null
    })
  }

  onJoinGame (gameId, event) {
    const { history } = this.props

    if (event) {
      event.preventDefault()
    }

    checkCode(gameId)
      .then(() => {
        history.push(`/${gameId}`)
      })
      .catch(err => {
        this.setState({
          error: err.message
        })
      })
  }

  render () {
    const {
      games,
      error,
      code
    } = this.state
    const {
      user
    } = this.props

    return (
      <>
        <Top>
          <span>Logget ind som {user.name} ({user.email})</span>
          <Button onClick={() => logout()}>Log ud</Button>
        </Top>
        <Root>
          {error && <Error>{error}</Error>}
          <Header>Join et spil</Header>
          <form onSubmit={e => this.onJoinGame(code, e)}>
            Indtast den kode som du har fået delt af vennerne
            <CodeBox value={code} onChange={this.onChangeCode.bind(this)} />
            <Button type='submit'>Join</Button>
          </form>
          <Header>Dine spil</Header>
          <button onClick={() => createGame(user)}>Nyt spil</button>
          {games.map(game => (
            <Game key={game.id}>
              <h2 onClick={() => changeTitle(game.id)}>{game.title}</h2>
              Del denne kode med vennerne for at lade dem joine!
              <CodeBox value={game.id} onChange={() => null} />
              <button onClick={() => deleteGame(game)}>Slet spil</button>
              <Button onClick={() => this.onJoinGame(game.id)}>Join</Button>
            </Game>
          ))}
        </Root>
      </>
    )
  }
}

export default withRouter(Browse)
