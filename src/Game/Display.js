import React, { memo } from 'react'
import styled from 'styled-components'
import DisplayedCards from 'Game/DisplayedCards'
import RolledDice from 'Game/RolledDice'

const Overlay = styled.div`
  grid-area: display;
  z-index: 100;
  background-color: rgba(100, 100, 100, 0.4);
  color: white;
  font-size: 25px;
  user-select: none;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rem 3rem;
  width: 30vw;
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
      <RolledDice dice={game.display.dice} {...props} />
      <DisplayedCards cards={game.display.cards} {...props} />
    </Overlay>
  )
}, (prevProps, nextProps) => (
  prevProps.game.timestamp === nextProps.game.timestamp
))

export default OverlayMessages
