import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import boardImg from 'images/board.svg'
import trashImg from 'images/trash.png'
import { countriesDir } from 'constants/countries'
import { placeArmy, removeArmy } from 'api/game'

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

const CountryLabel = styled.div`
  content: ${props => props.label};
  position: absolute;
  top: -2vw;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: none;
  white-space: nowrap;
`

const CountryMarker = styled.div.attrs(props => ({
  style: {
    left: props.x + 'px',
    top: props.y + 'px'
  }
}))`
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: ${props => props.highlight ? '4px solid #ffd612' : '2px solid black'};
  background-color: ${props => props.color};
  position: absolute;
  width: 2.5vw;
  height: 2.5vw;
  color: ${props => props.theme.invertColor(props.color)};
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  z-index: ${props => props.popout ? 200 : 0};

  &:hover > ${CountryLabel} {
    display: block;
  }

  ${props => props.clickable && css`
    cursor: pointer;

    &:hover {
      width: 3vw;
      height: 3vw;
    }
  `}

  ${props => props.highlight && css`
    width: 3vw;
    height: 3vw;
  `}
`

const Trash = styled.div`
  background-image: url(${trashImg});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 10vw;
  height: 10vw;
  position: absolute;
  bottom: ${props => props.active ? '20px' : '-10vw'};
  left: 0;
  z-index: 100;
  transition: all 0.2s ease-out;
  background-color: rgba(100, 100, 100, 0.7);

  &:hover {
    background-color: rgba(200, 50, 0, 1);
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

  onClickCountry (e, countryName, army, shouldAdd = false) {
    e.preventDefault()

    const {
      user: {
        uid
      },
      action,
      game: {
        id
      }
    } = this.props

    const isSame = shouldAdd && action.type === 'MOVE_ARMY' && action.options.countryName === countryName

    if (action.type === 'PLACE_ARMY') {
      placeArmy(id, uid, countryName, action.options.color, action.options.amount)
      this.props.onChangeAction({})
    } else if (action.type === 'MOVE_ARMY' && !isSame) {
      placeArmy(id, uid, countryName, action.options.color, action.options.amount)
      this.props.onChangeAction({})
    } else if (action.type === 'MOVE_ARMY' || !action.type) {
      let amount = 1
      if (isSame) {
        amount += action.options.amount
      }
      if (army && army.amount > 0) {
        removeArmy(id, uid, countryName, army.id, 1)
        this.props.onChangeAction({
          type: 'MOVE_ARMY',
          options: {
            countryName,
            armyId: army.id,
            amount,
            color: army.color
          }
        })
      }
    }
  }

  onDiscardAction () {
    const { action } = this.props
    if (action.type) {
      this.props.onChangeAction({})
    }
  }

  renderCountry (country) {
    const {
      width,
      height
    } = this.state
    const { action } = this.props
    const groups = country.armiesList.length - 1
    const pop = action.type === 'PLACE_ARMY' || action.type === 'MOVE_ARMY'

    return (
      <React.Fragment key={country.name}>
        {country.armiesList.map((army, index) => (
          <CountryMarker
            key={country.name + index}
            color={army.color}
            x={(country.x - (groups / 2) * 0.04 + 0.04 * index) * width}
            y={country.y * height}
            onClick={(e) => this.onClickCountry(e, country.name, army)}
            onContextMenu={(e) => this.onClickCountry(e, country.name, army, true)}
            popout={pop}
            clickable
            highlight={
              action.type === 'MOVE_ARMY' &&
              action.options.countryName === country.name &&
              action.options.armyId === army.id
            }
          >
            {army.amount}
            <CountryLabel>{country.name}</CountryLabel>
          </CountryMarker>
        ))}
        {groups === -1 && (
          <CountryMarker
            key={country.name + 0}
            color='#808080'
            x={country.x * width}
            y={country.y * height}
            onMouseDown={(e) => this.onClickCountry(e, country.name, null)}
            onContextMenu={(e) => this.onClickCountry(e, country.name, null, true)}
            popout={pop}
            clickable={pop}
            highlight={
              action.type === 'MOVE_ARMY' &&
              action.options.countryName === country.name
            }
          >
            <CountryLabel>{country.name}</CountryLabel>
          </CountryMarker>
        )}
      </React.Fragment>
    )
  }

  render () {
    const {
      game: {
        countries
      },
      action
    } = this.props
    const {
      width,
      height
    } = this.state

    const joinedCountries = countries.map(country => ({ ...countriesDir[country.name], ...country }))

    return (
      <>
        <Trash active={action.type === 'MOVE_ARMY'} onClick={this.onDiscardAction.bind(this)} />
        <Board width={width} height={height}>
          {joinedCountries.map(country => this.renderCountry(country))}
        </Board>
      </>
    )
  }
}

export default BoardContainer
