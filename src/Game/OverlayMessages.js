import React, { memo } from 'react'
import styled from 'styled-components'
import DisplayedCards from 'Game/DisplayedCards'
import RolledDice from 'Game/RolledDice'

const Overlay = styled.div`
  grid-area: board;
  z-index: 100;
  background-color: rgba(100, 100, 100, 0.7);
  color: white;
  font-size: 25px;
  user-select: none;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rem;
`

const OverlayMessages = memo((props) => {
  const {
    game,
    onChangeAction
  } = props

  if (
    !game.display.cards &&
    !game.display.dice
  ) {
    return null
  }

  return (
    <Overlay onMouseUp={() => onChangeAction({})}>
      <DisplayedCards cards={game.display.cards} {...props} />
      <RolledDice dice={game.display.dice} {...props} />
    </Overlay>
  )
}, (prevProps, nextProps) => (
  prevProps.game.timestamp === nextProps.game.timestamp
))

export default OverlayMessages
