import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { getArticlesByMenuIdAPI } from '../services/articles';
import { MenuItem } from '../types';
import { useMenuItems } from '../hooks/features/useMenuItems';
import PublicLayout from '../components/layouts/PublicLayout';


const DynamicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { menuItems } = useMenuItems();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  // We render all articles stacked; no selection needed

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!slug) return;

      // ✅ Nếu menuItems chưa load (array rỗng), giữ loading state và chờ
      if (menuItems.length === 0) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);

        // Find menu item from existing menuItems data
        console.log('Looking for slug:', slug);
        console.log('Available menuItems:', menuItems);
        const foundMenuItem = findMenuItemBySlug(menuItems, slug);
        console.log('Found menu item:', foundMenuItem);

        if (foundMenuItem) {
          setMenuItem(foundMenuItem);
          setError(null); // Clear any previous error

          // Fetch articles for this menu using menuId
          try {
            const articlesResponse = await getArticlesByMenuIdAPI(foundMenuItem.id);
            if (articlesResponse.data?.data?.result) {
              // ✅ Sort articles by order, then by createdAt
              const sortedArticles = articlesResponse.data.data.result
                .filter((article: any) => article.isActive !== false) // Only active articles
                .sort((a: any, b: any) => {
                  if (a.order !== b.order) {
                    return (a.order || 999) - (b.order || 999); // Articles without order go last
                  }
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });
              setArticles(sortedArticles);
          }
        } catch (articleError) {
          console.log('No articles found for this menu, using mock content');
          }
        } else {
          // ✅ menuItems đã load nhưng không tìm thấy → Đây mới là lỗi thật
          setError('Không tìm thấy trang này');
        }

      } catch (error) {
        console.error('Error fetching menu item:', error);
        setError('Không tìm thấy trang này');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [slug, menuItems]);

  // Helper function to find menu item by slug recursively
  const findMenuItemBySlug = (items: MenuItem[], targetSlug: string): MenuItem | null => {
    console.log('findMenuItemBySlug called with:', { items, targetSlug });

    for (const item of items) {
      // Remove leading slash for comparison
      const itemSlug = item.slug?.replace(/^\//, '') || '';
      const cleanTargetSlug = targetSlug.replace(/^\//, '');

      console.log('Comparing:', { itemSlug, cleanTargetSlug, match: itemSlug === cleanTargetSlug });

      if (itemSlug === cleanTargetSlug) {
        console.log('Found match:', item);
        return item;
      }

      // Check children recursively
      if (item.childrenMenu && item.childrenMenu.length > 0) {
        const found = findMenuItemBySlug(item.childrenMenu, targetSlug);
        if (found) return found;
      }
    }
    console.log('No match found');
    return null;
  };






  const renderContent = () => {
    // If we have articles, show them instead of mock content
    if (articles.length > 0) {
      if (articles.length === 1) {
        return <div dangerouslySetInnerHTML={{ __html: articles[0].content }} />;
      } else {
        // Multiple articles - render stacked vertically in order
        return (
          <Box>
            {articles.map((article, index) => (
              <Box key={article.id || index} sx={{ mb: 6 }}>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </Box>
            ))}
          </Box>
        );
      }
    }

    // No articles found - show blank page (trắng tinh)
    return null;
  };

  // Show loading spinner while fetching data
  if (loading || (menuItems.length === 0 && !error)) {
    return (
      <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
      </PublicLayout>
    );
  }

  console.log('Render check:', { error, menuItem, loading, menuItemsLength: menuItems.length });

  // Only show error if: has explicit error OR (menuItems loaded but menuItem not found)
  if (error || (!menuItem && menuItems.length > 0)) {
    console.log('Showing error page because:', { error: !!error, menuItem: !!menuItem, menuItemsLoaded: menuItems.length > 0 });
    return (
      <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy trang này'}
        </Alert>
        <Typography variant="h4" gutterBottom>
          Trang không tồn tại
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
      </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hiển thị đúng content đã lưu: không thêm Container/margin/padding ngoài */}
      <Box sx={{ width: '100%' }}>
        {renderContent()}
      </Box>
    </PublicLayout>
  );
};

export default DynamicMenuPage;
