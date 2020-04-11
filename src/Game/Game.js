import React, { Component } from 'react'
import styled from 'styled-components'
import cardBackImg from 'images/card_back.png'
import { streamState, joinGame, connectToPresence } from 'api/game'
import SidebarContainer from 'Game/Sidebar'
import BoardContainer from 'Game/Board'
import DisplayedCards from 'Game/DisplayedCards'
import EventLog from 'Game/EventLog'
import LandingPrompt from 'Game/Landing'
import Card from 'Game/Components/Card'
import { checkCode } from 'api/browse'
import CenteredMessage from 'Components/CenteredMessage'
import { Link } from 'react-router-dom'

const Root = styled.div`
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
  overflow: hidden;
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

const ArmyMarker = styled.div`
  width: 2.5vw;
  height: 2.5vw;
  border-radius: 50%;
  border: 2px solid black;
  color: ${props => props.theme.invertColor(props.color)};
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  background-color: ${props => props.color};
`

const DropZoneBlocker = styled.div`
  position: absolute;
  z-index: 100;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  color: white;
  font-size: 25px;
  user-select: none;
  pointer-events: ${props => props.active ? 'all' : 'none'};
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
      width: 0,
      height: 0,
      action: {},
      invalidCode: false
    }

    this.contentRef = React.createRef()

    this.streamState = null

    this._onMouseMove = this.onMouseMove.bind(this)
    this._onResize = this.onResize.bind(this)
  }

  componentDidMount () {
    const { user, joinedGame } = this.props

    console.log(joinedGame)

    checkCode(joinedGame)
      .then(() => joinGame(user, joinedGame))
      .then(() => {
        this.connectToPresence = connectToPresence(joinedGame, user.uid)

        this.streamState = streamState(user, joinedGame).subscribe((state) => {
          this.setState(state)
        })
      })
      .catch(() => this.setState({
        invalidCode: true
      }))

    window.addEventListener('mousemove', this._onMouseMove)
    window.addEventListener('resize', this._onResize)

    this.onResize()
  }

  componentWillUnmount () {
    if (this.streamState) {
      this.streamState.unsubscribe()
    }

    if (this.connectToPresence) {
      this.connectToPresence()
    }

    window.removeEventListener('mousemove', this._onMouseMove)
    window.removeEventListener('resize', this._onResize)
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      (!prevState.game || !prevState.hand || !prevState.users || !prevState.game.colors[prevState.user.uid]) &&
      (this.state.game && this.state.hand && this.state.users && this.state.game.colors[this.state.user.uid])
    ) {
      this.onResize()
    }
  }

  onResize () {
    if (this.contentRef.current) {
      const rect = this.contentRef.current.getBoundingClientRect()
      const innerWidth = rect.width
      const innerHeight = rect.height

      const aspect = 750 / 519

      let width, height

      if (innerWidth > innerHeight * aspect) {
        height = innerHeight
        width = innerHeight * aspect
      } else {
        width = innerWidth
        height = innerWidth / aspect
      }

      this.setState({
        width,
        height
      })
    }
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
            <ArmyMarker color={action.options.color}>
              {action.options.amount}
            </ArmyMarker>
          </ActionContainer>
        )
      case 'MOVE_CARD':
      case 'MOVE_DISPLAYED_CARD':
        return (
          <ActionContainer
            x={mouseX}
            y={mouseY}
          >
            {(action.options.index === 'mission' || action.options.cardIndex === 'mission')
              ? (
                <Card landscape width='154px' label='Missionskort' />
              )
              : (
                <Card type={action.options.type} width='100px' />
              )}
          </ActionContainer>
        )
      case 'TAKE_CARD':
        return (
          <ActionContainer
            x={mouseX}
            y={mouseY}
          >
            <img src={cardBackImg} alt='Card Action' />
          </ActionContainer>
        )
      case 'MOVE_ARMY':
        return (
          <ActionContainer
            x={mouseX}
            y={mouseY}
          >
            <ArmyMarker color={action.options.color}>
              {action.options.amount}
            </ArmyMarker>
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
      hand,
      invalidCode,
      width,
      height,
      user
    } = this.state

    if (invalidCode) {
      return (
        <CenteredMessage>
          <p>Dette spil findes desværre ikke...</p>
          <Link to='/'>
            &larr;
            Tilbage til forsiden
          </Link>
        </CenteredMessage>
      )
    }

    if (!game || !users || !hand) {
      return <CenteredMessage>Loading...</CenteredMessage>
    }

    if (!game.colors[user.uid]) {
      return (
        <LandingPrompt
          user={user}
          game={game}
          users={users}
        />
      )
    }

    const props = {
      onChangeAction: this.onChangeAction.bind(this),
      users,
      game,
      user,
      action,
      width,
      height,
      hand
    }

    return (
      <Root>
        <DropZoneBlocker active={action.type === 'MOVE_ARMY'} onContextMenu={e => e.preventDefault()} />
        {game.displayedCards.list.length > 0 && (
          <DisplayedCards displayedCards={game.displayedCards} {...props} />
        )}
        <SidebarContainer {...props} />
        <Content ref={this.contentRef}>
          <BoardContainer {...props} />
          <EventLog events={game.events} {...props} />
        </Content>
        {this.renderAction()}
      </Root>
    )
  }
}

export default GameContainer
