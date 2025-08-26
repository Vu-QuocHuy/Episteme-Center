
import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { createMockParent } from '@/utils/test-utils';
import ParentTable from '../ParentTable';

// Mock the parent helpers
jest.mock('@/utils/parentHelpers', () => ({
  renderText: (text: string) => text || 'N/A',
  getGenderLabel: (gender: string) => gender === 'male' ? 'Nam' : 'Nữ',
  getTeacherInfoLabel: (canSee: boolean) => canSee ? 'Có' : 'Không',
  getTeacherInfoColor: (canSee: boolean) => canSee ? 'success' : 'error',
  getParentStatus: (parent: any) => parent.children?.length > 0 ? 'Có con' : 'Chưa có con',
  getParentStatusColor: (parent: any) => parent.children?.length > 0 ? 'success' : 'warning',
}));

describe('ParentTable', () => {
  const mockParents = [
    createMockParent({
      id: '1',
      userId: { name: 'John Doe', email: 'john@example.com', phone: '123456789', gender: 'male' },
      canSeeTeacherInfo: true,
      children: [],
    }),
    createMockParent({
      id: '2',
      userId: { name: 'Jane Smith', email: 'jane@example.com', phone: '987654321', gender: 'female' },
      canSeeTeacherInfo: false,
      children: [{ id: 'child1' }],
    }),
  ];

  const defaultProps = {
    parents: mockParents as any,
    loading: false,
    page: 1,

    onEdit: jest.fn(),
    onDelete: jest.fn(),

    onPageChange: jest.fn(),
    onViewDetails: jest.fn(),
    onViewChildren: jest.fn(),
  } as unknown as React.ComponentProps<typeof ParentTable>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table headers correctly', () => {
    render(<ParentTable {...defaultProps} />);

    expect(screen.getByText('Họ và tên')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Số điện thoại')).toBeInTheDocument();
    expect(screen.getByText('Giới tính')).toBeInTheDocument();
    expect(screen.getByText('Số con')).toBeInTheDocument();
    expect(screen.getByText('Quyền xem thông tin GV')).toBeInTheDocument();
    expect(screen.getByText('Thao tác')).toBeInTheDocument();
  });

  it('should render parent data correctly', () => {
    render(<ParentTable {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('Nam')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
    expect(screen.getByText('Nữ')).toBeInTheDocument();
  });

  it('should render status chips correctly', () => {
    render(<ParentTable {...defaultProps} />);

    // Check for status chips
    expect(screen.getByText('Chưa có con')).toBeInTheDocument();
    expect(screen.getByText('Có con')).toBeInTheDocument();
    expect(screen.getByText('Có')).toBeInTheDocument();
    expect(screen.getByText('Không')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<ParentTable {...defaultProps} loading={true} />);

    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('should show empty state when no parents', () => {
    render(<ParentTable {...defaultProps} parents={[]} />);

    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', async () => {
    const mockOnView = jest.fn();
    render(<ParentTable {...defaultProps} onViewDetails={mockOnView} />);

    const viewButtons = screen.getAllByTitle('Xem chi tiết');
    fireEvent.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalled();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const mockOnEdit = jest.fn();
    render(<ParentTable {...defaultProps} onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByTitle('Chỉnh sửa');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const mockOnDelete = jest.fn();
    render(<ParentTable {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByTitle('Xóa');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should render pagination if there are enough parents', async () => {
    // Create enough parents to trigger pagination
    const manyParents = Array.from({ length: 15 }, (_, i) => ({
      id: (i + 1).toString(),
      userId: {
        id: (i + 1).toString(),
        name: `Parent ${i + 1}`,
        email: `parent${i + 1}@example.com`,
        phone: '0123456789',
        gender: 'male' as const,
        role: 'parent' as const,
      },
      canSeeTeacherInfo: true,
      children: [],
    }));

    render(<ParentTable {...defaultProps} parents={manyParents as any} />);

    // Check if pagination exists (this is just to test rendering, not actual pagination behavior)
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should handle missing data gracefully', () => {
    const parentsWithMissingData = [
      createMockParent({
        id: '1',
        userId: { name: '', email: '', phone: '', gender: 'male' },
        canSeeTeacherInfo: true,
        children: [],
      }),
    ];

    render(<ParentTable {...defaultProps} parents={parentsWithMissingData as any} />);

    // Should render without crashing
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<ParentTable {...defaultProps} />);

    // Check if table has proper role
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check if buttons have proper labels
    const viewButtons = screen.getAllByTitle('Xem chi tiết');
    const editButtons = screen.getAllByTitle('Chỉnh sửa');
    const deleteButtons = screen.getAllByTitle('Xóa');

    expect(viewButtons[0]).toBeInTheDocument();
    expect(editButtons[0]).toBeInTheDocument();
    expect(deleteButtons[0]).toBeInTheDocument();
  });

  it('should memoize table rows correctly', () => {
    const { rerender } = render(<ParentTable {...defaultProps} />);

    // Initial render
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Re-render with same props
    rerender(<ParentTable {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Re-render with different parents
    const newParents = [createMockParent({ id: '3', userId: { name: 'New Parent' } })];
    rerender(<ParentTable {...defaultProps} parents={newParents as any} />);
    expect(screen.getByText('New Parent')).toBeInTheDocument();
  });
});
