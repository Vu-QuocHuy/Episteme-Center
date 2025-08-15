// Teacher dashboard statistics component
import React from 'react';
import {
  Class as ClassIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { StatSection } from '../../common';
import type { StatItem } from '../../common';
import { formatters } from '../../../utils/formatters';

interface DashboardData {
  totalStudent: number;
  teachingClasses: number;
  closedClasses: number;
  upcomingClasses: number;
  recentlySalary: {
    totalAmount: number;
    paidAmount: number;
  };
}

interface DashboardStatsProps {
  data: DashboardData;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const stats: StatItem[] = [
    {
      title: 'Tổng số học sinh',
      value: data.totalStudent || 0,
      icon: <SchoolIcon />,
      color: '#1976d2'
    },
    {
      title: 'Lớp đang dạy',
      value: data.teachingClasses || 0,
      icon: <ClassIcon />,
      color: '#388e3c'
    },
    {
      title: 'Lớp đã hoàn thành',
      value: data.closedClasses || 0,
      icon: <TrendingUpIcon />,
      color: '#f57c00'
    },
    {
      title: 'Lương tháng này',
      value: formatters.currency(data.recentlySalary?.totalAmount),
      icon: <PaymentIcon />,
      color: '#7b1fa2',
      subtitle: data.recentlySalary?.paidAmount > 0 ? 'Đã thanh toán' : 'Chưa thanh toán'
    }
  ];

  return <StatSection title="Tổng quan" stats={stats} />;
};

export default DashboardStats;
