import styled, { keyframes } from 'styled-components'

const rollIn = keyframes`
  0% {
    transform: rotate(0deg) scale3d(0, 0, 1);
  }
  100% {
    transform: rotate(1080deg) scale3d(1, 1, 1);
  }
`

const Dice = styled.div`
  width: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: black;
  font-weight: bold;
  margin: 1rem;
  animation: ${rollIn} 1s ease-out;

  &::after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`

export default Dice
