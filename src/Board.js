import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from 'images/board.svg'
import { countriesDir } from 'constants/countries'
import { placeArmy } from 'api/game'

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
  color: ${props => props.theme.invertColor(props.color)};
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  z-index: ${props => props.popout ? 200 : 0};

  &:hover {
    width: 3vw;
    height: 3vw;
  }
`

class BoardContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      width: 0,
      height: 0
    }

    this.boardEl = React.createRef()

    this._onResize = this.onResize.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', this._onResize)

    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.action.type !== this.props.action.type ||
      nextProps.user.uid !== this.props.user.uid ||
      nextProps.game.timestamp !== this.props.game.timestamp ||
      nextState.width !== this.state.width ||
      nextState.height !== this.state.height
    )
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

  onClickCountry (countryName, troop) {
    const {
      user: {
        uid
      },
      action,
      game: {
        id
      }
    } = this.props

    switch (action.type) {
      case 'PLACE_ARMY':
        placeArmy(id, uid, countryName)
        this.props.onChangeAction({})
        break
      default:
        console.log('Click country', countryName, troop)
    }
  }

  renderCountry (country) {
    const {
      width,
      height
    } = this.state
    const { action } = this.props
    const groups = country.troopsList.length - 1

    return (
      <React.Fragment key={country.name}>
        {country.troopsList.map((troop, index) => (
          <CountryMarker
            key={country.name + index}
            color={troop.color}
            x={(country.x - (groups / 2) * 0.04 + 0.04 * index) * width}
            y={country.y * height}
            onClick={() => this.onClickCountry(country.name, troop.color)}
            popout={action.type === 'PLACE_ARMY'}
          >
            {troop.amount}
          </CountryMarker>
        ))}
        {groups === -1 && (
          <CountryMarker
            key={country.name + 0}
            color='#808080'
            x={country.x * width}
            y={country.y * height}
            onClick={() => this.onClickCountry(country.name, null)}
            popout={action.type === 'PLACE_ARMY'}
          />
        )}
      </React.Fragment>
    )
  }

  render () {
    const {
      game: {
        countries
      }
    } = this.props
    const {
      width,
      height
    } = this.state

    const joinedCountries = countries.map(country => ({ ...countriesDir[country.name], ...country }))

    return (
      <Board width={width} height={height}>
        {joinedCountries.map(country => this.renderCountry(country))}
      </Board>
    )
  }
}

export default BoardContainer
