import { useState, useEffect } from 'react';
import {
  getHomeContentByIdAPI,
  getHomeContentBySectionAPI
} from '../../services/api';
import { HomeContent, HomeSection } from '../../types';

interface UseHomeContentManagementReturn {
  homeContent: HomeContent[];
  activeContent: HomeSection;
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sectionFilter: string;
  setSectionFilter: (section: string) => void;
  fetchHomeContent: (pageNum?: number) => Promise<void>;
  fetchActiveContent: () => Promise<void>;
  fetchContentBySection: (section: string) => Promise<HomeContent[]>;
  fetchContentById: (id: string) => Promise<HomeContent>;
  handlePageChange: (event: React.SyntheticEvent, value: number) => void;
  resetFilters: () => void;
}

export const useHomeContentManagement = (): UseHomeContentManagementReturn => {
  const [homeContent, setHomeContent] = useState<HomeContent[]>([]);
  const [activeContent, setActiveContent] = useState<HomeSection>({
    hero: [],
    about: [],
    services: [],
    features: [],
    testimonials: [],
    contact: [],
    footer: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchHomeContent = async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      console.log('🏠 Using mock home content data (API not implemented yet)');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Import mock data dynamically to avoid circular dependencies
      const { mockHomeContent } = await import('../../utils/mockData');

      // Filter by search query
      let filteredContent = mockHomeContent;
      if (debouncedSearch) {
        filteredContent = mockHomeContent.filter(item =>
          item.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }

      // Filter by section
      if (sectionFilter) {
        filteredContent = filteredContent.filter(item => item.section === sectionFilter);
      }

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedContent = filteredContent.slice(startIndex, endIndex);

      setHomeContent(paginatedContent);
      setTotalPages(Math.ceil(filteredContent.length / itemsPerPage));

      console.log('✅ Mock home content loaded successfully:', {
        count: paginatedContent.length,
        totalPages: Math.ceil(filteredContent.length / itemsPerPage),
        totalItems: filteredContent.length
      });
    } catch (error: any) {
      console.error('❌ Error loading mock home content:', error);
      setError('Có lỗi xảy ra khi tải nội dung trang chủ');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveContent = async (): Promise<void> => {
    try {
      console.log('🏠 Loading active home content from mock data...');

      // Import mock data dynamically
      const { mockHomeContent } = await import('../../utils/mockData');

      // Filter active content and group by sections
      const activeContent = mockHomeContent.filter(item => item.isActive);

      const groupedContent: HomeSection = {
        hero: activeContent.filter((item: HomeContent) => item.section === 'hero'),
        about: activeContent.filter((item: HomeContent) => item.section === 'about'),
        services: activeContent.filter((item: HomeContent) => item.section === 'services'),
        features: activeContent.filter((item: HomeContent) => item.section === 'features'),
        testimonials: activeContent.filter((item: HomeContent) => item.section === 'testimonials'),
        contact: activeContent.filter((item: HomeContent) => item.section === 'contact'),
        footer: activeContent.filter((item: HomeContent) => item.section === 'footer')
      };

      // Sort by order within each section
      Object.keys(groupedContent).forEach(section => {
        groupedContent[section as keyof HomeSection].sort((a, b) => a.order - b.order);
      });

      setActiveContent(groupedContent);
      console.log('✅ Active home content loaded successfully:', groupedContent);
    } catch (error: any) {
      console.error('❌ Error loading active home content:', error);
      setError('Có lỗi xảy ra khi tải nội dung trang chủ');
    }
  };

  const fetchContentBySection = async (section: string): Promise<HomeContent[]> => {
    try {
      const response = await getHomeContentBySectionAPI(section);
      if (response && response.data) {
        return response.data.filter((item: HomeContent) => item.isActive).sort((a: HomeContent, b: HomeContent) => a.order - b.order);
      }
      return [];
    } catch (error) {
      console.error('Error fetching content by section:', error);
      return [];
    }
  };

  const fetchContentById = async (id: string): Promise<HomeContent> => {
    try {
      const response = await getHomeContentByIdAPI(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      throw error;
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number): void => {
    setPage(value);
  };

  const resetFilters = (): void => {
    setSearchQuery('');
    setSectionFilter('');
  };

  // Fetch content when dependencies change
  useEffect(() => {
    fetchHomeContent(page);
  }, [page, debouncedSearch, sectionFilter]);

  // Fetch active content on mount
  useEffect(() => {
    fetchActiveContent();
  }, []);

  return {
    homeContent,
    activeContent,
    loading,
    error,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    sectionFilter,
    setSectionFilter,
    fetchHomeContent,
    fetchActiveContent,
    fetchContentBySection,
    fetchContentById,
    handlePageChange,
    resetFilters,
  };
};
