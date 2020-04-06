import React, { Component } from 'react'
import styled from 'styled-components'
import cardBackImg from 'images/card_back.png'
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

  & * {
    user-select: none;
  }
`

const Zone = styled.div`
  background-color: ${props => props.color || 'transparent'};
  background-image: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  min-height: ${props => props.height || '20vh'};
  width: 100%;
  color: ${props => props => props.color ? props.theme.invertColor(props.color) : 'white'};
  display: flex;
  flex-direction: column;
  justify-content: ${props => props.top ? 'flex-start' : 'center'};;
  align-items: ${props => props.left ? 'flex-start' : 'center'};
  margin: 2vh 0;
  z-index: ${props => props.popout ? 200 : 0};
  position: relative;

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

const Hand = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
`

const Card = styled.div`
  background-color: #e3e9e7;
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
  z-index: 200;
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

const CancelDropZone = styled.div`
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
    this.props.onChangeAction({
      type: 'TAKE_CARD'
    })
  }

  onTakeArmy () {
    this.props.onChangeAction({
      type: 'PLACE_ARMY'
    })
  }

  onPlaceCard () {
    const { action, game: { id }, user: { uid } } = this.props
    if (action.type === 'TAKE_CARD') {
      this.props.onChangeAction({})
      takeCard(id, uid)
    }
  }

  onMoveCard (type, index) {
    const { action, game: { displayedCards }, user: { uid } } = this.props
    if (
      !(action.type === 'MOVE_CARD' && action.options.index === index) &&
      !(displayedCards.userId === uid && displayedCards.list.find(c => c.cardIndex === index))
    ) {
      this.props.onChangeAction({
        type: 'MOVE_CARD',
        options: {
          type,
          index
        }
      })
    }
  }

  onDiscardAction () {
    this.props.onChangeAction({})
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
        colors: gameColors,
        displayedCards
      },
      hand: {
        cards
      },
      action
    } = this.props

    const color = gameColors[uid] || '#808080'
    const colorList = colors.filter(c => !Object.keys(gameColors).find(p => gameColors[p] === c))
    const myCountries = initialCountries[uid]
    const myDisplayedCards = displayedCards.userId === uid ? displayedCards.list : []

    return (
      <Sidebar>
        <BoardDropZone
          active={action.type === 'MOVE_CARD'}
          onMouseUp={this.onClickBoard.bind(this)}
        >
          Vis dette kort til de andre spillere
        </BoardDropZone>
        <CancelDropZone
          active={['PLACE_ARMY', 'MOVE_CARD', 'TAKE_CARD'].indexOf(action.type) > -1}
          onMouseUp={() => this.onDiscardAction()}
        />
        <Zone height='5rem' left>
          <Link to='/'>
            <img src={backIcon} alt='back' />
            Tilbage til forsiden
          </Link>
        </Zone>
        <Zone
          color={color}
          bg={armyImg}
          top
          onClick={this.onTakeArmy.bind(this)}
          popout={action.type === 'PLACE_ARMY'}
        >
          <Select
            value={color}
            color={color}
            onChange={(e) => this.onChangeColor(e.target.value)}
            onClick={e => e.stopPropagation()}
          >
            <Option color='#808080' value=''>Vælg farve</Option>
            {colorList.map(c => <Option key={c} color={c} value={c} />)}
          </Select>
        </Zone>
        <Zone bg={cardBackImg} color='#751b18' onMouseDown={this.onTakeCard.bind(this)} />
        <Zone
          top={cards.length > 0}
          left={cards.length > 0}
          color={cards.length === 0 && 'rgba(100, 100, 100, 0.5)'}
          popout={action.type === 'TAKE_CARD'}
          onMouseUp={this.onPlaceCard.bind(this)}
        >
          {cards.length === 0 && 'Tag kort ved at trække dem herhen fra bunken'}
          <Hand>
            {cards.map((card, index) => (
              <Card
                key={index}
                bg={this.getCardBg(card)}
                onMouseDown={() => this.onMoveCard(card, index)}
                selected={
                  (action.type === 'MOVE_CARD' && action.options.index === index) ||
                  myDisplayedCards.find(card => card.cardIndex === index)
                }
              />
            ))}
          </Hand>
        </Zone>
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
