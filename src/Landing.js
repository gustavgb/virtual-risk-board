import React, { useState } from 'react'
import styled from 'styled-components'
import { colors } from 'constants/colors'
import { setColors } from 'api/game'

const Modal = styled.div`
  width: 60vw;
  margin: 3vh auto;
  background-color: #808080;
  border: 1px solid: black;
  padding: 2vh;
  color: white;
`

const Colors = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-gap: 10px;
`

const Color = styled.div`
  padding-bottom: calc(100% - 1vh);
  width: 100%;
  height: 0;
  background-color: ${props => props.color};
  color: ${props => props.theme.invertColor(props.color)};
  border: 0.5vh solid ${props => props.selected ? props.theme.invertColor(props.color) : props.color};
  border-radius: 5px;
  cursor: pointer;
  position: relative;

  &::after {
    content: "${props => props.label}";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-decoration: ${props => props.selected ? 'underline' : 'none'};
  }
`

const Button = styled.button`
  padding: 2vh;
  width: 100%;
  margin-top: 2vh;
  font-size: 20px;
  cursor: pointer;
`

const LandingPrompt = ({
  game: {
    id,
    colors: gameColors
  },
  user: {
    uid
  },
  users
}) => {
  const filteredColors = colors.filter(c => !Object.keys(gameColors).find(key => gameColors[key] === c.hex && gameColors[uid] !== c.hex))
  const members = users.filter(u => u.id !== uid)
  const [selectedColor, selectColor] = useState('')

  return (
    <Modal>
      <h1>Velkommen til det virtuelle risk bræt!</h1>
      <h2>For at komme i gang med spillet skal du lige vælge en farve.</h2>
      <Colors>
        {filteredColors.map(color => (
          <Color
            key={color.hex}
            color={color.hex}
            onClick={() => selectColor(color.hex)}
            label={color.name}
            selected={selectedColor === color.hex}
          />
        ))}
      </Colors>

      <h2>Dine medspillere:</h2>
      {members.length > 0 && (
        <>
          <ul>
            {members.map(user => (
              <li key={user.id}>{user.name} ({user.email})</li>
            ))}
          </ul>
        </>
      )}

      {members.length === 0 && (
        <p>Du er den første spiller i dette spil!</p>
      )}

      <Button disabled={!selectedColor} onClick={() => setColors(id, uid, selectedColor)}>Start spil</Button>
    </Modal>
  )
}

export default LandingPrompt
