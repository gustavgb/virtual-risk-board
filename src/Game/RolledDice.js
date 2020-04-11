import React, { Component } from 'react'
import styled from 'styled-components'
import { pushToLog, removeDice } from 'api/game'
import Dice from './Components/Dice'

const DiceContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 50vw;
`

const Header = styled.div`
  color: white;
`

const DiscardButton = styled.button`
  padding: 20px 30px;
  margin: 10px 0;
  width: 100%;
  display: block;
  background-color: red;
  border: 0;
  font-size: 20px;
  color: white;
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
    const { game: { id, dice }, user: { uid, name } } = this.props
    removeDice(id, uid)
    this.pushToLog(
      'DISCARD_DICE',
      {
        user: name,
        dice: dice[uid]
      }
    )
  }

  render () {
    const { game: { dice, id: gameId }, users, user: { uid } } = this.props

    return (
      Object.keys(dice).map(userId => {
        const rolledDice = dice[userId]
        const user = users.find(u => u.id === userId)
        const isOwnDice = userId === uid

        return (
          <React.Fragment key={`rolledDice${userId}`}>
            <Header>
              <h2>{uid === userId ? 'Du har kastet' : `${user.name} har kastet`} {rolledDice.length} terninger</h2>
              {isOwnDice && (
                <DiscardButton onClick={() => removeDice(gameId, uid)}>Fjern terningerne</DiscardButton>
              )}
            </Header>
            <DiceContainer>
              {rolledDice.map((diceValue, index) => (
                <Dice key={`dice${index}`}>{diceValue}</Dice>
              ))}
            </DiceContainer>
          </React.Fragment>
        )
      })
    )
  }
}

export default RolledDice
