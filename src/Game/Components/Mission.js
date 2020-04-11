import React, { useState } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  margin: 2rem 0;
  width: 100%;
`

const Input = styled.input`
  padding: 1rem;
  border-radius: 3px;
  flex-grow: 1;
`

const Button = styled.button`
  padding: 1rem;
  border-radius: 3px;
  margin-left: 1rem;
`

const MissionText = styled.p`
  flex-grow: 1;
  margin: 0;
`

const Mission = ({
  onSave,
  onDelete,
  mission,
  canEdit
}) => {
  const [value, setValue] = useState(mission)
  const [edit, setEdit] = useState(false)

  const handleSave = () => {
    onSave(value)
    setEdit(false)
  }

  const handleEdit = () => {
    setValue(mission)
    setEdit(true)
  }

  const handleDelete = () => {
    if (window.confirm('Slet denne mission?')) {
      onDelete()
    }
  }

  return (
    <Root>
      {edit && (
        <>
          <Input
            value={value}
            onChange={({ target: { value } }) => setValue(value)}
          />
          <Button onClick={handleSave}>
            Gem
          </Button>
        </>
      )}
      {!edit && (
        <>
          <MissionText>{mission}</MissionText>
          {canEdit && (
            <>
              <Button
                onClick={handleEdit}
              >
                Ændre
              </Button>
              <Button onClick={handleDelete}>
                Slet
              </Button>
            </>
          )}
        </>
      )}
    </Root>
  )
}

export default Mission
