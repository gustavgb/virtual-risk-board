import React, { Component } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  position: absolute;
  right: 5vh;
  bottom: 5vh;
  z-index: 25;
  pointer-events: none;
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

class ExpireringMessage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      expired: false
    }
  }

  componentDidMount () {
    const timeLeft = this.props.expire - Date.now() - 500

    window.setTimeout(
      () => this.setState({
        expired: true
      }),
      timeLeft
    )
  }

  render () {
    return (
      <Message expired={this.state.expired}>{this.props.children}</Message>
    )
  }
}

class EventLog extends Component {
  shouldComponentUpdate (nextProps) {
    const now = Date.now()
    return nextProps.events.length !== this.props.events.filter(event => event.expire > now).length
  }

  parseEvent ({ code, content: options = {} }) {
    const cardTypes = ['infanteri', 'kavaleri', 'artileri']

    switch (code) {
      case 'PLACE_ARMY':
        if (options.origin) {
          return `${options.user} har flyttet ${options.amount} armér${options.amount > 1 ? 'er' : ''} fra ${options.origin} til ${options.destination}`
        }
        return `${options.user} har placeret ${options.amount} armér${options.amount > 1 ? 'er' : ''} i ${options.country}`
      case 'DISCARD_ARMY':
        return `${options.user} har fjernet ${options.amount} armér${options.amount > 1 ? 'er' : ''} fra ${options.country}`
      case 'CHANGE_COLOR':
        return `${options.user} har skiftet farve`
      case 'TAKE_CARD':
        return `${options.user} har taget et nyt kort`
      case 'DISPLAY_CARD':
        return `${options.user} viser nu et kort af typen ${cardTypes[options.type]}`
      case 'HIDE_CARD':
        return `${options.user} har skjult sit kort af typen ${cardTypes[options.type]}`
      case 'DISCARD_CARDS':
        return `${options.user} har smidt disse kort: ${options.cards.map(a => cardTypes[a])}`
      default:
        return ''
    }
  }

  render () {
    const {
      events
    } = this.props

    const now = Date.now()
    const eventsFiltered = events.filter(event => event.expire > now)

    return (
      <Root>
        {eventsFiltered.map(event => (
          <ExpireringMessage
            key={event.timestamp}
            expire={event.expire}
          >
            {this.parseEvent(event)}
          </ExpireringMessage>
        ))}
      </Root>
    )
  }
}

export default EventLog
