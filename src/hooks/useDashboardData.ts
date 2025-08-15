// Custom hook for dashboard data fetching and state management
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardHookReturn<T> {
  data: T;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

interface UseDashboardDataOptions<T> {
  initialData: T;
  fetchFunction: (userId?: string) => Promise<{ data: T }>;
  dependencies?: any[];
}

export function useDashboardData<T>({
  initialData,
  fetchFunction,
  dependencies = []
}: UseDashboardDataOptions<T>): DashboardHookReturn<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const userId = user?.id || user?.teacherId || user?.studentId || user?.parentId;
      const response = await fetchFunction(userId);

      if (response?.data) {
        setData(response.data);
      }
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export default useDashboardData;
