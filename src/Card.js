import styled from 'styled-components'

import card0Img from 'images/infantry.png'
import card1Img from 'images/cavalry.png'
import card2Img from 'images/artillery.png'
import card from 'images/card.png'

const getCardBg = (card) => {
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

const Card = styled.div`
  background-image: url(${props => getCardBg(props.type)}), url(${card});
  background-repeat: no-repeat, no-repeat;
  background-size: contain, 100% 100%;
  background-position: center, center;
  width: ${props => props.width || '100%'};
  height: 0;
  padding-bottom: 154.24164524421593%;
  opacity: ${props => props.selected ? '0.5' : '1'};
  position: relative;


  &::after {
    content: "${props => props.label}";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 90%;
    color: black;
  }
`

export default Card
