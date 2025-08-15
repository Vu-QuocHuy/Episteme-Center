
import { render, screen, fireEvent } from '@/utils/test-utils';
import FilterSelect from '../FilterSelect';

describe('FilterSelect', () => {
  const mockOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
  ];

  const defaultProps = {
    value: 'all',
    onChange: jest.fn(),
    options: mockOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<FilterSelect {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Tất cả')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(<FilterSelect {...defaultProps} label="Trạng thái" />);

    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<FilterSelect {...defaultProps} placeholder="Chọn trạng thái" />);

    expect(screen.getByText('Chọn trạng thái')).toBeInTheDocument();
  });

  it('should call onChange when option is selected', () => {
    const mockOnChange = jest.fn();
    render(<FilterSelect {...defaultProps} onChange={mockOnChange} />);

    const selectButton = screen.getByRole('button');
    fireEvent.mouseDown(selectButton);

    const option = screen.getByText('Hoạt động');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith('active');
  });

  it('should handle disabled state', () => {
    render(<FilterSelect {...defaultProps} disabled={true} />);

    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeDisabled();
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<FilterSelect {...defaultProps} size="small" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<FilterSelect {...defaultProps} size="medium" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle disabled options', () => {
    const optionsWithDisabled = [
      ...mockOptions,
      { value: 'disabled', label: 'Disabled Option', disabled: true },
    ];

    render(<FilterSelect {...defaultProps} options={optionsWithDisabled} />);

    const selectButton = screen.getByRole('button');
    fireEvent.mouseDown(selectButton);

    const disabledOption = screen.getByText('Disabled Option');
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('should be accessible', () => {
    render(<FilterSelect {...defaultProps} />);

    const selectButton = screen.getByRole('button');
    expect(selectButton).toBeInTheDocument();
    expect(selectButton).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('should apply custom styling', () => {
    const customSx = { backgroundColor: 'red' };
    render(<FilterSelect {...defaultProps} sx={customSx} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle data-testid prop', () => {
    render(<FilterSelect {...defaultProps} data-testid="custom-filter-select" />);

    const selectButton = screen.getByTestId('custom-filter-select');
    expect(selectButton).toBeInTheDocument();
  });
});
