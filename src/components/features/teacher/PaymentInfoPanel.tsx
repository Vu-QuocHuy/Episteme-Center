// Teacher dashboard payment information panel
import React from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatters } from '../../../utils/formatters';

interface PaymentInfo {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface PaymentInfoPanelProps {
  paymentInfo: PaymentInfo[];
  loading?: boolean;
}

const PaymentInfoPanel: React.FC<PaymentInfoPanelProps> = ({
  paymentInfo,
  loading = false
}) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin thanh toán
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          Đang tải...
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Lịch sử thanh toán ({paymentInfo.length})
      </Typography>

      {paymentInfo.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
          color: 'text.secondary'
        }}>
          <PaymentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography>Chưa có lịch sử thanh toán</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          <List>
            {paymentInfo.map((payment, index) => (
              <React.Fragment key={`${payment.month}-${payment.year}`}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="subtitle2" fontWeight="bold">
                            Tháng {payment.month}/{payment.year}
                          </Typography>
                        </Box>
                        <Chip
                          label={formatters.status.getLabel(payment.status)}
                          color={formatters.status.getColor(payment.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tổng tiền: {formatters.currency(payment.totalAmount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đã thanh toán: {formatters.currency(payment.paidAmount)}
                        </Typography>
                        {payment.totalAmount > payment.paidAmount && (
                          <Typography variant="body2" color="warning.main">
                            Còn lại: {formatters.currency(payment.totalAmount - payment.paidAmount)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < paymentInfo.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default PaymentInfoPanel;
