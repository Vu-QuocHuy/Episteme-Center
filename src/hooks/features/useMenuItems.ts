import { useState, useEffect } from 'react';
import { MenuItem } from '../../types';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        // Import mock data dynamically to avoid circular dependencies
        const { mockMenuItems } = await import('../../utils/mockData');
        setMenuItems(mockMenuItems);
      } catch (error) {
        console.error('Error loading menu items:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, loading };
};
