import React, { useState, useCallback, useEffect } from 'react'

import { auth, firestore } from 'api'
import styled from 'styled-components'

const Root = styled.div`
  width: 30rem;
  margin: 0 auto;
  padding-top 10rem;
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

`

const Error = styled.p`
  color: red;
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

  const login = useCallback(() => {
    auth.signInWithEmailAndPassword(email, password)
      .catch(err => setError(err.code))
  }, [email, password])

  const register = useCallback(() => {
    Promise.all([
      auth.createUserWithEmailAndPassword(email, password),
      firestore.collection('users').doc(email).set({
        email,
        name
      })
    ]).catch(err => setError(err.code))
  }, [email, password, name])

  const submit = useCallback((e) => {
    e.preventDefault()

    switch (mode) {
      case 'LOGIN':
        return login()
      case 'REGISTER':
        return register()
      default:
        console.warn('Mode ' + mode + ' invalid')
    }
  }, [login, mode, register])

  return (
    <Root>
      <form onSubmit={submit}>
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
      </form>
    </Root>
  )
}

export default Login
