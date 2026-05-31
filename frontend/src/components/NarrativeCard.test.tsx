import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { streamNarrative } from '../lib/api'
import { NarrativeCard } from './NarrativeCard'

vi.mock('../lib/api', () => ({
  streamNarrative: vi.fn(),
}))

const streamNarrativeMock = vi.mocked(streamNarrative)

describe('NarrativeCard', () => {
  beforeEach(() => {
    streamNarrativeMock.mockReset()
  })

  it('does not request a narrative without a selected commit', () => {
    render(<NarrativeCard repoId={7} commitSha={null} />)

    expect(screen.getByRole('button', { name: /compile intelligence narrative/i })).toBeDisabled()
    expect(streamNarrativeMock).not.toHaveBeenCalled()
  })

  it('streams narrative text and renders provider metadata when complete', async () => {
    const user = userEvent.setup()
    streamNarrativeMock.mockImplementation(async (_repoId, _sha, onChunk) => {
      onChunk({ token: 'Risk ', done: false })
      onChunk({ token: 'is controlled.', done: false })
      onChunk({
        done: true,
        explanation: 'Risk is controlled.',
        tokens_total: 42,
        cost_usd: 0.00123,
        cached: true,
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
      })
    })

    render(<NarrativeCard repoId={7} commitSha="abcdef123456" />)

    await user.click(screen.getByRole('button', { name: /compile intelligence narrative/i }))

    expect(await screen.findByText('Risk is controlled.')).toBeInTheDocument()
    expect(streamNarrativeMock).toHaveBeenCalledWith(7, 'abcdef123456', expect.any(Function))
    expect(screen.getByText('Claude Sonnet')).toBeInTheDocument()
    expect(screen.getByText('Cost: $0.00123')).toBeInTheDocument()
    expect(screen.getByText('Tokens: 42')).toBeInTheDocument()
    expect(screen.getByText('CACHED')).toBeInTheDocument()
  })

  it('shows stream callback errors and lets the user return to idle', async () => {
    const user = userEvent.setup()
    streamNarrativeMock.mockImplementation(async (_repoId, _sha, onChunk) => {
      onChunk({ done: false, error: 'LLM budget exceeded' })
    })

    render(<NarrativeCard repoId={7} commitSha="abcdef123456" />)

    await user.click(screen.getByRole('button', { name: /compile intelligence narrative/i }))

    expect(await screen.findByText('Narrative Generation Failed')).toBeInTheDocument()
    expect(screen.getByText('LLM budget exceeded')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByRole('button', { name: /compile intelligence narrative/i })).toBeEnabled()
  })

  it('shows request failures from the streaming API', async () => {
    const user = userEvent.setup()
    streamNarrativeMock.mockRejectedValue(new Error('Narrative stream failed (500)'))

    render(<NarrativeCard repoId={7} commitSha="abcdef123456" />)

    await user.click(screen.getByRole('button', { name: /compile intelligence narrative/i }))

    await waitFor(() => {
      expect(screen.getByText('Narrative stream failed (500)')).toBeInTheDocument()
    })
    expect(screen.getByText('Narrative Generation Failed')).toBeInTheDocument()
  })
})
