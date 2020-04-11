import React from 'react'
import styled from 'styled-components'
import { colors } from 'constants/colors'
import { setColors, startGame } from 'api/game'
import Username from './Components/Username'

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
    colors: gameColors,
    creator
  },
  user: {
    uid
  },
  users
}) => {
  const filteredColors = colors.filter(c => !Object.keys(gameColors).find(key => gameColors[key] === c.hex && gameColors[uid] !== c.hex))
  const selectedColor = colors.find(c => gameColors[uid] === c.hex) || {}

  const isReady = users.filter(u => !gameColors[u.id]).length === 0

  return (
    <Modal>
      <h1>Velkommen til det virtuelle risk bræt!</h1>
      <h2>For at komme i gang med spillet skal du lige vælge en farve.</h2>
      <Colors>
        {filteredColors.map(color => (
          <Color
            key={color.hex}
            color={color.hex}
            onClick={() => setColors(id, uid, color.hex)}
            label={color.name}
            selected={selectedColor.hex === color.hex}
          />
        ))}
      </Colors>

      <h2>Spillere:</h2>
      {users.length > 0 && (
        <>
          <ul>
            {users.map(user => (
              <li key={user.id}><Username color={gameColors[user.id]}>{user.name} ({user.email})</Username></li>
            ))}
          </ul>
        </>
      )}

      {creator === uid && (
        <Button disabled={!isReady} onClick={() => startGame(id)}>Start spil</Button>
      )}
      {creator !== uid && (
        <p><i>Vent på at ejeren af spillet trykker Start</i></p>
      )}
    </Modal>
  )
}

export default LandingPrompt
