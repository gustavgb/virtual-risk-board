import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import { countriesDir } from 'constants/countries'
import cardBackImg from 'images/card_back.png'
import { colors } from 'constants/colors'

const Root = styled.div`
  pointer-events: none;
`

const StaticMessages = styled.div`
  position: absolute;
  right: 5vh;
  bottom: 5vh;
  z-index: 25;
  text-align: right;
`

const Message = styled.p`
  color: black;
  font-weight: bold;
  line-height: 1.2em;
  font-size: 2.5vh;
  margin: 1vh 0 0;
  opacity: ${props => props.expired ? 0 : 1};
  transition: opacity 0.5s ease-in;
`

const BoardEvent = styled.div.attrs(props => ({
  style: {
    width: props.width + 'px',
    height: props.height + 'px',
    left: `calc(50% - ${props.width / 2}px)`,
    top: `calc(50% - ${props.height / 2}px)`
  }
}))`
  position: absolute;
`

const locate = keyframes`
  0% {
    width: 30vw;
    height: 30vw;
    border-width: 1vw;
  }

  100% {
    width: 0;
    height: 0;
    border-width: 0;
  }
`

const CountryLocator = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  border-radius: 50%;
  border: 0 solid darkred;
  animation: ${locate} 1s ease-in;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 500;
`

const fadeInOut = keyframes`
  0% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }

  60% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`

const flyInOut = keyframes`
  0% {
    top: -15vw;
  }

  100% {
    top: 100vh;
  }
`

const TakeCardEvent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  opacity: 0;
  background-color: rgba(100, 100, 100, 0.7);
  animation: ${fadeInOut} 2.5s ease-in-out;

  &::after {
    content: "";
    background-image: url(${cardBackImg});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    display: block;

    width: 23.1vw;
    height: 15vw;

    position: absolute;
    top: -15vw;
    left: 50%;
    transform: translateX(-50%);

    animation: ${flyInOut} 2.5s cubic-bezier(.21,.72,.71,.16);
  }
`

class ExpireringMessage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      expired: false
    }

    this.unmounted = false
  }

  componentDidMount () {
    const timeLeft = this.props.expire - Date.now()

    window.setTimeout(
      () => {
        if (!this.unmounted) {
          this.setState({
            expired: true
          })
        }
      },
      timeLeft
    )
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  render () {
    return this.props.children({ expired: this.state.expired })
  }
}

class EventLog extends Component {
  shouldComponentUpdate (nextProps) {
    const now = Date.now()
    return (
      nextProps.user.uid !== this.props.user.uid ||
      nextProps.events.filter(event => event.expire > now).length !== this.props.events.filter(event => event.expire > now).length ||
      nextProps.width !== this.props.width ||
      nextProps.height !== this.props.height
    )
  }

  parseEvent ({ code, content: options = {} }) {
    const cardTypes = ['infanteri', 'kavaleri', 'artileri']

    switch (code) {
      case 'PLACE_ARMY':
        if (options.origin !== options.destination) {
          const color = (colors.find(color => color.hex === options.color) || {})
          if (options.origin) {
            return `${options.user} har flyttet ${options.amount} ${options.amount > 1 ? color.pluralName.toLowerCase() : color.name.toLowerCase()} armér${options.amount > 1 ? 'er' : ''} fra ${options.origin} til ${options.destination}`
          }
          return `${options.user} har placeret ${options.amount} ${options.amount > 1 ? color.pluralName.toLowerCase() : color.name.toLowerCase()} armér${options.amount > 1 ? 'er' : ''} i ${options.destination}`
        }
        return ''
      case 'DISCARD_ARMY': {
        const color = (colors.find(color => color.hex === options.color) || {})
        return `${options.user} har fjernet ${options.amount} ${options.amount > 1 ? color.pluralName.toLowerCase() : color.name.toLowerCase()} armér${options.amount > 1 ? 'er' : ''} fra ${options.country}`
      }
      case 'CHANGE_COLOR':
        return `${options.user} har skiftet farve`
      case 'TAKE_CARD':
        return `${options.user} har taget et nyt kort`
      case 'DISPLAY_CARD':
        if (options.type === 'mission') {
          return `${options.user} viser nu sit missionskort`
        }
        return `${options.user} viser nu et kort af typen ${cardTypes[options.type]}`
      case 'HIDE_CARD':
        if (options.type === 'mission') {
          return `${options.user} har skjult nu sit missionskort`
        }
        return `${options.user} har skjult sit kort af typen ${cardTypes[options.type]}`
      case 'DISCARD_CARDS':
        return `${options.user} har smidt disse kort: ${options.cards.map(a => cardTypes[a])}`
      case 'THROW_CARD':
        return `${options.user} har smidt et tilfældigt kort`
      case 'DISCARD_DICE':
        return `${options.user} har fjernet ${options.dice.length > 0 ? 'sine terninger' : 'sin terning'} (${options.dice.join(', ')})`
      case 'ROLL_DICE':
        return `${options.user} har rullet en terning`
      default:
        return ''
    }
  }

  renderAnimatedEvent (event) {
    const {
      width,
      height,
      user: {
        uid
      }
    } = this.props

    if (
      event.timestamp + 1000 > Date.now() &&
      (event.code === 'PLACE_ARMY' || event.code === 'DISCARD_ARMY') &&
      event.userId !== uid
    ) {
      const country = countriesDir[event.content.destination || event.content.country]
      return (
        <ExpireringMessage key={event.timestamp} expire={event.timestamp + 1000}>
          {({ expired }) => !expired
            ? (
              <BoardEvent width={width} height={height}>
                <CountryLocator
                  x={country.x * width}
                  y={country.y * height}
                />
              </BoardEvent>
            )
            : null}
        </ExpireringMessage>
      )
    }

    if (
      event.timestamp + 2500 > Date.now() &&
      (event.code === 'TAKE_CARD') &&
      event.userId !== uid
    ) {
      return (
        <ExpireringMessage key={event.timestamp} expire={event.timestamp + 2500}>
          {({ expired }) => !expired
            ? <TakeCardEvent key={event.timestamp} />
            : null}
        </ExpireringMessage>
      )
    }

    return null
  }

  render () {
    const {
      events
    } = this.props

    if (!events) {
      return null
    }

    const now = Date.now()
    const eventsFiltered = events.filter(event => event.expire > now)

    return (
      <Root>
        <StaticMessages>
          {eventsFiltered.map(event => {
            const parsedEvent = this.parseEvent(event)
            if (parsedEvent) {
              return (
                <ExpireringMessage
                  key={event.timestamp}
                  expire={event.expire - 500}
                >
                  {({ expired }) => (
                    <Message expired={expired}>{parsedEvent}</Message>
                  )}
                </ExpireringMessage>
              )
            }
            return null
          })}
        </StaticMessages>
        {events.map(event => this.renderAnimatedEvent(event))}
      </Root>
    )
  }
}

export default EventLog
