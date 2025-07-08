import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Test input" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />)

    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')

    expect(label).toBeInTheDocument()
    expect(input).toHaveAttribute('id')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  it('applies correct variant styles', () => {
    const { rerender } = render(<Input variant="default" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-neutral-200')

    rerender(<Input variant="error" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')

    rerender(<Input variant="success" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-green-500')
  })

  it('applies correct size styles', () => {
    const { rerender } = render(<Input size="sm" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-8')

    rerender(<Input size="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-10')

    rerender(<Input size="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('h-12')
  })

  it('displays error message', () => {
    render(<Input error="This field is required" />)

    const input = screen.getByRole('textbox')
    const error = screen.getByRole('alert')

    expect(error).toHaveTextContent('This field is required')
    expect(input).toHaveClass('border-red-500')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('error')
    )
  })

  it('displays helper text', () => {
    render(<Input helper="Enter at least 8 characters" />)

    const helper = screen.getByText('Enter at least 8 characters')
    const input = screen.getByRole('textbox')

    expect(helper).toBeInTheDocument()
    expect(helper).toHaveClass('text-neutral-500')
    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('helper')
    )
  })

  it('prioritizes error over helper text', () => {
    render(
      <Input error="This field is required" helper="This should not show" />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('This should not show')).not.toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input label="Disabled" disabled />)

    const input = screen.getByRole('textbox')
    const label = screen.getByText('Disabled')

    expect(input).toBeDisabled()
    expect(input).toHaveClass('opacity-50')
    expect(label).toHaveClass('text-neutral-400')
  })

  it('applies full width class', () => {
    render(<Input fullWidth />)
    const container = screen.getByRole('textbox').closest('div')
    expect(container).toHaveClass('w-full')
  })

  it('renders with icons', () => {
    const leftIcon = <span data-testid="left-icon">←</span>
    const rightIcon = <span data-testid="right-icon">→</span>

    render(<Input leftIcon={leftIcon} rightIcon={rightIcon} />)

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('adjusts padding with icons', () => {
    const leftIcon = <span>←</span>
    const rightIcon = <span>→</span>

    const { rerender } = render(<Input leftIcon={leftIcon} size="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('pl-12')

    rerender(<Input rightIcon={rightIcon} size="md" />)
    expect(screen.getByRole('textbox')).toHaveClass('pr-12')
  })

  it('handles input events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test')
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalled()

    await user.tab()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('passes through additional props', () => {
    render(
      <Input data-testid="custom-input" maxLength={50} autoComplete="email" />
    )

    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('maxLength', '50')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      'type',
      'password'
    )

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('generates unique IDs for multiple inputs', () => {
    render(
      <div>
        <Input label="First" />
        <Input label="Second" />
      </div>
    )

    const firstInput = screen.getByLabelText('First')
    const secondInput = screen.getByLabelText('Second')

    expect(firstInput.id).toBeDefined()
    expect(secondInput.id).toBeDefined()
    expect(firstInput.id).not.toBe(secondInput.id)
  })

  it('creates snapshot', () => {
    const { container } = render(<Input placeholder="Test input" />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('creates snapshot with label and error', () => {
    const { container } = render(
      <Input
        label="Username"
        error="Required field"
        placeholder="Enter username"
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('creates snapshot with icons', () => {
    const { container } = render(
      <Input
        leftIcon={<span>🔍</span>}
        rightIcon={<span>✕</span>}
        placeholder="Search..."
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
