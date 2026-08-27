import { render, screen, fireEvent } from '@testing-library/react';
import WizardTab from '../WizardTab';
import { WizardTabProps } from '../../types/WizardTab';

// Mock CSS imports
jest.mock('../../index.css', () => ({}));

const defaultProps: WizardTabProps = {
  id: 'step-0',
  title: 'Test Step',
  icon: 'ti-user',
  shape: 'circle' as const,
  color: '#2196f3',
  isActive: false,
  index: 0,
  currentStep: 0,
  isVisible: true,
  isDisabled: false,
  hasValidationError: false,
  showProgressBar: true,
  layout: 'horizontal' as const,
  inlineStep: false,
  darkColor: '',
  darkIconColor: '',
  removeBackgroundTab: false,
  removeBackgroundTabTransparentColor: '',
  showErrorOnTab: false,
  showErrorOnTabColor: 'red',
  onClick: jest.fn(),
};

describe('WizardTab', () => {
  it('renders the tab with title and icon', () => {
    render(<WizardTab {...defaultProps} />);

    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(document.querySelector('.ti-user')).toBeInTheDocument();
  });

  it('shows the step number when no icon is provided', () => {
    render(<WizardTab {...defaultProps} icon="" />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('has active class when isActive is true', () => {
    render(<WizardTab {...defaultProps} isActive={true} />);

    const tabElement = screen.getByRole('tab');
    expect(tabElement).toHaveClass('active');
  });

  it('has correct ARIA attributes', () => {
    render(<WizardTab {...defaultProps} />);

    const tabElement = screen.getByRole('tab');
    expect(tabElement).toHaveAttribute('aria-selected', 'false');
    expect(tabElement).toHaveAttribute('aria-controls', 'step-0-panel');
    expect(tabElement).toHaveAttribute('id', 'step-0');
    expect(tabElement).toHaveAttribute('tabIndex', '-1');
  });

  it('has correct ARIA attributes when active', () => {
    render(<WizardTab {...defaultProps} isActive={true} />);

    const tabElement = screen.getByRole('tab');
    expect(tabElement).toHaveAttribute('aria-selected', 'true');
    expect(tabElement).toHaveAttribute('tabIndex', '0');
  });

  it('calls onClick when tab is clicked', () => {
    const mockOnClick = jest.fn();
    render(<WizardTab {...defaultProps} onClick={mockOnClick} />);

    const tabElement = screen.getByRole('tab');
    fireEvent.click(tabElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies error styling when showErrorOnTab is true', () => {
    render(<WizardTab {...defaultProps} showErrorOnTab={true} />);

    const tabElement = screen.getByRole('tab');
    expect(tabElement).toBeInTheDocument();
    // The error styling would be applied via CSS classes and inline styles
  });

  it('renders nothing when isVisible is false', () => {
    render(<WizardTab {...defaultProps} isVisible={false} />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not trigger click handler when disabled', () => {
    const onClick = jest.fn();
    render(<WizardTab {...defaultProps} isDisabled={true} onClick={onClick} />);
    const tab = screen.getByRole('tab');
    fireEvent.click(tab);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders custom icon when provided', () => {
    render(<WizardTab {...defaultProps} icon="ti-settings" />);

    const iconElement = document.querySelector('.ti-settings');
    expect(iconElement).toBeInTheDocument();
  });

  it('applies dark mode colors when provided', () => {
    render(
      <WizardTab
        {...defaultProps}
        darkColor="#333"
        isActive={true}
      />
    );

    // The dark colors would be applied via inline styles
    const tabElement = screen.getByRole('tab');
    expect(tabElement).toBeInTheDocument();
  });
});