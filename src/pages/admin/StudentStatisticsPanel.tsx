import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, CircularProgress } from '@mui/material';
import { commonStyles } from '../../utils/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getStudentStatisticsAPI } from '../../services/students';

interface MonthlyData {
  year: number;
  month: number;
  monthName: string;
  newStudents: number;
  leftStudents: number;
  netChange: number;
  students: number;
}

interface SummaryData {
  totalNewEnrollments: number;
  totalCompletions: number;
  netChange: number;
  totalStudentsAtEndOfYear: number;
  period: { startDate: string; endDate: string; };
}

interface MonthlyStat {
  month: number;
  year: number;
  increaseStudents: number;
  decreaseStudents: number;
  netChange: number;
}


const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const StudentStatisticsPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [loading, setLoading] = useState<boolean>(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalNewEnrollments: 0, totalCompletions: 0, netChange: 0, totalStudentsAtEndOfYear: 0,
    period: { startDate: '', endDate: '' }
  });
  const [error, setError] = useState<string>('');



  const fetchMonthlyData = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const res: any = await getStudentStatisticsAPI(selectedYear);
      console.log('API response:', res);
      // Backend trả về { statusCode, message, data }
      const apiData = res?.data?.data || res?.data || {};
      
      // Map dữ liệu từ API response sang format của component
      const monthlyStats = apiData.monthlyStats || [];
      
      const now = new Date();
      const isCurrentYear = selectedYear === now.getFullYear();
      const currentMonth = isCurrentYear ? now.getMonth() + 1 : 12;
      
      // Tạo mảng 12 tháng với dữ liệu từ API
      const fullMonths: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const stat = monthlyStats.find((s: MonthlyStat) => s.month === monthNum);
        
        if (monthNum > currentMonth) {
          return {
            year: selectedYear,
            month: monthNum,
            monthName: `Th${monthNum}`,
            newStudents: 0,
            leftStudents: 0,
            netChange: 0,
            students: 0
          };
        }
        
        return {
          year: selectedYear,
          month: monthNum,
          monthName: `Th${monthNum}`,
          newStudents: stat?.increaseStudents || 0,
          leftStudents: stat?.decreaseStudents || 0,
          netChange: stat?.netChange || 0,
          students: 0 // Sẽ tính sau
        };
      });

      // Tính số học sinh đầu năm = số học sinh cuối năm - biến động trong năm
      const totalStudentsAtEndOfYear = apiData.totalStudentsAtEndOfYear || 0;
      const netChangeForYear = apiData.summary?.netChange || 0;
      const studentsAtStartOfYear = totalStudentsAtEndOfYear - netChangeForYear;
      
      // Tính tổng số học sinh tích lũy theo tháng (bắt đầu từ số học sinh đầu năm)
      let cumulativeStudents = studentsAtStartOfYear;
      for (let i = 0; i < 12; i++) {
        if (i + 1 > currentMonth) {
          fullMonths[i].students = 0;
          fullMonths[i].newStudents = 0;
          fullMonths[i].leftStudents = 0;
          fullMonths[i].netChange = 0;
        } else {
          cumulativeStudents += fullMonths[i].newStudents - fullMonths[i].leftStudents;
          fullMonths[i].students = cumulativeStudents;
        }
      }

      setMonthlyData(fullMonths);

      // Set summary data từ API response
      setSummaryData({
        totalNewEnrollments: apiData.summary?.totalIncrease || 0,
        totalCompletions: apiData.summary?.totalDecrease || 0,
        netChange: apiData.summary?.netChange || 0,
        totalStudentsAtEndOfYear: apiData.totalStudentsAtEndOfYear || 0,
        period: apiData.summary?.period || { startDate: '', endDate: '' }
      });

      console.log('Processed monthly data:', fullMonths);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Không thể tải dữ liệu thống kê');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear]);


  return (
    <Box>
      <Box sx={{ ...commonStyles.pageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={commonStyles.pageTitle}>Thống kê học sinh</Typography>
        <TextField 
          select 
          label="Năm" 
          value={selectedYear} 
          onChange={e => setSelectedYear(Number(e.target.value))}
          sx={{ minWidth: 150 }}
        >
          {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
        </TextField>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Summary Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh mới</Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalNewEnrollments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh rời đi</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalCompletions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {summaryData.netChange >= 0 ? 'Tăng' : 'Giảm'}
              </Typography>
              <Typography
                variant="h5"
                color={summaryData.netChange >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {loading ? <CircularProgress size={20} /> : `${summaryData.netChange >= 0 ? '+' : ''}${summaryData.netChange}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng số học sinh cuối năm</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalStudentsAtEndOfYear}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Bar Chart - Total Students by Month */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`Số lượng học sinh theo tháng (${selectedYear})`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" name="Tổng học sinh" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Line Chart - Monthly Changes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`Biến động học sinh theo tháng (${selectedYear})`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newStudents"
                    name="Học sinh mới"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leftStudents"
                    name="Học sinh rời đi"
                    stroke="#f44336"
                    strokeWidth={2}
                    dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netChange"
                    name="Biến động"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Grouped Bar Chart - New vs Left Students by Month */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`So sánh học sinh mới và rời đi theo tháng (${selectedYear})`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newStudents" name="Học sinh mới" fill="#4caf50" />
                  <Bar dataKey="leftStudents" name="Học sinh rời đi" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentStatisticsPanel;
