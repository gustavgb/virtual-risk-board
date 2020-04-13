import React, { Component } from 'react'
import styled from 'styled-components'
import { pushToLog, removeDice, rollDice } from 'api/game'
import Dice from './Components/Dice'

const DiceContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 100%;
`

const Header = styled.div`
  color: white;
`

const Button = styled.button`
  padding: 20px 30px;
  margin: 10px 0;
  width: 100%;
  display: block;
  background-color: ${props => props.color};
  color: ${props => props.theme.invertColor(props.color)};
  border: 0;
  font-size: 20px;
  cursor: pointer;
`

class RolledDice extends Component {
  shouldComponentUpdate (nextProps) {
    return (
      nextProps.game.timestamp !== this.props.game.timestamp
    )
  }

  pushToLog (code, content) {
    const { game: { id }, user: { uid } } = this.props

    pushToLog(id, uid, code, content)
  }

  onDiscard () {
    const { game: { id }, dice, user: { uid, name } } = this.props
    removeDice(id, uid)
    this.pushToLog(
      'DISCARD_DICE',
      {
        user: name,
        dice: dice[uid]
      }
    )
  }

  onRoll (removeOld) {
    const { game: { id }, user: { uid, name } } = this.props
    rollDice(id, uid, removeOld)
    this.pushToLog(
      'ROLL_DICE',
      {
        user: name
      }
    )
  }

  render () {
    const { dice, users, user: { uid } } = this.props

    if (!dice) {
      return null
    }

    return (
      Object.keys(dice).map(userId => {
        const rolledDice = dice[userId]
        const user = users.find(u => u.id === userId)
        const isOwnDice = userId === uid

        return (
          <React.Fragment key={`rolledDice${userId}`}>
            <Header>
              <h2>{uid === userId ? 'Du har kastet' : `${user.name} har kastet`} {rolledDice.length} {rolledDice.length > 1 ? 'terninger' : 'terning'}</h2>
              {isOwnDice && (
                <>
                  <Button
                    onClick={() => this.onRoll()}
                    color='#ddd'
                  >
                    Rul en terning mere
                  </Button>
                  <Button
                    onClick={() => this.onRoll(true)}
                    color='#ddd'
                  >
                    Rul forfra
                  </Button>
                  <Button
                    color='#f00'
                    onClick={this.onDiscard.bind(this)}
                  >
                    Fjern {rolledDice.length > 1 ? 'terningerne' : 'terningen'}
                  </Button>
                </>
              )}
            </Header>
            <DiceContainer>
              {rolledDice.map((dice) => (
                <Dice key={`dice${dice.timestamp}`}>{dice.value}</Dice>
              ))}
            </DiceContainer>
          </React.Fragment>
        )
      })
    )
  }
}

export default RolledDice
