import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { getArticlesByMenuIdAPI } from '../services/articles';
import { MenuItem } from '../types';
import { useMenuItems } from '../hooks/features/useMenuItems';
import PublicLayout from '../components/layouts/PublicLayout';
import ArticlesSidebar from '../components/articles/ArticlesSidebar';
import AllTeachersPage from './AllTeachersPage';


const DynamicMenuPage: React.FC = () => {
  console.log('🚀 DynamicMenuPage component mounted');
  const { slug, parentSlug, childSlug } = useParams<{ slug?: string; parentSlug?: string; childSlug?: string }>();
  console.log('📋 Route params:', { slug, parentSlug, childSlug });
  const { menuItems } = useMenuItems();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  // We render all articles stacked; no selection needed

  // Combine slug from params - support both /:slug and /:parentSlug/:childSlug
  const fullSlug = childSlug ? `${parentSlug}/${childSlug}` : slug;

  console.log('🔍 DynamicMenuPage - fullSlug:', fullSlug, 'slug:', slug, 'parentSlug:', parentSlug, 'childSlug:', childSlug);

  // Check if this is a teacher page FIRST - before any loading/effects
  // This allows teacher page to render immediately without waiting for menuItems
  const normalizedSlug = fullSlug?.toLowerCase().trim().replace(/^\//, '');
  console.log('🔍 DynamicMenuPage - normalizedSlug:', normalizedSlug);
  
  const isTeacherPage = normalizedSlug === 'teacher' || 
    normalizedSlug?.endsWith('/teacher') ||
    normalizedSlug?.startsWith('teacher/') ||
    (menuItem && (
      menuItem.slug?.toLowerCase().trim().replace(/^\//, '') === 'teacher' ||
      menuItem.slug?.toLowerCase().includes('teacher') ||
      menuItem.title?.toLowerCase().includes('giáo viên') ||
      menuItem.title?.toLowerCase().includes('giao vien')
    ));

  console.log('🔍 DynamicMenuPage - isTeacherPage:', isTeacherPage, 'menuItem:', menuItem);

  // If this is a teacher page, render AllTeachersPage immediately
  if (isTeacherPage) {
    console.log('✅ Rendering AllTeachersPage');
    return <AllTeachersPage />;
  }
  
  console.log('❌ Not a teacher page, continuing with normal flow');

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!fullSlug) return;

      // ✅ Nếu menuItems chưa load (array rỗng), giữ loading state và chờ
      if (menuItems.length === 0) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);

        // Find menu item from existing menuItems data
        const foundMenuItem = findMenuItemBySlug(menuItems, fullSlug);

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
  }, [fullSlug, menuItems]);

  // Helper function to find menu item by slug recursively
  const findMenuItemBySlug = (items: MenuItem[], targetSlug: string): MenuItem | null => {
    for (const item of items) {
      // Remove leading slash for comparison
      const itemSlug = item.slug?.replace(/^\//, '') || '';
      const cleanTargetSlug = targetSlug.replace(/^\//, '');

      if (itemSlug === cleanTargetSlug) {
        return item;
      }

      // Check children recursively
      if (item.childrenMenu && item.childrenMenu.length > 0) {
        const found = findMenuItemBySlug(item.childrenMenu, targetSlug);
        if (found) return found;
      }
    }
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

  // Only show error if: has explicit error OR (menuItems loaded but menuItem not found)
  // But skip error if we're still loading or if it's a teacher page
  if ((error || (!menuItem && menuItems.length > 0)) && !isTeacherPage) {
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

  // Otherwise, render normal content with articles
  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content - 8 columns */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              {menuItem && (
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  {menuItem.title}
                </Typography>
              )}
              {articles.length > 0 ? (
                <Box>
                  {articles.map((article, index) => (
                    <Box key={article.id || index} sx={{ mb: index < articles.length - 1 ? 4 : 0 }}>
                      {index > 0 && <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 4, mt: 4 }} />}
                      <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Chưa có nội dung cho trang này
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Sidebar - 4 columns */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <ArticlesSidebar
                menuId={menuItem?.id}
                limit={5}
                title="Bài viết liên quan"
                showContent={true}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
};

export default DynamicMenuPage;
