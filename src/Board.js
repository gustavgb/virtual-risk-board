import React, { Component } from 'react'
import styled from 'styled-components'
import boardImg from 'images/board.svg'
import bgImg from 'images/bg.jpg'
import { countries } from 'countries'

const Root = styled.div`
  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  width: 100vw;
  height: 100vh;

  &::after {
    content: "";
    clear: both;
    display: table;
  }
`

const CanvasEl = styled.canvas`
  background-image: url(${boardImg});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: block;
  left: calc(50% - ${props => props.width / 2}px);
  top: calc(50% - ${props => props.height / 2}px);
  position: absolute;
`

const CanvasContainer = styled.div`
  float: left;
  position: relative;
  width: calc(100% - 30rem);
  height: 100%;
`

const Sidebar = styled.div`
  width: 30rem;
  height: 100vh;
  overflow-y: auto;
  float: left;
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

    this._onMouseDown = this.onMouseDown.bind(this)
    this._onResize = this.onResize.bind(this)
  }

  componentDidMount () {
    if (this.canvas.current) {
      this.ctx = this.canvas.current.getContext('2d')
    }
    this.renderCanvas()

    window.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('resize', this._onResize)

    this.onResize()
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      prevState.mouseX !== this.state.mouseX ||
      prevState.mouseY !== this.state.mouseY ||
      prevState.width !== this.state.width ||
      prevState.height !== this.state.height
    ) {
      this.renderCanvas()
    }
  }

  onResize () {
    const innerWidth = window.innerWidth - 300
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

  onMouseDown (e) {
    const rect = this.canvas.current.getBoundingClientRect()

    this.setState({
      mouseX: e.clientX - rect.x,
      mouseY: e.clientY - rect.y
    })
  }

  renderCanvas () {
    const ctx = this.ctx
    const {
      width,
      height,
      mouseX,
      mouseY
    } = this.state

    ctx.clearRect(0, 0, width, height)

    countries.forEach(country => {
      ctx.fillStyle = 'green'
      ctx.beginPath()
      ctx.arc(country.x, country.y, 20, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.font = '15px sans-serif'
      ctx.fillStyle = 'white'
      ctx.fillText(country.name, country.x, country.y)
    })
    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.arc(mouseX, mouseY, 20, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  render () {
    const {
      width,
      height,
      mouseX,
      mouseY
    } = this.state

    return (
      <Root>
        <Sidebar>x: {mouseX}, y: {mouseY}</Sidebar>
        <CanvasContainer>
          <CanvasEl ref={this.canvas} width={width} height={height} />
        </CanvasContainer>
      </Root>
    )
  }
}

export default Canvas
