import styled from 'styled-components'

const Username = styled.span`
  color: ${props => props.color ? props.theme.invertColor(props.color) : 'black'};
  background-color: ${props => props.color || 'transparent'};
`

export default Username
