import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    CircularProgress,
    Pagination,
    Alert,
    Collapse,
    List,
    ListItem,
    ListItemText,
    Divider,
    Badge,
    Switch,
    FormControlLabel,
    FormControl,
    FormLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Card,
    CardContent,
    CardActions,
    MenuItem,
    Select,
    InputLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Security as SecurityIcon,
    Key as KeyIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { getAllRolesAPI, createRoleAPI, updateRoleAPI, deleteRoleAPI, getAllPermissionsAPI } from '../../services/roles';
import { Role, Permission } from '../../types';

const RoleManagement: React.FC = () => {
    // ============ STATE MANAGEMENT ============
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const limit = 10;

    // Dialog
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleName, setRoleName] = useState<string>('');
    const [roleDescription, setRoleDescription] = useState<string>('');
    const [roleIsActive, setRoleIsActive] = useState<boolean>(true);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [formLoading, setFormLoading] = useState<boolean>(false);

    // Available permissions (fetched from API)
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

    // UI State
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // ============ TAB MANAGEMENT ============
    const [currentTab, setCurrentTab] = useState<number>(0);

    // ============ PERMISSION MANAGEMENT STATE ============
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [permissionLoading, setPermissionLoading] = useState<boolean>(true);
    const [permissionError, setPermissionError] = useState<string>('');

    // Permission Dialog
    const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [permissionDescription, setPermissionDescription] = useState<string>('');
    const [permissionModule, setPermissionModule] = useState<string>('');
    const [permissionMethod, setPermissionMethod] = useState<string>('GET');
    const [permissionPath, setPermissionPath] = useState<string>('');
    const [permissionVersion, setPermissionVersion] = useState<number>(1);
    const [permissionFormLoading, setPermissionFormLoading] = useState<boolean>(false);

    // Dynamic module options based on fetched permissions
    const [availableModules, setAvailableModules] = useState<string[]>([]);

    // Module filtering
    const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');

    const httpMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

    // ============ API FUNCTIONS ============
    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getAllRolesAPI({ page, limit });
            console.log('chekc response', response)

            // Extract data from response.data.data (API wrapper structure)
            const responseData = response.data?.data;
            const rolesData = responseData?.result || [];
            const metaData = responseData?.meta || {};

            setRoles(rolesData);
            setTotalPages(metaData.totalPages || 1);
            setTotalItems(metaData.totalItems || 0);

        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Không thể tải danh sách vai trò. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await getAllPermissionsAPI();
            const responseData = response.data?.data;

            // Convert grouped permissions object to flat array
            const allPermissions: Permission[] = [];
            if (responseData && typeof responseData === 'object') {
                Object.keys(responseData).forEach(module => {
                    const modulePermissions = responseData[module];
                    if (Array.isArray(modulePermissions)) {
                        allPermissions.push(...modulePermissions);
                    }
                });
            }

            setAvailablePermissions(allPermissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            // Don't show error to user as this is not critical
        }
    };

    const handleSaveRole = async () => {
        if (!roleName.trim()) return;

        try {
            setFormLoading(true);
            setError('');

            const requestData = {
                name: roleName,
                description: roleDescription,
                isActive: roleIsActive,
                permissionIds: selectedPermissions
            };

            if (editingRole) {
                await updateRoleAPI(editingRole.id, requestData);
            } else {
                await createRoleAPI(requestData);
            }

            await fetchRoles();
            handleCloseDialog();

        } catch (error) {
            console.error('Error saving role:', error);
            setError('Không thể lưu vai trò. Vui lòng thử lại.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteRole = async (roleId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;

        try {
            await deleteRoleAPI(roleId);
            await fetchRoles();
            setError('');
        } catch (error) {
            console.error('Error deleting role:', error);
            setError('Không thể xóa vai trò. Vui lòng thử lại.');
        }
    };

    // ============ PERMISSION MANAGEMENT FUNCTIONS ============
    const fetchPermissionsForManagement = async () => {
        try {
            setPermissionLoading(true);
            setPermissionError('');

            // Use the real API to fetch permissions
            const response = await getAllPermissionsAPI();
            const responseData = response.data?.data;

            // Convert grouped permissions object to flat array
            const allPermissions: Permission[] = [];
            const modules: string[] = [];

            if (responseData && typeof responseData === 'object') {
                // The API returns permissions grouped by module
                Object.keys(responseData).forEach(module => {
                    const modulePermissions = responseData[module];
                    if (Array.isArray(modulePermissions)) {
                        // Add module to available modules list
                        modules.push(module);

                        // Ensure each permission has the module property set correctly
                        const permissionsWithModule = modulePermissions.map(permission => ({
                            ...permission,
                            module: module // Ensure module is set from the key
                        }));
                        allPermissions.push(...permissionsWithModule);
                    }
                });
            }

            setPermissions(allPermissions);
            setAvailableModules(modules);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setPermissionError('Không thể tải danh sách quyền. Vui lòng thử lại.');

            // Clear permissions if API fails
            setPermissions([]);
            setAvailableModules([]);
        } finally {
            setPermissionLoading(false);
        }
    };

    const handleSavePermission = async () => {
        if (!permissionDescription.trim() || !permissionPath.trim()) return;

        try {
            setPermissionFormLoading(true);
            setPermissionError('');

            // Mock delay to simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const newPermission: Permission = {
                id: editingPermission ? editingPermission.id : Math.max(...permissions.map(p => p.id), 0) + 1,
                description: permissionDescription,
                module: permissionModule,
                method: permissionMethod,
                path: permissionPath,
                version: permissionVersion
            };

            if (editingPermission) {
                // Update existing permission
                setPermissions(prev => prev.map(p => p.id === editingPermission.id ? newPermission : p));
            } else {
                // Create new permission
                setPermissions(prev => [...prev, newPermission]);
            }

            handleClosePermissionDialog();
        } catch (error) {
            console.error('Error saving permission:', error);
            setPermissionError('Không thể lưu quyền. Vui lòng thử lại.');
        } finally {
            setPermissionFormLoading(false);
        }
    };

    const handleDeletePermission = async (permissionId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa quyền này?')) return;

        try {
            // Mock delay to simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setPermissions(prev => prev.filter(p => p.id !== permissionId));
            setPermissionError('');
        } catch (error) {
            console.error('Error deleting permission:', error);
            setPermissionError('Không thể xóa quyền. Vui lòng thử lại.');
        }
    };

    // ============ EVENT HANDLERS ============
    const handleCreateRole = () => {
        setEditingRole(null);
        setRoleName('');
        setRoleDescription('');
        setRoleIsActive(true);
        setSelectedPermissions([]);
        setOpenDialog(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDescription(role.description || '');
        setRoleIsActive(role.isActive);
        setSelectedPermissions(role.permissions.map(p => p.id));
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setRoleName('');
        setRoleDescription('');
        setRoleIsActive(true);
        setSelectedPermissions([]);
        setEditingRole(null);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const toggleExpandRow = (roleId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(roleId)) {
            newExpanded.delete(roleId);
        } else {
            newExpanded.add(roleId);
        }
        setExpandedRows(newExpanded);
    };

    // Permission Management Event Handlers
    const handleCreatePermission = () => {
        setEditingPermission(null);
        setPermissionDescription('');
        // Pre-select the current module filter if not 'all'
        setPermissionModule(selectedModuleFilter !== 'all' ? selectedModuleFilter : '');
        setPermissionMethod('GET');
        setPermissionPath('');
        setPermissionVersion(1);
        setOpenPermissionDialog(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setPermissionDescription(permission.description);
        setPermissionModule(permission.module);
        setPermissionMethod(permission.method);
        setPermissionPath(permission.path);
        setPermissionVersion(permission.version);
        setOpenPermissionDialog(true);
    };

    const handleClosePermissionDialog = () => {
        setOpenPermissionDialog(false);
        setPermissionDescription('');
        setPermissionModule('');
        setPermissionMethod('GET');
        setPermissionPath('');
        setPermissionVersion(1);
        setEditingPermission(null);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // ============ UTILITY FUNCTIONS ============
    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'primary';
            case 'POST': return 'success';
            case 'PATCH': return 'warning';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    };

    const groupPermissionsByModule = (permissions: Permission[]) => {
        return permissions.reduce((groups, permission) => {
            const module = permission.module;
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(permission);
            return groups;
        }, {} as Record<string, Permission[]>);
    };

    // Filter permissions by selected module
    const getFilteredPermissions = () => {
        if (selectedModuleFilter === 'all') {
            return permissions;
        }
        return permissions.filter(permission => permission.module === selectedModuleFilter);
    };

    // ============ EFFECTS ============
    useEffect(() => {
        fetchRoles();
    }, [page]);

    useEffect(() => {
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (currentTab === 1) {
            fetchPermissionsForManagement();
        }
    }, [currentTab]);

    // ============ RENDER FUNCTIONS ============
    const renderPermissionsList = (permissions: Role['permissions']) => (
        <List dense>
            {permissions.map((permission, index) => (
                <React.Fragment key={permission.id}>
                    <ListItem>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={permission.method}
                                        color={getMethodColor(permission.method) as any}
                                        size="small"
                                    />
                                    <Typography component="span" fontFamily="monospace">
                                        {permission.path}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {permission.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Module: {permission.module} | Version: {permission.version}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                    {index < permissions.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );

    const renderRoleRow = (role: Role) => (
        <React.Fragment key={role.id}>
            <TableRow>
                <TableCell>{role.id}</TableCell>
                <TableCell>
                    <Chip label={role.name} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {role.description || '-'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        color={role.isActive ? 'success' : 'default'}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge badgeContent={role.permissions.length} color="primary">
                            <SecurityIcon />
                        </Badge>
                        <Button
                            size="small"
                            onClick={() => toggleExpandRow(role.id)}
                            endIcon={expandedRows.has(role.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        >
                            {expandedRows.has(role.id) ? 'Thu gọn' : 'Xem chi tiết'}
                        </Button>
                    </Box>
                </TableCell>
                <TableCell align="center">
                    <IconButton onClick={() => handleEditRole(role)} color="primary" size="small">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRole(role.id)} color="error" size="small">
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedRows.has(role.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Quyền hạn ({role.permissions.length})
                            </Typography>
                            {role.permissions.length === 0 ? (
                                <Typography color="text.secondary">
                                    Không có quyền nào được gán
                                </Typography>
                            ) : (
                                renderPermissionsList(role.permissions)
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );

    // ============ MAIN RENDER ============
    return (
        <DashboardLayout>
            <Box sx={commonStyles.pageContainer}>
                <Box sx={commonStyles.contentContainer}>
                {/* Header */}
                    <Box sx={commonStyles.pageHeader}>
                        <Typography sx={commonStyles.pageTitle}>
                        {currentTab === 0 ? 'Quản lý vai trò' : 'Quản lý quyền hạn'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={currentTab === 0 ? <AddIcon /> : <KeyIcon />}
                        onClick={currentTab === 0 ? handleCreateRole : handleCreatePermission}
                            sx={commonStyles.primaryButton}
                    >
                        {currentTab === 0 ? 'Thêm vai trò' : 'Thêm quyền'}
                    </Button>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {currentTab === 0 ? 'Quản lý các vai trò và quyền hạn trong hệ thống' : 'Quản lý các quyền truy cập API trong hệ thống'}
                </Typography>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} aria-label="role and permission tabs">
                        <Tab
                            label="Vai trò"
                            icon={<AdminIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, textTransform: 'none', fontSize: '1rem' }}
                        />
                        <Tab
                            label="Quyền hạn"
                            icon={<KeyIcon />}
                            iconPosition="start"
                            sx={{ minHeight: 48, textTransform: 'none', fontSize: '1rem' }}
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                {currentTab === 0 ? (
                    <>
                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Data Table */}
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Tên vai trò</TableCell>
                                        <TableCell>Mô tả</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Quyền</TableCell>
                                        <TableCell align="center">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : roles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    Không có dữ liệu
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roles.map(renderRoleRow)
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}

                        {/* Footer Info */}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Hiển thị {roles.length} trên {totalItems} vai trò
                        </Typography>

                        {/* Create/Edit Dialog */}
                        <Dialog
                            open={openDialog}
                            onClose={handleCloseDialog}
                            maxWidth="lg"
                            fullWidth
                        >
                            <DialogTitle>
                                {editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                            </DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Tên vai trò"
                                        type="text"
                                        variant="outlined"
                                        size="small"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        sx={{ flex: '0 0 200px' }}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Mô tả"
                                        type="text"
                                        multiline
                                        rows={1}
                                        variant="outlined"
                                        size="small"
                                        value={roleDescription}
                                        onChange={(e) => setRoleDescription(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        minWidth: '120px'
                                    }}>
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: roleIsActive ? '#1976d2' : '#e0e0e0',
                                            borderRadius: '20px',
                                            padding: roleIsActive ? '6px 25px 6px 15px' : '6px 15px 6px 25px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            userSelect: 'none',
                                            '&:hover': {
                                                backgroundColor: roleIsActive ? '#1565c0' : '#d0d0d0'
                                            }
                                        }}
                                            onClick={() => setRoleIsActive(!roleIsActive)}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: roleIsActive ? 'white' : '#424242',
                                                    fontWeight: 700,
                                                    fontSize: '12px',
                                                    letterSpacing: '1px',
                                                    textShadow: roleIsActive ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                                }}
                                            >
                                                {roleIsActive ? 'ACTIVE' : 'INACTIVE'}
                                            </Typography>
                                            <Box sx={{
                                                position: 'absolute',
                                                right: roleIsActive ? '4px' : 'calc(100% - 20px)',
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                transition: 'right 0.3s ease',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Permission Selection */}
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <FormLabel component="legend">
                                            Quyền hạn ({selectedPermissions.length}/{availablePermissions.length} được chọn)
                                        </FormLabel>
                                        <Box>
                                            <Button
                                                size="small"
                                                onClick={() => setSelectedPermissions(availablePermissions.map(p => p.id))}
                                            >
                                                Chọn tất cả
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => setSelectedPermissions([])}
                                            >
                                                Bỏ chọn tất cả
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 1, maxHeight: 400, overflow: 'auto', pb: 4 }}>
                                        {availablePermissions.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Đang tải danh sách quyền...
                                            </Typography>
                                        ) : (
                                            (() => {
                                                const groupedPermissions = groupPermissionsByModule(availablePermissions);
                                                const moduleKeys = Object.keys(groupedPermissions);
                                                return moduleKeys.map((module, index) => (
                                                    <Accordion
                                                        key={module}
                                                        defaultExpanded
                                                        sx={{ mb: index === moduleKeys.length - 1 ? 2 : 0 }}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon />}
                                                            sx={{ backgroundColor: 'grey.50' }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                                    <Typography variant="h6" color="primary">
                                                                        {module}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                                                        ({groupedPermissions[module].length} quyền)
                                                                    </Typography>
                                                                </Box>
                                                                <Switch
                                                                    size="medium"
                                                                    checked={
                                                                        groupedPermissions[module].every(p =>
                                                                            selectedPermissions.includes(p.id)
                                                                        )
                                                                    }
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        const modulePermissionIds = groupedPermissions[module].map(p => p.id);
                                                                        if (e.target.checked) {
                                                                            // Select all permissions in this module
                                                                            const newSelected = [...new Set([...selectedPermissions, ...modulePermissionIds])];
                                                                            setSelectedPermissions(newSelected);
                                                                        } else {
                                                                            // Deselect all permissions in this module
                                                                            setSelectedPermissions(
                                                                                selectedPermissions.filter(id => !modulePermissionIds.includes(id))
                                                                            );
                                                                        }
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    sx={{
                                                                        transform: 'scale(1.3)',
                                                                        '& .MuiSwitch-track': {
                                                                            borderRadius: '12px',
                                                                            backgroundColor: '#E5E7EB',
                                                                            border: '1px solid #D1D5DB',
                                                                        },
                                                                        '& .MuiSwitch-thumb': {
                                                                            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            backgroundColor: '#10B981',
                                                                            borderColor: '#10B981',
                                                                        },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Box sx={{
                                                                display: 'grid',
                                                                gridTemplateColumns: '1fr 1fr',
                                                                gap: 1
                                                            }}>
                                                                {groupedPermissions[module].map((permission) => (
                                                                    <FormControlLabel
                                                                        key={permission.id}
                                                                        control={
                                                                            <Switch
                                                                                size="medium"
                                                                                checked={selectedPermissions.includes(permission.id)}
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked) {
                                                                                        setSelectedPermissions([...selectedPermissions, permission.id]);
                                                                                    } else {
                                                                                        setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                                                                                    }
                                                                                }}
                                                                                sx={{
                                                                                    transform: 'scale(1.3)',
                                                                                    '& .MuiSwitch-track': {
                                                                                        borderRadius: '12px',
                                                                                        backgroundColor: '#E5E7EB',
                                                                                        border: '1px solid #D1D5DB',
                                                                                    },
                                                                                    '& .MuiSwitch-thumb': {
                                                                                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                                                                                    },
                                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                        backgroundColor: '#10B981',
                                                                                        borderColor: '#10B981',
                                                                                    },
                                                                                }}
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Box sx={{ minWidth: 0 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                                    <Chip
                                                                                        label={permission.method}
                                                                                        color={getMethodColor(permission.method) as any}
                                                                                        size="small"
                                                                                    />
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        fontFamily="monospace"
                                                                                        sx={{
                                                                                            fontSize: '0.85rem',
                                                                                            wordBreak: 'break-word'
                                                                                        }}
                                                                                    >
                                                                                        {permission.path}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    color="text.secondary"
                                                                                    sx={{
                                                                                        display: 'block',
                                                                                        fontSize: '0.8rem',
                                                                                        lineHeight: 1.2,
                                                                                        wordBreak: 'break-word',
                                                                                        mt: 1
                                                                                    }}
                                                                                >
                                                                                    {permission.description}
                                                                                </Typography>
                                                                            </Box>
                                                                        }
                                                                        sx={{
                                                                            alignItems: 'flex-start',
                                                                            margin: 0,
                                                                            padding: 1,
                                                                            border: '1px solid',
                                                                            borderColor: 'grey.200',
                                                                            borderRadius: 1,
                                                                            '&:hover': {
                                                                                backgroundColor: 'grey.50'
                                                                            }
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                ));
                                            })()
                                        )}
                                    </Box>
                                </FormControl>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} disabled={formLoading}>
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSaveRole}
                                    variant="contained"
                                    disabled={formLoading || !roleName.trim()}
                                >
                                    {formLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        editingRole ? 'Cập nhật' : 'Tạo'
                                    )}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                ) : (
                    <>
                        {/* Permission Management Content */}
                        {/* Error Alert */}
                        {permissionError && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {permissionError}
                            </Alert>
                        )}

                        {/* Module Filter Selection */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Lọc theo module:
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Chọn module</InputLabel>
                                <Select
                                    value={selectedModuleFilter}
                                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                                    label="Chọn module"
                                >
                                    <MenuItem value="all">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip label="Tất cả" color="primary" size="small" />
                                            <Typography>({permissions.length} quyền)</Typography>
                                        </Box>
                                    </MenuItem>
                                    {availableModules.map((module) => {
                                        const modulePermissionCount = permissions.filter(p => p.module === module).length;
                                        return (
                                            <MenuItem key={module} value={module}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip label={module} color="default" size="small" />
                                                    <Typography>({modulePermissionCount} quyền)</Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setSelectedModuleFilter('all')}
                                disabled={selectedModuleFilter === 'all'}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Box>

                        {/* Permissions Grouped by Module */}
                        {permissionLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : getFilteredPermissions().length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    {selectedModuleFilter === 'all' ? 'Không có quyền nào' : `Không có quyền nào trong module "${selectedModuleFilter}"`}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {selectedModuleFilter === 'all' ? (
                                    // Show all modules with accordion
                                    availableModules.map((module) => {
                                        const modulePermissions = permissions.filter(p => p.module === module);
                                        if (modulePermissions.length === 0) return null;

                                        return (
                                            <Accordion key={module} defaultExpanded sx={{ mb: 2 }}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{ backgroundColor: 'grey.50' }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                                                            {module}
                                                        </Typography>
                                                        <Badge badgeContent={modulePermissions.length} color="primary" />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
                                                        {modulePermissions.map((permission) => (
                                                            <Card key={permission.id} variant="outlined">
                                                                <CardContent sx={{ pb: 1 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                                                            {permission.description}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={permission.method}
                                                                            color={getMethodColor(permission.method) as any}
                                                                            size="small"
                                                                        />
                                                                    </Box>

                                                                    <Typography variant="body2" fontFamily="monospace" sx={{
                                                                        backgroundColor: 'grey.100',
                                                                        p: 1,
                                                                        borderRadius: 1,
                                                                        wordBreak: 'break-all',
                                                                        mb: 2,
                                                                        fontSize: '0.85rem'
                                                                    }}>
                                                                        {permission.path}
                                                                    </Typography>

                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                        ID: {permission.id} | Version: {permission.version}
                                                                    </Typography>
                                                                </CardContent>
                                                                <CardActions sx={{ pt: 0, pb: 1 }}>
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<EditIcon />}
                                                                        onClick={() => handleEditPermission(permission)}
                                                                    >
                                                                        Chỉnh sửa
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        color="error"
                                                                        startIcon={<DeleteIcon />}
                                                                        onClick={() => handleDeletePermission(permission.id)}
                                                                    >
                                                                        Xóa
                                                                    </Button>
                                                                </CardActions>
                                                            </Card>
                                                        ))}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })
                                ) : (
                                    // Show only selected module without accordion
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                                                Module: {selectedModuleFilter}
                                            </Typography>
                                            <Badge badgeContent={getFilteredPermissions().length} color="primary" />
                                        </Box>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
                                            {getFilteredPermissions().map((permission) => (
                                                <Card key={permission.id} variant="outlined">
                                                    <CardContent sx={{ pb: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                                                {permission.description}
                                                            </Typography>
                                                            <Chip
                                                                label={permission.method}
                                                                color={getMethodColor(permission.method) as any}
                                                                size="small"
                                                            />
                                                        </Box>

                                                        <Typography variant="body2" fontFamily="monospace" sx={{
                                                            backgroundColor: 'grey.100',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            wordBreak: 'break-all',
                                                            mb: 2,
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {permission.path}
                                                        </Typography>

                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            ID: {permission.id} | Version: {permission.version}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions sx={{ pt: 0, pb: 1 }}>
                                                        <Button
                                                            size="small"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleEditPermission(permission)}
                                                        >
                                                            Chỉnh sửa
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => handleDeletePermission(permission.id)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </>
                        )}
                        {/* Permission Statistics */}
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            {selectedModuleFilter === 'all'
                                ? `Tổng cộng ${permissions.length} quyền được quản lý`
                                : `Hiển thị ${getFilteredPermissions().length} quyền trong module "${selectedModuleFilter}"`
                            }
                        </Typography>

                        {/* Permission Create/Edit Dialog */}
                        <Dialog
                            open={openPermissionDialog}
                            onClose={handleClosePermissionDialog}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>
                                {editingPermission ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}
                            </DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                    <FormControl size="small">
                                        <InputLabel>Module</InputLabel>
                                        <Select
                                            value={permissionModule}
                                            onChange={(e) => setPermissionModule(e.target.value)}
                                            label="Module"
                                            required
                                        >
                                            {availableModules.map((module) => (
                                                <MenuItem key={module} value={module}>
                                                    {module}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Version"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        value={permissionVersion}
                                        onChange={(e) => setPermissionVersion(Number(e.target.value))}
                                        inputProps={{ min: 1 }}
                                    />
                                </Box>

                                <TextField
                                    label="Mô tả"
                                    type="text"
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    size="small"
                                    value={permissionDescription}
                                    onChange={(e) => setPermissionDescription(e.target.value)}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                    required
                                />

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, mt: 2 }}>
                                    <FormControl size="small">
                                        <InputLabel>Method</InputLabel>
                                        <Select
                                            value={permissionMethod}
                                            onChange={(e) => setPermissionMethod(e.target.value)}
                                            label="Method"
                                            required
                                        >
                                            {httpMethods.map((method) => (
                                                <MenuItem key={method} value={method}>
                                                    {method}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="API Path"
                                        type="text"
                                        variant="outlined"
                                        size="small"
                                        value={permissionPath}
                                        onChange={(e) => setPermissionPath(e.target.value)}
                                        placeholder="/api/example"
                                        required
                                    />
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePermissionDialog} disabled={permissionFormLoading}>
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSavePermission}
                                    variant="contained"
                                    disabled={permissionFormLoading || !permissionDescription.trim() || !permissionPath.trim()}
                                >
                                    {permissionFormLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        editingPermission ? 'Cập nhật' : 'Tạo'
                                    )}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default RoleManagement;
