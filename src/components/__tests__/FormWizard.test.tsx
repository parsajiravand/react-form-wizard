import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormWizard, { TabContent } from '../FormWizard';

// Mock CSS imports
jest.mock('../../index.css', () => ({}));

const mockOnComplete = jest.fn();
const mockOnTabChange = jest.fn();

const ChildrenWizard = () => (
  <FormWizard
    title="Test Wizard"
    subtitle="Test Subtitle"
    onComplete={mockOnComplete}
    onTabChange={mockOnTabChange}
  >
    <TabContent title="Step 1" icon="ti-user">
      <h1>Step 1 Content</h1>
      <p>First step content</p>
    </TabContent>
    <TabContent title="Step 2" icon="ti-settings">
      <h1>Step 2 Content</h1>
      <p>Second step content</p>
    </TabContent>
    <TabContent title="Step 3" icon="ti-check">
      <h1>Step 3 Content</h1>
      <p>Third step content</p>
    </TabContent>
  </FormWizard>
);

const SchemaWizard = () => (
  <FormWizard
    title="Schema Wizard"
    schema={{
      initialData: { plan: 'basic' },
      steps: [
        {
          id: 'intro',
          title: 'Intro',
          content: <div>Schema Intro</div>,
        },
        {
          id: 'premium',
          title: 'Premium',
          condition: ({ data }) => data.plan === 'premium',
          content: <div>Premium Content</div>,
        },
        {
          id: 'review',
          title: 'Review',
          validate: () => false,
          content: <div>Schema Review</div>,
        },
      ],
    }}
  />
);

describe('FormWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the wizard with title and subtitle', () => {
    render(<ChildrenWizard />);

    expect(screen.getByText('Test Wizard')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders the first step content by default', () => {
    render(<ChildrenWizard />);

    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.getByText('First step content')).toBeInTheDocument();
  });

  it('navigates to next step when Next button is clicked', async () => {
    render(<ChildrenWizard />);

    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
    });
  });

  it('navigates to previous step when Back button is clicked', async () => {
    render(<ChildrenWizard />);

    // Go to second step first
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    // Now go back
    const backButton = screen.getByText('Back');
    await userEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    });
  });

  it('calls onComplete when Finish button is clicked on last step', async () => {
    render(<ChildrenWizard />);

    // Navigate to last step
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);

    // Click finish
    const finishButton = screen.getByText('Finish');
    await userEvent.click(finishButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onTabChange when navigating between steps', async () => {
    render(<ChildrenWizard />);

    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    expect(mockOnTabChange).toHaveBeenCalledWith({
      prevIndex: 0,
      nextIndex: 1,
      stepId: 'step-2',
    });
  });

  it('supports keyboard navigation with arrow keys', async () => {
    render(<ChildrenWizard />);
    // Focus an element inside wizard so keyboard listener can resolve closest(".react-form-wizard")
    const nextButton = screen.getByText('Next');
    nextButton.focus();

    fireEvent.keyDown(document, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<ChildrenWizard />);

    const wizard = screen.getByRole('region', { name: 'Form Wizard' });
    expect(wizard).toBeInTheDocument();

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toBeInTheDocument();
  });

  it('renders step titles in navigation', () => {
    render(<ChildrenWizard />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('supports schema mode and hides conditional steps when condition is false', async () => {
    render(<SchemaWizard />);

    expect(screen.getByText('Schema Intro')).toBeInTheDocument();
    expect(screen.queryByText('Premium')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Schema Review')).toBeInTheDocument();
  });

  it('blocks submit in schema mode when validation returns false', async () => {
    render(<SchemaWizard />);

    await userEvent.click(screen.getByText('Next'));
    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(screen.getByText('Schema Review')).toBeInTheDocument();
    });
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});