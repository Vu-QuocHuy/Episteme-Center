import { useState, useEffect } from 'react';
import { getAllStudentsAPI, deleteStudentAPI } from '../../services/api';
import { Student } from '../../types';

interface UseStudentManagementReturn {
  students: Student[];
  loading: boolean;
  loadingTable: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  parentDetails: Record<string, string>;
  fetchStudents: () => Promise<void>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; message: string }>;
  handlePageChange: (event: React.SyntheticEvent, value: number) => void;
}

export const useStudentManagement = (): UseStudentManagementReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [parentDetails, setParentDetails] = useState<Record<string, string>>({});

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchStudents = async (): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params: any = {
        page: page,
        limit: 10,
      };

      // Handle filters with {} format
      if (debouncedSearch) {
        params.name = debouncedSearch;
      }

      const response = await getAllStudentsAPI(params);

            if (response && response.data && response.data.data) {
        // Handle actual API response structure: { statusCode, message, data: { meta, result } }
        const { data } = response.data;
        const studentsArray = data.result || [];

        setStudents(studentsArray);
        setTotalPages(data.meta?.totalPages || 1);

        // Extract parent information directly from response
        const parentMap: Record<string, string> = {};
        studentsArray.forEach((student: Student) => {
          // Note: API doesn't seem to include parent info in students endpoint
          // Will need to fetch separately or use a different endpoint
          parentMap[student.id] = 'Chưa có thông tin phụ huynh';
        });

        setParentDetails(parentMap);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Có lỗi xảy ra khi tải danh sách học sinh');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  };

  const deleteStudent = async (studentId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteStudentAPI(studentId);
      await fetchStudents(); // Refresh student list
      return { success: true, message: 'Xóa học sinh thành công!' };
    } catch (error: any) {
      console.error('Error deleting student:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh'
      };
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.SyntheticEvent, value: number): void => {
    setPage(value);
  };

  // Fetch students when dependencies change
  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch]);

  return {
    students,
    loading,
    loadingTable,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    parentDetails,
    fetchStudents,
    deleteStudent,
    handlePageChange,
  };
};
