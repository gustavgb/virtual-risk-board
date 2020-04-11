import React, { Component } from 'react'
import { streamMyGames, createGame, deleteGame, changeTitle, checkCode, streamUser } from 'api/browse'
import styled from 'styled-components'
import { logout, changeUsername } from 'api/user'
import { withRouter } from 'react-router-dom'
import logo from 'images/card_back.png'
import CenteredMessage from 'Components/CenteredMessage'

const Root = styled.div`
  width: 50rem;
  margin: 0 auto 100px;
  padding: 10rem 2rem;
  background-color: #ddd;
`

const Top = styled.div`
  background-color: rgba(170, 170, 170, 0.5);
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: ". logo info";
  align-items: start;
  justify-items: center;
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

const Logo = styled.img.attrs({
  src: logo
})`
  height: 100px;
  grid-area: logo;
`

const UserInfo = styled.div`
  grid-area: info;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;

  & > div {
    margin-bottom: 5px;
  }
`

class Browse extends Component {
  constructor (props) {
    super(props)

    this.state = {
      games: null,
      user: null,
      error: null,
      code: ''
    }

    this.streamMyGames = null
    this.streamMyGames = null
  }

  componentDidMount () {
    const { user } = this.props
    this.streamMyGames = streamMyGames(user.uid).subscribe(games => {
      this.setState({ games })
    })

    this.streamUser = streamUser(user.uid).subscribe(user => {
      this.setState({
        user
      })
    })
  }

  componentWillUnmount () {
    if (this.streamMyGames) {
      this.streamMyGames.unsubscribe()
    }

    if (this.streamUser) {
      this.streamUser.unsubscribe()
    }
  }

  onChangeCode ({ target: { value } }) {
    this.setState({
      code: value,
      error: null
    })
  }

  onChangeUsername () {
    const { user: { uid } } = this.state

    changeUsername(uid)
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
      user,
      code
    } = this.state

    if (!games || !user) {
      return <CenteredMessage>Loading...</CenteredMessage>
    }

    return (
      <>
        <Top>
          <Logo />
          <UserInfo>
            <div>Logget ind som {user.name ? `${user.name} (${user.email})` : user.email}</div>
            <Button onClick={this.onChangeUsername.bind(this)}>Ændre navn</Button>
            <Button onClick={() => logout()}>Log ud</Button>
          </UserInfo>
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
