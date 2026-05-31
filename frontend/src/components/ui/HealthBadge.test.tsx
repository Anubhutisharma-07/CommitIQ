import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HealthBadge } from './HealthBadge'

describe('HealthBadge', () => {
  it('renders rounded score and positive delta', () => {
    render(<HealthBadge score={72.4} delta={1.24} />)

    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('+1.2')).toBeInTheDocument()
  })

  it('renders negative delta without a plus sign', () => {
    render(<HealthBadge score={38.9} delta={-4.56} />)

    expect(screen.getByText('39')).toBeInTheDocument()
    expect(screen.getByText('-4.6')).toBeInTheDocument()
  })
})
