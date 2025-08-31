import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./EmployeeManagement.module.scss";
import { Button, DatePicker, Divider, Form, Input, Select, Space, Table, Upload } from "antd";
import Column from "antd/es/table/Column";
import { Option } from "antd/es/mentions";
import { UploadOutlined } from "@ant-design/icons";

const cx = classNames.bind(styles);
const url = process.env.REACT_APP_API_URL;

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const token = localStorage.getItem("auth_token");
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        pageSize: 10,
    });
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState({
        tenNhanVien: "",
        maNhanVien: "",
        ngaySinh: "",
        gioiTinh: "",
        dienThoai: "",
        diaChi: "",
        chucVu: "",
    });

    const apiURL = url + "/api/nhanvien";

    // Fetch danh sách nhân viên
    const fetchEmployees = async (page) => {
        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(`${apiURL}?page=${page}&size=${pagination.pageSize}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setEmployees(data.content);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                pageSize: data.pageSize,
            });
        } catch (error) {
            alert("Lỗi khi lấy danh sách nhân viên!");
        }
    };

    useEffect(() => {
        fetchEmployees(0);
    }, []);

    // Xóa nhân viên
    const handleDeleteEmployee = async (idUser) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;

        try {

            const response = await fetch(`${apiURL}/${idUser}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                alert("Xóa nhân viên thành công!");
                fetchEmployees(pagination.currentPage);
            } else {
                alert("Xóa nhân viên thất bại!");
            }
        } catch (error) {
            alert("Lỗi khi xóa nhân viên!");
        }
    };


    // Thêm nhân viên
    const handleAddEmployee = () => {
        setCurrentEmployee({
            tenNhanVien: "",
            maNhanVien: "",
            ngaySinh: "",
            gioiTinh: "",
            dienThoai: "",
            diaChi: "",
            chucVu: "",
        });
        setEditMode(false);
        setShowForm(true);
    };

    // Sửa nhân viên
    const handleEditEmployee = (employee) => {
        setCurrentEmployee(employee);
        setEditMode(true);
        setShowForm(true);
    };

    // Lưu nhân viên
    const handleSaveEmployee = async () => {
        const method = editMode ? "PUT" : "POST";
        const url = editMode ? `${apiURL}/${currentEmployee.idUser}` : apiURL;

        const formData = new FormData();
        Object.entries(currentEmployee).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                alert(`${editMode ? "Cập nhật" : "Thêm"} nhân viên thành công!`);
                setShowForm(false);
                fetchEmployees(pagination.currentPage);
            } else {
                alert(`${editMode ? "Cập nhật" : "Thêm"} nhân viên thất bại!`);
            }
        } catch (error) {
            alert("Lỗi khi lưu nhân viên!");
        }
    };

    const onFinish = async (values) => {
        const formData = new FormData();

        // Thêm các trường dữ liệu từ form
        formData.append("maNhanVien", values.maNhanVien); // Tên sự kiện
        formData.append("tenNhanVien", values.fullname); // Mô tả
        formData.append("gioiTinh", values.gender); // Địa điểm
        formData.append("ngaySinh", values.dob.format("YYYY-MM-DD")); // Ngày bắt đầu
        formData.append("userName", values.username);
        formData.append("maPhongBan", values.phongBan); // Ngày kết thúc
        // Xử lý file upload
        if (values.avatar && values.avatar.length > 0) {
            formData.append("file", values.avatar[0].originFileObj);
        }
        // Gửi FormData qua Fetch API
        try {
            const response = await fetch(url + "/api/nhanvien", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Thêm nhân viên thành công")
            } else {
                console.error("Failed:", response.statusText);
            }
            fetchEmployees(pagination.currentPage)
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const [form] = Form.useForm();
    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    return (
        <div className={cx("employee-management")}>
            <button onClick={handleAddEmployee} className={cx("add-button")}>Thêm Nhân Viên</button>

            {/* Danh sách nhân viên */}
            <Table dataSource={employees}
                pagination={{
                    position: "bottom",
                    align: "center",
                    onChange: (page) => {
                        fetchEmployees(page - 1);
                    },
                    pageSize: 5,
                }}
            >
                <Column title="Họ và tên" render={(_, record) => (
                    <div style={{
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <img style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "10px", borderRadius: "50%" }} src={url + record.avaFileCode} alt=""></img>
                        <p>{record.tenNhanVien}</p>
                    </div>
                )} key="tenNhanVien"></Column>
                <Column title="Mã nhân viên" dataIndex="maNhanVien" key="maNhanVien"></Column>
                <Column title="Ngày Sinh" dataIndex="ngaySinh" key="ngaySinh"></Column>
                <Column title="Địa chỉ" dataIndex="diaChi" key="diaChi"></Column>
                <Column title="Chức vụ" dataIndex="chucVu" key="chucVu"></Column>
                <Column
                    title="Action"
                    key="action"
                    render={(_, record) => (
                        <Space size="middle">
                            <Button>Sửa</Button>
                            <Button>Xóa</Button>
                        </Space>
                    )}
                />
            </Table>

            {/* Modal Thêm/Sửa */}
            {showForm && (
                <div className={cx("form-overlay")}>
                    <div className={cx("form-container")}>
                        <Divider orientation="center"><h2>Thêm nhân viên mới</h2></Divider>
                        <Form
                            form={form}
                            style={{
                                maxWidth: 600,
                            }}
                            className={cx("form")}
                            onFinish={onFinish}>
                            <Form.Item
                                label="Avatar"
                                name="avatar"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Upload name="doc" >
                                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item
                                label="Mã nhân viên"
                                name="maNhanVien"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Input
                                />
                            </Form.Item>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Input
                                />
                            </Form.Item>
                            <Form.Item
                                label="Họ tên"
                                name="fullname"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Input
                                />
                            </Form.Item>
                            <Form.Item
                                label="Ngày sinh"
                                name="dob"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <DatePicker />
                            </Form.Item>
                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Select>
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Phòng ban"
                                name="phongBan"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input!',
                                    },
                                ]}
                            >
                                <Select>
                                    <Option value="CNTT">Công nghệ thông tin</Option>
                                    <Option value="ATTT">An toàn thông tin</Option>
                                    <Option value="DTVT">Điện tử viễn thông</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                wrapperCol={{
                                    offset: 6,
                                    span: 16,
                                }}
                            >
                                <Button style={{ marginRight: "18px" }} type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                <Button onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;
