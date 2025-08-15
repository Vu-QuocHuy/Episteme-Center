// Teacher dashboard active classes list component
import React from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Box
} from '@mui/material';
import {
  Class as ClassIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { formatters } from '../../../utils/formatters';

interface ActiveClass {
  id: string;
  name: string;
  studentCount: number;
  schedule: string;
  nextLesson?: string;
}

interface ActiveClassesListProps {
  classes: ActiveClass[];
  loading?: boolean;
}

const ActiveClassesList: React.FC<ActiveClassesListProps> = ({
  classes,
  loading = false
}) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Lớp học đang dạy
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
        Lớp học đang dạy ({classes.length})
      </Typography>

      {classes.length === 0 ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
          color: 'text.secondary'
        }}>
          Không có lớp học nào
        </Box>
      ) : (
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          <List>
            {classes.map((classItem, index) => (
              <React.Fragment key={classItem.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ClassIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {classItem.name}
                        </Typography>
                        <Chip
                          icon={<PersonIcon />}
                          label={formatters.studentCount(classItem.studentCount)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {classItem.schedule}
                        </Typography>
                        {classItem.nextLesson && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Buổi tiếp theo: {formatters.date(classItem.nextLesson)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < classes.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default ActiveClassesList;
