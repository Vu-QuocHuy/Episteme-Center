
import { render, screen } from '@/utils/test-utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  const defaultProps = {
    loading: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when loading is true', () => {
    render(<LoadingSpinner {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not render when loading is false', () => {
    render(<LoadingSpinner loading={false} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should display custom message', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingSpinner {...defaultProps} message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should render with spinner variant', () => {
    render(<LoadingSpinner {...defaultProps} variant="spinner" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Đang tải...')).not.toBeInTheDocument();
  });

  it('should render with text variant', () => {
    render(<LoadingSpinner {...defaultProps} variant="text" />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('should render with both variant', () => {
    render(<LoadingSpinner {...defaultProps} variant="both" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<LoadingSpinner {...defaultProps} size="small" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    rerender(<LoadingSpinner {...defaultProps} size="large" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should apply custom styling', () => {
    const customSx = { backgroundColor: 'red' };
    render(<LoadingSpinner {...defaultProps} sx={customSx} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<LoadingSpinner {...defaultProps} />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle default props correctly', () => {
    render(<LoadingSpinner loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });
});
