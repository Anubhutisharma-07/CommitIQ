import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

const originalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(window, 'localStorage', originalStorage)
  } else {
    Reflect.deleteProperty(window, 'localStorage')
  }
})

describe('ThemeToggle', () => {
  it('still switches themes when browser storage is unavailable', async () => {
    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage unavailable')
      }),
    }
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: unavailableStorage,
    })

    const user = userEvent.setup()
    render(<ThemeToggle />)

    const toggle = screen.getByRole('button', { name: 'Switch to light mode' })
    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
    expect(unavailableStorage.getItem).toHaveBeenCalledWith('theme')
    expect(unavailableStorage.setItem).toHaveBeenCalled()
  })
})
