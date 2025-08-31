import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./StudentManagement.module.scss";

const cx = classNames.bind(styles);

function StudentManagement() {
    const [users, setUsers] = useState([]); // Danh sách sinh viên
    const [selectedStudent, setSelectedStudent] = useState(null); // Thông tin sinh viên chi tiết
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách sau khi lọc
    const [classes, setClasses] = useState([]); // Danh sách lớp
    const [selectedClass, setSelectedClass] = useState(""); // Lớp được chọn

    const [pagination, setPagination] = useState({
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
    });

    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [editMode, setEditMode] = useState(false);

    const apiURL = "http://localhost:8084/api/students";

    const getAuthHeaders = () => {
        const token = localStorage.getItem("auth_token");
        return { "Authorization": `Bearer ${token}` };
    };

    // Fetch danh sách sinh viên
    const fetchUsers = async (page = 0) => {
        try {
            const response = await fetch(`${apiURL}?page=${page}&size=${pagination.pageSize}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            setUsers(data.content);
            setFilteredUsers(data.content); // Mặc định hiển thị tất cả
            setPagination({
                totalPages: data.totalPages,
                currentPage: data.currentPage,
                pageSize: data.pageSize,
            });
            extractClasses(data.content);
        } catch (error) {
            alert("Error fetching users:", error);
        }
    };

    const handleViewDetails = async (maSinhVien) => {
        try {
            // Gọi API để lấy thông tin sinh viên
            const response = await fetch(`${apiURL}/${maSinhVien}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();

            // Fetch ảnh với token
            const avatarResponse = await fetch(`http://localhost:8084${data.avaDownloadUrl}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            const avatarBlob = await avatarResponse.blob();
            const avatarUrl = URL.createObjectURL(avatarBlob);

            // Gán thông tin sinh viên và ảnh
            setSelectedStudent({ ...data, avatarUrl });
            setShowDetailsModal(true);
        } catch (error) {
            alert("Error fetching student details:", error);
        }
    };


    // Lấy danh sách lớp
    const extractClasses = (users) => {
        const uniqueClasses = [...new Set(users.map((user) => user.tenLop))];
        setClasses(uniqueClasses);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý bộ lọc
    const handleFilterChange = (e) => {
        const selected = e.target.value;
        setSelectedClass(selected);
        if (selected === "") {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter((user) => user.tenLop === selected));
        }
    };

    // Thêm mới
    const handleAddUser = () => {
        setShowForm(true);
        setEditMode(false);
        setCurrentUser({
            maSinhVien: "",
            tenSinhVien: "",
            gioiTinh: "",
            ngaySinh: "",
            queQuan: "",
            khoa: "",
            tenLop: "",
        });
    };

    // Sửa
    const handleEditUser = (user) => {
        setShowForm(true);
        setEditMode(true);
        setCurrentUser(user);
    };

    // Lưu sinh viên
    const handleSaveUser = async () => {
        try {
            const formData = new FormData();
            formData.append("maSinhVien", currentUser.maSinhVien);
            formData.append("tenSinhVien", currentUser.tenSinhVien);
            formData.append("gioiTinh", currentUser.gioiTinh);
            formData.append("ngaySinh", currentUser.ngaySinh);
            formData.append("queQuan", currentUser.queQuan);
            formData.append("khoa", currentUser.khoa);
            formData.append("tenLop", currentUser.tenLop);

            const method = editMode ? "PUT" : "POST";
            const url = editMode ? `${apiURL}/${currentUser.maSinhVien}` : apiURL;

            await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // Không thêm Content-Type vì FormData tự thiết lập
                },
                body: formData,
            });

            setShowForm(false);
            fetchUsers(pagination.currentPage);
            editMode ? alert("Chỉnh sửa thành công") : alert("Thêm sinh viên thành công")// Làm mới danh sách
        } catch (error) {
            alert("Error saving user:", error);
        }
    };



    // Xóa sinh viên
    const handleDeleteUser = async (maSinhVien) => {
        try {
            await fetch(`${apiURL}/${maSinhVien}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            fetchUsers(pagination.currentPage);
        } catch (error) {
            alert("Error deleting user:", error);
        }
    };

    // Chuyển trang
    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    return (
        <div className={cx("user-management")}>
            <h2 className={cx("title")}>Quản Lý Sinh Viên</h2>

            {/* Bộ lọc lớp */}
            <div className={cx("filter-section")}>
                <label htmlFor="classFilter">Lọc theo lớp:</label>
                <select id="classFilter" value={selectedClass} onChange={handleFilterChange}>
                    <option value="">Tất cả</option>
                    {classes.map((cls, index) => (
                        <option key={index} value={cls}>
                            {cls}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddUser} className={cx("add-button")}>
                    Thêm Sinh Viên
                </button>
            </div>

            {/* Bảng danh sách */}
            <table className={cx("user-table")}>
                <thead>
                    <tr>
                        <th>Mã SV</th>
                        <th>Tên</th>
                        <th>Giới tính</th>
                        <th>Ngày sinh</th>
                        <th>Quê quán</th>
                        <th>Khoa</th>
                        <th>Lớp</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.maSinhVien}>
                            <td>
                                <button
                                    onClick={() => handleViewDetails(user.maSinhVien)}
                                    className={cx("link-button")}
                                >
                                    {user.maSinhVien}
                                </button>
                            </td>
                            <td>{user.tenSinhVien}</td>
                            <td>{user.gioiTinh}</td>
                            <td>{user.ngaySinh}</td>
                            <td>{user.queQuan}</td>
                            <td>{user.khoa}</td>
                            <td>{user.tenLop}</td>
                            <td>
                                <button onClick={() => handleEditUser(user)} className={cx("edit-button")}>
                                    Sửa
                                </button>
                                <button onClick={() => handleDeleteUser(user.maSinhVien)} className={cx("delete-button")}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Thông tin chi tiết */}
            {showDetailsModal && selectedStudent && (
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal-container")}>
                        <h3>Thông Tin Sinh Viên</h3>
                        <img
                            src={`http://localhost:8084${selectedStudent.avaDownloadUrl}`}
                            alt="Avatar"
                            className={cx("avatar")}
                        />
                        <ul className={cx("details-list")}>
                            <li><strong>Mã SV:</strong> {selectedStudent.maSinhVien}</li>
                            <li><strong>Tên:</strong> {selectedStudent.tenSinhVien}</li>
                            <li><strong>Giới tính:</strong> {selectedStudent.gioiTinh}</li>
                            <li><strong>Ngày sinh:</strong> {selectedStudent.ngaySinh}</li>
                            <li><strong>Email:</strong> {selectedStudent.email}</li>
                            <li><strong>Số điện thoại:</strong> {selectedStudent.dienThoai}</li>
                            <li><strong>Quê quán:</strong> {selectedStudent.queQuan}</li>
                            <li><strong>Địa chỉ hiện tại:</strong> {selectedStudent.diaChiHienTai}</li>
                            <li><strong>CCCD:</strong> {selectedStudent.cccd}</li>
                            <li><strong>Khoa:</strong> {selectedStudent.khoa}</li>
                            <li><strong>Lớp:</strong> {selectedStudent.tenLop}</li>
                        </ul>
                        <button onClick={() => setShowDetailsModal(false)} className={cx("close-button")}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Phân trang */}
            <div className={cx("pagination")}>
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className={cx("pagination-button")}
                >
                    Trang trước
                </button>
                <span className={cx("pagination-info")}>
                    Trang {pagination.currentPage + 1} / {pagination.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage + 1 === pagination.totalPages}
                    className={cx("pagination-button")}
                >
                    Trang sau
                </button>
            </div>

            {/* Form thêm/sửa */}
            {showForm && (
                <div className={cx("form-overlay")}>
                    <div className={cx("form-container")}>
                        <h3>{editMode ? "Sửa Sinh Viên" : "Thêm Sinh Viên"}</h3>

                        {/* Mã Sinh Viên */}
                        <input
                            type="text"
                            placeholder="Mã SV"
                            value={currentUser.maSinhVien}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, maSinhVien: e.target.value })
                            }
                            disabled={editMode} // Không cho chỉnh sửa mã SV khi sửa
                            className={cx("input")}
                        />

                        {/* Tên Sinh Viên */}
                        <input
                            type="text"
                            placeholder="Tên Sinh Viên"
                            value={currentUser.tenSinhVien}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, tenSinhVien: e.target.value })
                            }
                            className={cx("input")}
                        />

                        {/* Giới Tính */}
                        <input
                            type="text"
                            placeholder="Giới Tính"
                            value={currentUser.gioiTinh}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, gioiTinh: e.target.value })
                            }
                            className={cx("input")}
                        />

                        {/* Ngày Sinh */}
                        <input
                            type="date"
                            placeholder="Ngày Sinh"
                            value={
                                currentUser.ngaySinh
                                    ? currentUser.ngaySinh.split("T")[0] // Chuyển ngày về dạng yyyy-MM-dd
                                    : ""
                            }
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, ngaySinh: e.target.value })
                            }
                            className={cx("input")}
                        />


                        {/* Quê Quán */}
                        <input
                            type="text"
                            placeholder="Quê Quán"
                            value={currentUser.queQuan}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, queQuan: e.target.value })
                            }
                            className={cx("input")}
                        />

                        {/* Khoa */}
                        <input
                            type="text"
                            placeholder="Khoa"
                            value={currentUser.khoa}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, khoa: e.target.value })
                            }
                            className={cx("input")}
                        />

                        {/* Lớp */}
                        <input
                            type="text"
                            placeholder="Lớp"
                            value={currentUser.tenLop}
                            onChange={(e) =>
                                setCurrentUser({ ...currentUser, tenLop: e.target.value })
                            }
                            className={cx("input")}
                        />

                        {/* Buttons */}
                        <div className={cx("form-actions")}>
                            <button onClick={handleSaveUser} className={cx("save-button")}>
                                Lưu
                            </button>
                            <button onClick={() => setShowForm(false)} className={cx("cancel-button")}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default StudentManagement;
