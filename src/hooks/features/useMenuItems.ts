import { useState, useEffect } from 'react';
import { getAllMenusAPI } from '../../services/api';
import { NavigationMenuItem } from '../../types';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllMenusAPI();
        if (response.data?.data) {
          // Transform API data to match the navigation format
          const transformedItems = response.data.data.map((item: any) => ({
            id: item.id,
            label: item.title,
            sectionId: item.slug, // Use slug as sectionId for now
            order: item.order,
            isActive: item.isActive,
            isExternal: false, // Default to false, can be extended later
            externalUrl: '',
            children: item.children ? item.children.map((child: any) => ({
              id: child.id,
              label: child.title,
              sectionId: child.slug,
              order: child.order,
              isActive: child.isActive,
              isExternal: false,
              externalUrl: '',
              children: []
            })) : []
          }));
          setMenuItems(transformedItems);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
        setError('Failed to load menu items');
        // Fallback to empty array
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, loading, error };
};
