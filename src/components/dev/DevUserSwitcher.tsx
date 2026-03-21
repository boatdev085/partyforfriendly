'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'

const DEV_USERS = [
  { id: '6141de95-a2b7-4675-914e-92cdbd734296', name: 'Dev User 1 🎮' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Test User 2 🕹️' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'Test User 3 🎯' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000003', name: 'Test User 4 🏆' },
]

const DEFAULT_USER_ID = DEV_USERS[0].id

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : undefined
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400`
}

const Container = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  font-family: monospace;
  font-size: 12px;
`

const ToggleButton = styled.button`
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-family: monospace;
  font-size: 12px;
  width: 100%;
  text-align: left;

  &:hover {
    background: #6d28d9;
  }
`

const Panel = styled.div`
  background: #1a1a2e;
  border: 1px solid #7c3aed;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 4px;
  min-width: 180px;
`

const Label = styled.div`
  color: #a78bfa;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`

const UserButton = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  background: ${({ $active }) => ($active ? '#7c3aed' : 'transparent')};
  color: ${({ $active }) => ($active ? 'white' : '#d1d5db')};
  border: 1px solid ${({ $active }) => ($active ? '#7c3aed' : '#374151')};
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 4px;
  cursor: pointer;
  font-family: monospace;
  font-size: 11px;

  &:hover {
    background: ${({ $active }) => ($active ? '#6d28d9' : '#374151')};
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export default function DevUserSwitcher() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(DEFAULT_USER_ID)

  useEffect(() => {
    const cookieVal = getCookie('dev-user-id')
    if (cookieVal) setActiveId(cookieVal)
  }, [])

  const selectUser = (id: string) => {
    setCookie('dev-user-id', id)
    setActiveId(id)
  }

  const activeUser = DEV_USERS.find((u) => u.id === activeId)

  return (
    <Container>
      {open && (
        <Panel>
          <Label>Dev User</Label>
          {DEV_USERS.map((user) => (
            <UserButton
              key={user.id}
              $active={user.id === activeId}
              onClick={() => selectUser(user.id)}
            >
              {user.name}
            </UserButton>
          ))}
        </Panel>
      )}
      <ToggleButton onClick={() => setOpen((v) => !v)}>
        {open ? '✕ ' : '👤 '}{activeUser?.name ?? 'Dev User'}
      </ToggleButton>
    </Container>
  )
}
