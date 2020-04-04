import React, { Component } from 'react'
import './App.css'

import styled, { ThemeProvider } from 'styled-components'
import Canvas from './Canvas'

const Root = styled.div`
  background-color: #222;
  width: 100vw;
  height: 100vh;
`

const theme = {}

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      width: 0,
      height: 0
    }
  }

  componentDidMount () {
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight

    const aspect = 750 / 519

    let width, height

    if (innerWidth > innerHeight * aspect) {
      height = innerHeight
      width = innerHeight * aspect
    } else {
      width = innerWidth
      height = innerWidth / aspect
    }

    this.setState({
      width,
      height
    })
  }

  render () {
    const {
      width,
      height
    } = this.state

    return (
      <ThemeProvider theme={theme}>
        <Root>
          <Canvas width={width} height={height} />
        </Root>
      </ThemeProvider>
    )
  }
}

export default App
