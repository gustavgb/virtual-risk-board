import React, { Component } from 'react'
import styled from 'styled-components'
import cardBackImg from 'images/card_back.png'
import trashImg from 'images/trash.png'
import card0Img from 'images/card_1.png'
import card1Img from 'images/card_2.png'
import card2Img from 'images/card_3.png'
import backIcon from 'images/back.png'
import armyImg from 'images/army.png'
import { setColors, takeCard, displayCard } from 'api/game'
import { colors } from 'constants/colors'
import { Link } from 'react-router-dom'

const Sidebar = styled.div`
  width: 20vw;
  height: 100vh;
  overflow-y: auto;
  float: left;
  padding: 0 1rem;
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
  color: ${props => props => props.color ? props.theme.invertColor(props.color) : 'white'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${props => props.left ? 'flex-start' : 'center'};
  margin: 2vh 0;

  & > a {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: black;

    & > img {
      height: 2.5rem;
      margin-left: 1rem;
    }
  }
`

const Details = styled.details`
  color: white;
  margin: 2vh 0;

  & summary * {
    display: inline;
  }
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
  padding: 1rem 0;
  width: 100%;
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
  opacity: ${props => props.selected ? '0.5' : '1'};
`

const CountryListItem = styled.li`
  color: ${props => props.done ? '#0f0' : 'white'};
`

const BoardDropZone = styled.div`
  position: absolute;
  z-index: 100;
  background-color: #555;
  opacity: 0;
  right: 0;
  bottom: 0;
  top: 0;
  left: 20vw;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 25px;
  pointer-events: ${props => props.active ? 'all' : 'none'};
  transition: opacity 0.2s ease-out;
  user-select: none;

  &:hover {
    opacity: 0.7;
  }
`

class SidebarContainer extends Component {
  shouldComponentUpdate (nextProps) {
    return (
      nextProps.action.type !== this.props.action.type ||
      nextProps.user.uid !== this.props.user.uid ||
      nextProps.game.timestamp !== this.props.game.timestamp ||
      (nextProps.hand.cards && nextProps.hand.cards.length) !== (this.props.hand.cards && this.props.hand.cards.length)
    )
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

  onChangeColor (color) {
    const {
      user: {
        uid
      },
      game: {
        id
      }
    } = this.props

    setColors(id, { [uid]: color })
  }

  onTakeCard () {
    const {
      user: {
        uid
      },
      game: {
        id
      }
    } = this.props

    if (window.confirm('Vil du tage et kort?')) {
      takeCard(id, uid)
    }
  }

  onTakeArmy () {
    this.props.onChangeAction({
      type: 'PLACE_ARMY'
    })
  }

  onClickTrash () {
    const {
      action
    } = this.props

    switch (action.type) {
      case 'PLACE_ARMY':
        this.props.onChangeAction({})
        break
      default:
        console.log('Click trash')
    }
  }

  onClickCard (type, index) {
    const { action } = this.props
    if (!(action.type === 'MOVE_CARD' && action.options.index === index)) {
      this.props.onChangeAction({
        type: 'MOVE_CARD',
        options: {
          type,
          index
        }
      })
    } else {
      this.props.onChangeAction({})
    }
  }

  onClickBoard () {
    const {
      action,
      game: {
        id
      },
      user: {
        uid
      }
    } = this.props

    switch (action.type) {
      case 'MOVE_CARD':
        displayCard(id, uid, action.options.type, action.options.index)
        this.props.onChangeAction({})
        break
      default:
        console.log('Click board')
    }
  }

  render () {
    const {
      user: {
        uid
      },
      game: {
        initialCountries,
        colors: gameColors
      },
      hand: {
        cards
      },
      action
    } = this.props

    const color = gameColors[uid] || '#808080'
    const colorList = colors.filter(c => !Object.keys(gameColors).find(p => gameColors[p] === c))
    const myCountries = initialCountries[uid]

    return (
      <Sidebar>
        <BoardDropZone active={action.type === 'MOVE_CARD'} onClick={this.onClickBoard.bind(this)}>
          Vis dette kort til de andre spillere
        </BoardDropZone>
        <Zone height='5rem' left>
          <Link to='/'>
            <img src={backIcon} alt='back' />
            Tilbage til forsiden
          </Link>
        </Zone>
        <Zone color='#ddd' bg={trashImg} height='10vh' onClick={this.onClickTrash.bind(this)} />
        <Zone color={color} bg={armyImg}>
          <Select
            value={color}
            placeholder='Vælg brikker'
            color={color}
            onChange={(e) => this.onChangeColor(e.target.value)}
          >
            <Option color='#808080' value=''>Vælg farve</Option>
            {colorList.map(c => <Option key={c} color={c} value={c} />)}
          </Select>
          <Button onClick={this.onTakeArmy.bind(this)}>Tag én armér</Button>
          <Button onClick={this.onTakeArmy.bind(this)}>Tag flere armérer</Button>
        </Zone>
        <Zone bg={cardBackImg} color='#751b18' onClick={this.onTakeCard.bind(this)} />
        <Hand>
          {cards.map((card, index) => (
            <Card
              key={index}
              bg={this.getCardBg(card)}
              onClick={() => this.onClickCard(card, index)}
              selected={action.type === 'MOVE_CARD' && action.options.index === index}
            />
          ))}
        </Hand>
        <Details>
          <summary><h3>Mine lande</h3></summary>
          <ul>
            {myCountries.map(country => (
              <CountryListItem done={false} key={country}>{country}</CountryListItem>
            ))}
          </ul>
        </Details>
        <Details>
          <summary><h3>Mine begyndelseslande</h3></summary>
          <ul>
            {myCountries.map(country => (
              <CountryListItem done={false} key={country}>{country}</CountryListItem>
            ))}
          </ul>
        </Details>
      </Sidebar>
    )
  }
}

export default SidebarContainer
