
import { render, screen, fireEvent } from '@/utils/test-utils';
import VirtualList from '../VirtualList';

describe('VirtualList', () => {
  const mockData = Array.from({ length: 1000 }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    description: `Description for item ${index}`,
  }));

  const mockRenderItem = (item: any, index: number) => (
    <div data-testid={`item-${index}`}>
      <span>{item.name}</span>
      <span>{item.description}</span>
    </div>
  );

  const defaultProps = {
    data: mockData,
    height: 400,
    itemHeight: 50,
    renderItem: mockRenderItem,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<VirtualList {...defaultProps} />);

    // Should render only visible items (approximately 8 items for 400px height with 50px item height)
    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeLessThanOrEqual(10);
  });

  it('should render correct number of visible items', () => {
    render(<VirtualList {...defaultProps} />);

    const visibleItems = screen.getAllByTestId(/^item-/);
    const expectedVisibleCount = Math.ceil(400 / 50) + 5; // height/itemHeight + overscan
    expect(visibleItems.length).toBeLessThanOrEqual(expectedVisibleCount);
  });

  it('should handle scroll events', () => {
    render(<VirtualList {...defaultProps} />);

    const container = screen.getByTestId('virtual-list-container');
    fireEvent.scroll(container, { target: { scrollTop: 100 } });

    // Should still render items after scroll
    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('should handle large datasets efficiently', () => {
    const largeData = Array.from({ length: 10000 }, (_, index) => ({
      id: index,
      name: `Large Item ${index}`,
    }));

    render(
      <VirtualList
        {...defaultProps}
        data={largeData}
        renderItem={(item) => <div data-testid={`large-item-${item.id}`}>{item.name}</div>}
      />
    );

    // Should only render visible items, not all 10000
    const visibleItems = screen.getAllByTestId(/^large-item-/);
    expect(visibleItems.length).toBeLessThan(20);
  });

  it('should handle different item heights', () => {
    render(<VirtualList {...defaultProps} itemHeight={100} />);

    const visibleItems = screen.getAllByTestId(/^item-/);
    const expectedVisibleCount = Math.ceil(400 / 100) + 5; // height/itemHeight + overscan
    expect(visibleItems.length).toBeLessThanOrEqual(expectedVisibleCount);
  });

  it('should handle custom overscan', () => {
    render(<VirtualList {...defaultProps} overscan={10} />);

    const visibleItems = screen.getAllByTestId(/^item-/);
    const expectedVisibleCount = Math.ceil(400 / 50) + 10; // height/itemHeight + overscan
    expect(visibleItems.length).toBeLessThanOrEqual(expectedVisibleCount);
  });

  it('should handle empty data', () => {
    render(<VirtualList {...defaultProps} data={[]} />);

    const visibleItems = screen.queryAllByTestId(/^item-/);
    expect(visibleItems.length).toBe(0);
  });

  it('should handle single item', () => {
    const singleItemData = [{ id: 1, name: 'Single Item' }];

    render(
      <VirtualList
        {...defaultProps}
        data={singleItemData}
        renderItem={(item) => <div data-testid="single-item">{item.name}</div>}
      />
    );

    expect(screen.getByTestId('single-item')).toBeInTheDocument();
  });

  it('should apply custom styling', () => {
    const customSx = { backgroundColor: 'red' };
    render(<VirtualList {...defaultProps} sx={customSx} />);

    const container = screen.getByTestId('virtual-list-container');
    expect(container).toBeInTheDocument();
  });

  it('should handle data-testid prop', () => {
    render(<VirtualList {...defaultProps} data-testid="custom-virtual-list" />);

    const container = screen.getByTestId('custom-virtual-list');
    expect(container).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<VirtualList {...defaultProps} />);

    const container = screen.getByTestId('virtual-list-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('role', 'list');
  });

  it('should handle rapid scrolling', () => {
    render(<VirtualList {...defaultProps} />);

    const container = screen.getByTestId('virtual-list-container');

    // Simulate rapid scrolling
    for (let i = 0; i < 10; i++) {
      fireEvent.scroll(container, { target: { scrollTop: i * 100 } });
    }

    // Should still render items after rapid scrolling
    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('should handle window resize', () => {
    render(<VirtualList {...defaultProps} />);

    // Simulate window resize
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });

    window.dispatchEvent(new Event('resize'));

    // Should still render items after resize
    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });
});
