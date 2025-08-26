// Reusable statistics section component
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import StatCard from './StatCard';

export interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  subtitle?: string;
}

interface StatSectionProps {
  title?: string;
  stats: StatItem[];
  gridSpacing?: number;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const StatSection: React.FC<StatSectionProps> = ({
  title,
  stats,
  gridSpacing = 3,
  gridSize = { xs: 12, sm: 6, md: 3 }
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={gridSpacing}>
        {stats.map((stat, index) => (
          <Grid item {...gridSize} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatSection;
