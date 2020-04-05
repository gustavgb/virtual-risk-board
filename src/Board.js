import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from 'images/board.svg'
import bgImg from 'images/bg.jpg'
import cardBackImg from 'images/card_back.png'
import trashImg from 'images/trash.png'
import card0Img from 'images/card_1.png'
import card1Img from 'images/card_2.png'
import card2Img from 'images/card_3.png'
import { countriesDir } from 'constants/countries'
import { streamGame, streamHand, getUsers, setColors } from 'api/game'
import { colors } from 'constants/colors'
import { Link } from 'react-router-dom'

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
  width: calc(100% - 20vw);
  height: 100%;
`

const Sidebar = styled.div`
  width: 20vw;
  height: 100vh;
  overflow-y: auto;
  float: left;
  padding: 0 1rem;
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

const Zone = styled.div`
  background-color: ${props => props.color || 'transparent'};
  background-image: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  border: ${props => props.color ? '2px solid black' : 'none'};
  box-shadow: ${props => props.color ? '0px 0px 10px 0px black' : 'none'};
  min-height: ${props => props.height || '20vh'};
  width: 100%;
  color: ${props => props => props.color ? props.theme.invertColor(props.color) : 'black'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 2vh 0;
`

const Select = styled.select`
  width: 100%;
  background-color: ${props => props.color};
  color: ${props => props.theme.invertColor(props.color)};
`

const Option = styled.option`
  background-color: ${props => props.color};
  color: ${props => props.theme.invertColor(props.color)};

  &:hover {
    background-color: ${props => props.color};
    color: ${props => props.theme.invertColor(props.color)};
  }
`

const Button = styled.button`
  padding: 1rem 0.5rem;
`

const Hand = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  margin: 2vh 0;
`

const Card = styled.div`
  background-color: white;
  background-image: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  height: 10vw;
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
      height: 0
    }

    this.boardEl = React.createRef()

    this.streamGame = null
    this.streamHand = null

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

    window.addEventListener('resize', this._onResize)

    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
  }

  getCardBg (card) {
    switch (card) {
      case 0:
        return card0Img
      case 1:
        return card1Img
      case 2:
        return card2Img
      default:
        return ''
    }
  }

  onResize () {
    const innerWidth = window.innerWidth * 0.8
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
      height
    })
  }

  onChangeColor (color) {
    const {
      user: {
        uid
      }
    } = this.props

    const {
      game
    } = this.state

    setColors(game.id, { [uid]: color })
  }

  renderCountry (country) {
    const {
      width,
      height
    } = this.state
    const groups = country.troops.length

    return (
      <React.Fragment key={country.name}>
        {country.troops.map((troop, index) => (
          <CountryMarker
            key={country.name + index}
            color='green'
            x={(country.x - (groups / 2) * 0.02 + 0.04 * index) * width}
            y={country.y * height}
          >
            {troop.amount}
          </CountryMarker>
        ))}
        {groups === 0 && (
          <CountryMarker
            key={country.name + 0}
            color='grey'
            x={country.x * width}
            y={country.y * height}
          />
        )}
      </React.Fragment>
    )
  }

  render () {
    const {
      width,
      height,
      users,
      game,
      hand
    } = this.state
    const {
      user: {
        uid
      }
    } = this.props

    console.log(users, game, hand)

    if (!game || !users || !hand) {
      return 'Loading...'
    }

    const joinedCountries = game.countries.map(country => ({ ...countriesDir[country.name], ...country }))
    const color = game.colors[uid] || '#808080'
    const colorList = colors.filter(c => !Object.keys(game.colors).find(p => game.colors[p] === c))

    return (
      <Root>
        <Sidebar>
          <Zone height='5rem'>
            <Link to='/'>Tilbage til forsiden</Link>
          </Zone>
          <Zone color='#ddd' bg={trashImg} height='10vh' />
          <Zone color={color}>
            <Select
              value={color}
              placeholder='Vælg brikker'
              color={color}
              onChange={(e) => this.onChangeColor(e.target.value)}
            >
              <Option color='#808080' value=''>Vælg farve</Option>
              {colorList.map(c => <Option key={c} color={c} value={c} />)}
            </Select>
            <Button>Tag armérer</Button>
          </Zone>
          <Zone bg={cardBackImg} color='#751b18' />
          <Hand>
            {hand.cards.map((card, index) => <Card key={index} bg={this.getCardBg(card)} />)}
          </Hand>
        </Sidebar>
        <Content>
          <Board width={width} height={height}>
            {joinedCountries.map(country => this.renderCountry(country))}
          </Board>
        </Content>
      </Root>
    )
  }
}

export default BoardContainer
