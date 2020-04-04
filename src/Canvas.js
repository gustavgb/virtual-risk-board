import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from './board.svg'

const Root = styled.div`
  background-color: #222;
  width: 100vw;
  height: 100vh;
`

const CanvasEl = styled.canvas`
  background-image: url(${boardImg});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`

class Canvas extends Component {
  constructor (props) {
    super(props)

    this.canvas = React.createRef()
    this.ctx = null

    this.state = {
      mouseX: 0,
      mouseY: 0,
      width: 0,
      height: 0
    }

    this._onMouseMove = this.onMouseMove.bind(this)
  }

  componentDidMount () {
    if (this.canvas.current) {
      this.ctx = this.canvas.current.getContext('2d')
    }
    this.renderCanvas()

    window.addEventListener('mousemove', this._onMouseMove)

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

  onMouseMove (e) {
    this.setState({
      mouseX: e.clientX,
      mouseY: e.clientY
    })
  }

  renderCanvas () {
    const ctx = this.ctx
    const {
      width,
      height
    } = this.state

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = 'white'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
  }

  render () {
    const {
      width,
      height
    } = this.state

    return (
      <Root>
        <CanvasEl ref={this.canvas} width={width} height={height} />
      </Root>
    )
  }
}

export default Canvas
