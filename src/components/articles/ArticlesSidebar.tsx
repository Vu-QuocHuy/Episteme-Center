import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllArticlesAPI } from '../../services/articles';

interface Article {
  id: string;
  title: string;
  content: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  createdAt: string;
}

interface ArticlesSidebarProps {
  menuId?: string;
  limit?: number;
  title?: string;
  showContent?: boolean;
}

const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({
  menuId,
  limit = 5,
  title = 'Bài viết mới',
  showContent = false
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await getAllArticlesAPI({
          page: 1,
          limit,
          filters: menuId ? { menuId } : undefined
        });
        const articlesList = response.data?.data?.result || [];
        
        // Filter active articles and sort by order/createdAt
        const activeArticles = articlesList
          .filter((article: Article) => article.isActive !== false)
          .sort((a: Article, b: Article) => {
            const orderA = a.order || 999;
            const orderB = b.order || 999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, limit);

        setArticles(activeArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [menuId, limit]);

  const truncateContent = (html: string, maxLength: number = 100) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {articles.map((article) => (
        <Card
          key={article.id}
          sx={{
            mb: 2,
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          <CardActionArea
            onClick={() => {
              // Navigate to article detail or menu page
              // You can customize this based on your routing needs
              navigate(`/bai-viet/${article.id}`);
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {article.title}
              </Typography>
              {showContent && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {truncateContent(article.content)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {new Date(article.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default ArticlesSidebar;

