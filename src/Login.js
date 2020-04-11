import React, { useState, useCallback, useEffect } from 'react'

import styled from 'styled-components'
import logo from 'images/card_back.png'
import { register, login } from 'api/user'

const Root = styled.form`
  width: 50rem;
  margin: 0 auto;
  padding: 10rem;
  margin-top: 5rem;
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 5px;
  text-align: center;
`

const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  display: block;
  margin: 2rem 0;
`

const Button = styled.button`
  background: transparent;
  padding: 0;
  border: 0;
  margin-top: 3rem;
  color: white;

  &:hover {
    text-decoration: underline;
  }
`

const SubmitButton = styled.button.attrs({
  type: 'submit'
})`
  width: 100%;
  margin: 2rem 0;
  display: block;
`

const Header = styled.h1`
  color: white;
`

const Error = styled.p`
  background-color: darkred;
  color: white;
`

const Logo = styled.img`
  width: 100%;
`

const Login = () => {
  const [mode, setMode] = useState('LOGIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (error !== '') {
      setError('')
    }
    // eslint-disable-next-line
  }, [mode])

  const onLogin = useCallback(() => {
    login(email, password)
      .catch(err => setError(err.message))
  }, [email, password])

  const onRegister = useCallback(() => {
    register(name, email, password)
      .catch(err => setError(err.message))
  }, [email, password, name])

  const submit = useCallback((e) => {
    e.preventDefault()

    switch (mode) {
      case 'LOGIN':
        return onLogin()
      case 'REGISTER':
        return onRegister()
      default:
        console.warn('Mode ' + mode + ' invalid')
    }
  }, [onLogin, mode, onRegister])

  return (
    <Root onSubmit={submit}>
      <Logo src={logo} />
      <Header>
        {mode === 'LOGIN' && 'Log ind'}
        {mode === 'REGISTER' && 'Opret bruger'}
      </Header>
      {mode === 'REGISTER' && (
        <Input placeholder='Navn' value={name} onChange={({ target: { value } }) => setName(value)} />
      )}
      <Input placeholder='Email' value={email} onChange={({ target: { value } }) => setEmail(value)} />
      <Input placeholder='Password' value={password} type='password' onChange={({ target: { value } }) => setPassword(value)} />
      <SubmitButton>
        {mode === 'LOGIN' && 'Log ind'}
        {mode === 'REGISTER' && 'Opret bruger'}
      </SubmitButton>
      {mode === 'LOGIN' && <Button onClick={() => setMode('REGISTER')}>Opret bruger i stedet</Button>}
      {mode === 'REGISTER' && <Button onClick={() => setMode('LOGIN')}>Log ind i stedet</Button>}
      {!!error && <Error>{error}</Error>}
    </Root>
  )
}

export default Login
