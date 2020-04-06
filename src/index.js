import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App'
import bgImg from 'images/bg.jpg'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { BrowserRouter } from 'react-router-dom'
import theme from 'theme'
import store from 'store'
import { Provider } from 'react-redux'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 1.6rem;
    background-image: url(${bgImg});
    background-size: 100vw 100vh;
    background-position: center;
    background-attachment: fixed;

    & * {
      box-sizing: border-box;
    }
  }

  html {
    font-size: 62.5%;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
