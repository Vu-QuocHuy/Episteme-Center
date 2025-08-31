import React, { useEffect, useState } from 'react';
import { Collapse, Button, Input, Modal, Form, Popconfirm, message, Switch } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const CRUDNavbar = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // Dùng để sửa menu hiện tại
    const [parentId, setParentId] = useState(null); // Dùng để lưu parentId khi tạo submenu
    const [form] = Form.useForm();
    const api = process.env.REACT_APP_API_URL;

    const token = localStorage.getItem('auth_token'); // Lấy token từ localStorage

    // Hàm chuyển đổi chuỗi thành slug
    const generateSlug = (title) => {
        // Bảng thay thế ký tự có dấu sang không dấu
        const charMap = {
            á: 'a', à: 'a', ả: 'a', ã: 'a', ạ: 'a',
            ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
            â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
            đ: 'd',
            é: 'e', è: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
            ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
            í: 'i', ì: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
            ó: 'o', ò: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
            ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
            ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
            ú: 'u', ù: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
            ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
            ý: 'y', ỳ: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
        };

        // Thay thế các ký tự có dấu bằng không dấu
        const slug = title
            .toLowerCase()
            .replace(/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/g, (char) => charMap[char])
            .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu '-'
            .replace(/[^a-z0-9-]/g, '') // Loại bỏ ký tự không hợp lệ
            .replace(/-+/g, '-') // Thay thế nhiều dấu '-' liên tiếp bằng một dấu '-'
            .replace(/^-+|-+$/g, ''); // Loại bỏ dấu '-' ở đầu và cuối

        return slug;
    };



    // Hàm lấy dữ liệu từ API
    const fetchApiData = async () => {
        try {
            const response = await fetch(api + '/api/menu_items', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const apiData = await response.json();

            setMenuItems(apiData);
        } catch (error) {
            console.error('Error fetching menu data:', error);
        }
    };

    // Hàm thêm menu
    const addMenuItem = async (values) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('slug', values.slug);
            if (parentId) {
                formData.append('parentId', parentId);
            }

            await fetch(api + '/api/menu_items', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            fetchApiData(); // Tải lại menu
            setIsModalVisible(false);
            setParentId(null); // Reset parentId sau khi thêm
            form.resetFields();
            message.success("Thêm menu item thành công")
        } catch (error) {
            message.error('Error adding menu item:', error);
        }
    };

    // Hàm sửa menu
    const updateMenuItem = async (values) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('slug', values.slug);

            await fetch(`${api}/api/menu_items/${currentItem.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            fetchApiData(); // Tải lại menu
            setIsModalVisible(false);
            setCurrentItem(null);
            form.resetFields();
        } catch (error) {
            console.error('Error updating menu item:', error);
        }
    };

    // Hàm xóa menu
    const deleteMenuItem = async (id) => {
        try {
            await fetch(`${api}/api/menu_items/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchApiData(); // Tải lại menu
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    useEffect(() => {
        fetchApiData();
    }, []);

    // Hiển thị modal thêm/sửa
    const showModal = (item = null, parent = null) => {
        setCurrentItem(item);
        setParentId(parent); // Gán parentId nếu là tạo submenu
        form.setFieldsValue(item ? { title: item.title, slug: item.slug } : {});
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentItem(null);
        setParentId(null); // Reset parentId sau khi hủy
        form.resetFields();
    };

    const navigate = useNavigate();
    // Hàm gọi API cập nhật trạng thái
    const updateVisibility = async (id, isDeletedStatus) => {
        try {
            // Tạo FormData và thêm trường `isDeleted`
            const formData = new FormData();
            formData.append('isDeleted', !isDeletedStatus);

            // Gọi API
            const response = await fetch(`${api}/api/menu_items/${id}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Lỗi khi cập nhật trạng thái');
            }
            fetchApiData();
            message.success(`Cập nhật thành công trạng thái`);
        } catch (error) {
            message.error('Không thể cập nhật trạng thái!');
            console.error(error);
        }
    };

    const handleSwitchChange = (itemId, checked) => {
        updateVisibility(itemId, checked); // Gọi API với itemId và trạng thái
    };

    // Render các mục trong Collapse
    const renderPanels = (items) =>
        items.map((item) => (
            <Panel
                header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.title}</span>
                        <div>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => showModal(null, item.id)}
                            >
                                Tạo submenu
                            </Button>
                            <Button
                                type='link'
                                size='small'
                                onClick={() => navigate(`/create-layout-for-menuitem/${item.id}`)}
                            >   Tạo Layout
                            </Button>
                            <Switch
                                checked={!item.deleted}
                                onChange={(e) => handleSwitchChange(item.id, e)} // Sự kiện thay đổi trạng thái
                                checkedChildren="Hiện"
                                unCheckedChildren="Ẩn"
                            />
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa mục này?"
                                onConfirm={() => deleteMenuItem(item.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="link" danger size="small">
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                }
                key={item.id}
            >
                {item.children && item.children.length > 0 ? (
                    <Collapse>{renderPanels(item.children)}</Collapse>
                ) : (
                    <div>Không có submenu</div>
                )}
            </Panel>
        ));

    return (
        <div>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: "20px" }}>Thêm mục menu</Button>
            <Collapse>{renderPanels(menuItems)}</Collapse>

            <Modal
                title={currentItem ? 'Sửa mục menu' : parentId ? 'Tạo submenu' : 'Thêm mục menu'}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={currentItem ? updateMenuItem : addMenuItem}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input
                            onChange={(e) => {
                                const title = e.target.value;
                                form.setFieldsValue({ slug: generateSlug(title) });
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
                        {currentItem ? 'Cập nhật' : 'Thêm'}
                    </Button>
                    <Button onClick={handleCancel}>Hủy</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CRUDNavbar;
