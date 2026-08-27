import { render, screen, fireEvent } from '@testing-library/react';
import WizardButton from '../WizardButton';

// Mock CSS imports
jest.mock('../../index.css', () => ({}));

const defaultProps = {
  darkTextColor: '',
  darkButtonColor: '',
  onClick: jest.fn(),
  children: 'Test Button',
};

describe('WizardButton', () => {
  it('renders the button with children', () => {
    render(<WizardButton {...defaultProps} />);

    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('has correct button attributes', () => {
    render(<WizardButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('wizard-btn');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<WizardButton {...defaultProps} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies dark mode text color', () => {
    render(<WizardButton {...defaultProps} darkTextColor="#333" />);

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: '#333' });
  });

  it('applies dark mode button color', () => {
    render(<WizardButton {...defaultProps} darkButtonColor="#666" />);

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: '#666' });
  });

  it('renders with different content types', () => {
    render(
      <WizardButton {...defaultProps}>
        <span>Icon</span>
        <span>Text</span>
      </WizardButton>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});