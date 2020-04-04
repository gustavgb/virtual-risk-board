import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from 'images/board.svg'
import bgImg from 'images/bg.jpg'
import cardBackImg from 'images/card_back.png'
import { countries } from 'countries'
import { streamGame, streamHand, getUsers } from 'api/game'

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

const Board = styled.div.attrs(props => ({
  style: {
    width: props.width + 'px',
    height: props.height + 'px',
    left: `calc(50% - ${props.width / 2}px)`,
    top: `calc(50% - ${props.height / 2}px)`
  }
}))`
  background-image: url(${boardImg});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
`

const Content = styled.div`
  float: left;
  position: relative;
  width: calc(100% - 30rem);
  height: 100%;
`

const Sidebar = styled.div`
  width: 30rem;
  height: 100vh;
  overflow-y: auto;
  float: left;
`

const CountryMarker = styled.div.attrs(props => ({
  style: {
    left: props.x + 'px',
    top: props.y + 'px'
  }
}))`
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid black;
  background-color: ${props => props.color};
  position: absolute;
  width: 2.5vw;
  height: 2.5vw;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    width: 3vw;
    height: 3vw;
  }
`

const Pile = styled.div`
  background-color: #751b18;
  background-image: url(${cardBackImg});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  border: 2px solid black;
  box-shadow: 0px 0px 10px 0px black;
  height: 20rem;
  width: 100%;
`

class BoardContainer extends Component {
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
      unit: 0
    }

    this.boardEl = React.createRef()

    this.streamGame = null
    this.streamHand = null

    this._onMouseDown = this.onMouseDown.bind(this)
    this._onResize = this.onResize.bind(this)
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

    window.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('resize', this._onResize)

    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this._onMouseDown)
    window.removeEventListener('resize', this._onResize)
  }

  onResize () {
    const innerWidth = window.innerWidth - 300
    const innerHeight = window.innerHeight

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
      height,
      unit: width / 1000
    })
  }

  onMouseDown (e) {
    const rect = this.boardEl.current.getBoundingClientRect()

    this.setState({
      mouseX: e.clientX - rect.x,
      mouseY: e.clientY - rect.y
    })
  }

  render () {
    const {
      width,
      height,
      users,
      game,
      hand
    } = this.state

    console.log(users, game, hand)

    return (
      <Root>
        <Sidebar>
          <Pile />
        </Sidebar>
        <Content>
          <Board width={width} height={height} ref={this.boardEl}>
            {countries.map(country => (
              <CountryMarker
                key={country.name}
                color='green'
                x={country.x * width}
                y={country.y * height}
              >
                1
              </CountryMarker>
            ))}
          </Board>
        </Content>
      </Root>
    )
  }
}

export default BoardContainer
