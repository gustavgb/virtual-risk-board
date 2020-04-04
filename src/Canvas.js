import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from './board.svg'

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
      mouseY: 0
    }

    this._onMouseMove = this.onMouseMove.bind(this)
  }

  componentDidMount () {
    if (this.canvas.current) {
      this.ctx = this.canvas.current.getContext('2d')
    }
    this.renderCanvas()

    window.addEventListener('mousemove', this._onMouseMove)
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
    } = this.props

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = 'white'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
  }

  render () {
    const {
      width,
      height
    } = this.props

    return <CanvasEl ref={this.canvas} width={width} height={height} />
  }
}

export default Canvas
