import React from 'react'
import styled from 'styled-components'
import { colors } from 'constants/colors'
import { setColors } from 'api/game'

const Modal = styled.div`
  width: 20vw;
  min-height: 20vh;
  position: fixed;
  z-index: 1000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #808080;
  border: 1px solid: black;
  padding: 2vh;
`

const Color = styled.div`
  padding: 2vh;
  background-color: ${props => props.color};
  color: ${props => props.theme.invertColor(props.color)};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const ColorPicker = ({ game: { id, colors: gameColors }, user: { uid } }) => {
  const filteredColors = colors.filter(c => !Object.keys(gameColors).find(key => gameColors[key] === c.hex && gameColors[uid] !== c.hex))

  return (
    <Modal>
      Vælg en farve:
      {filteredColors.map(color => (
        <Color key={color.hex} color={color.hex} onClick={() => setColors(id, uid, color.hex)}>{color.name}</Color>
      ))}
    </Modal>
  )
}

export default ColorPicker
