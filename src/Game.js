import React, { Component } from 'react'
import styled from 'styled-components'
import bgImg from 'images/bg.jpg'
import armyImg from 'images/army.png'
import card0Img from 'images/card_1.png'
import card1Img from 'images/card_2.png'
import card2Img from 'images/card_3.png'
import { streamGame, streamHand, getUsers } from 'api/game'
import SidebarContainer from 'Sidebar'
import BoardContainer from 'Board'
import DisplayedCards from 'DisplayedCards'

const Root = styled.div`
  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  width: 100vw;
  height: 100vh;

  &::after {
    content: "";
    clear: both;
    display: table;
  }
`

const Content = styled.div`
  float: left;
  position: relative;
  width: calc(100% - 20vw);
  height: 100%;
`

const ActionContainer = styled.div.attrs(props => ({
  style: {
    left: props.x,
    top: props.y
  }
}))`
  position: absolute;
  z-index: 1000;
  pointer-events: none;

  & > * {
    max-height: 10rem;
    max-width: 10rem;
  }
`

class GameContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      game: null,
      hand: null,
      users: null,
      mouseX: 0,
      mouseY: 0,
      action: {}
    }

    this.boardEl = React.createRef()

    this.streamGame = null
    this.streamHand = null

    this._onMouseMove = this.onMouseMove.bind(this)
  }

  componentDidMount () {
    const { user, joinedGame } = this.props

    this.streamGame = streamGame(user, joinedGame).subscribe(game => {
      this.setState({
        game
      })
    })

    this.streamHand = streamHand(user, joinedGame).subscribe(hand => {
      this.setState({
        hand
      })
    })

    getUsers(joinedGame).then(users => {
      this.setState({
        users
      })
    })

    window.addEventListener('mousemove', this._onMouseMove)
  }

  componentWillUnmount () {
    this.streamGame.unsubscribe()
    this.streamHand.unsubscribe()

    window.removeEventListener('mousemove', this._onMouseMove)
  }

  onMouseMove (e) {
    if (this.state.action) {
      this.setState({
        mouseX: e.clientX,
        mouseY: e.clientY
      })
    }
  }

  onChangeAction (action) {
    this.setState({
      action
    })
  }

  renderAction () {
    const {
      mouseX,
      mouseY,
      action
    } = this.state

    switch (action.type) {
      case 'PLACE_ARMY':
        return (
          <ActionContainer
            x={mouseX}
            y={mouseY}
          >
            <img src={armyImg} alt='Army' />
          </ActionContainer>
        )
      case 'MOVE_CARD':
      case 'MOVE_DISPLAYED_CARD':
        return (
          <ActionContainer
            x={mouseX}
            y={mouseY}
          >
            {action.options.type === 0 && <img src={card0Img} alt='Card Action' />}
            {action.options.type === 1 && <img src={card1Img} alt='Card Action' />}
            {action.options.type === 2 && <img src={card2Img} alt='Card Action' />}
          </ActionContainer>
        )
      default:
        return null
    }
  }

  render () {
    const {
      action,
      users,
      game,
      hand
    } = this.state
    const {
      user
    } = this.props

    if (!game || !users || !hand) {
      return 'Loading...'
    }

    return (
      <Root>
        {game.displayedCards.list.length > 0 && (
          <DisplayedCards
            displayedCards={game.displayedCards}
            onChangeAction={this.onChangeAction.bind(this)}
            users={users}
            game={game}
            user={user}
            action={action}
          />
        )}
        <SidebarContainer
          action={action}
          user={user}
          users={users}
          hand={hand}
          game={game}
          onChangeAction={this.onChangeAction.bind(this)}
        />
        <Content>
          <BoardContainer
            action={action}
            user={user}
            users={users}
            hand={hand}
            game={game}
            onChangeAction={this.onChangeAction.bind(this)}
          />
        </Content>
        {this.renderAction()}
      </Root>
    )
  }
}

export default GameContainer
