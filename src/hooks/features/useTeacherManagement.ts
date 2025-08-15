import { useState, useEffect, useCallback } from 'react';
import { getAllTeachersAPI, deleteTeacherAPI } from '../../services/api';
import { Teacher, UseManagementReturn } from '../../types';

export const useTeacherManagement = (): UseManagementReturn<Teacher> => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTeachers = useCallback(async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: 10,
        // Note: New API doesn't seem to support name or isActive filters based on Postman
        // ...(debouncedSearch && { name: debouncedSearch }),
        // ...(isActiveFilter && { isActive: isActiveFilter })
      };

      const response = await getAllTeachersAPI(params);
      console.log('📊 Teachers API Response:', response);

      // Handle paginated API response structure similar to students/parents
      if (response && response.data && response.data.data) {
        const { data } = response.data;
        const teachersArray = data.result || [];
        setTeachers(teachersArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);
      } else if (response && response.data) {
        // Fallback for old API structure
        setTeachers(response.data);
        setTotalPages(response.data?.totalPages || 1);
        setTotalRecords(response.data?.totalRecords || 0);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Có lỗi xảy ra khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  }, [debouncedSearch, isActiveFilter]);

  const deleteTeacher = useCallback(async (teacherId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteTeacherAPI(teacherId);
      await fetchTeachers(); // Refresh teacher list
      return { success: true, message: 'Xóa giáo viên thành công!' };
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa giáo viên'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  const handlePageChange = useCallback((_event: any, value: number): void => {
    setPage(value);
  }, []);

  // Fetch teachers when dependencies change
  useEffect(() => {
    fetchTeachers(page);
  }, [page, debouncedSearch, isActiveFilter, fetchTeachers]);

  return {
    data: teachers,
    teachers,
    loading,
    loadingTable,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    isActiveFilter,
    setIsActiveFilter,
    fetchData: fetchTeachers,
    fetchTeachers,
    deleteItem: deleteTeacher,
    deleteTeacher,
    handlePageChange,
  };
};
