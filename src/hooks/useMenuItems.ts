import { useState, useEffect } from 'react';
import { getAllMenusAPI } from '../services/api';
import { MenuItem } from '../types';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllMenusAPI();
      if (response.data?.data) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Lỗi khi tải menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform menu items for navigation
  const transformMenuItems = (items: MenuItem[]): any[] => {
    return items
      .filter(item => item.isActive)
      .map(item => ({
        key: item.sectionId,
        label: item.label,
        children: item.children ? transformMenuItems(item.children) : undefined,
      }));
  };

  // Get active menu items for navigation
  const getActiveMenuItems = () => {
    return transformMenuItems(menuItems);
  };

  // Get menu item by slug
  const getMenuItemBySlug = (slug: string): MenuItem | null => {
    const findItem = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.sectionId === slug) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findItem(menuItems);
  };

  // Get breadcrumb for a menu item
  const getBreadcrumb = (slug: string): MenuItem[] => {
    const breadcrumb: MenuItem[] = [];

    const findPath = (items: MenuItem[], targetSlug: string, path: MenuItem[] = []): boolean => {
      for (const item of items) {
        const currentPath = [...path, item];

        if (item.sectionId === targetSlug) {
          breadcrumb.push(...currentPath);
          return true;
        }

        if (item.children && findPath(item.children, targetSlug, currentPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(menuItems, slug);
    return breadcrumb;
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    getActiveMenuItems,
    getMenuItemBySlug,
    getBreadcrumb,
  };
};
