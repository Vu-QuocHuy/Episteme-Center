
import { render, screen, fireEvent } from '@/utils/test-utils';
import SearchInput from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should render with custom placeholder', () => {
    render(<SearchInput {...defaultProps} placeholder="Custom placeholder" />);

    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    render(<SearchInput {...defaultProps} value="test value" />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toHaveValue('test value');
  });

  it('should call onChange when user types', () => {
    const mockOnChange = jest.fn();
    render(<SearchInput {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'new value' }),
      })
    );
  });

  it('should render search icon', () => {
    render(<SearchInput {...defaultProps} />);

    // Check if search icon is present (Material-UI icons are rendered as SVG)
    const searchIcon = document.querySelector('[data-testid="SearchIcon"]');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should apply custom styling', () => {
    const customSx = { backgroundColor: 'red' };
    render(<SearchInput {...defaultProps} sx={customSx} />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<SearchInput {...defaultProps} size="small" />);
    let input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toBeInTheDocument();

    rerender(<SearchInput {...defaultProps} size="large" />);
    input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toHaveAttribute('role', 'textbox');
  });

  it('should handle fullWidth prop', () => {
    render(<SearchInput {...defaultProps} fullWidth={false} />);

    const input = screen.getByPlaceholderText('Tìm kiếm...');
    expect(input).toBeInTheDocument();
  });

  it('should pass through additional props', () => {
    render(
      <SearchInput
        {...defaultProps}
        data-testid="custom-search-input"
        aria-label="Search for teachers"
      />
    );

    const input = screen.getByTestId('custom-search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Search for teachers');
  });
});
