import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./CourseDocument.module.scss";
import { Button, Divider, Form, Input, InputNumber, Modal, Select, Upload } from "antd";
import { Option } from "antd/es/mentions";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "~/Authentication/AuthContext";

const cx = classNames.bind(styles);

function CourseDocument() {
    const { user } = useAuth();
    const [courses1, setCourses1] = useState([]);
    const [courses2, setCourses2] = useState([]);
    const [courses3, setCourses3] = useState([]); // Danh sách môn học
    const [showForm, setShowForm] = useState(false); // Hiển thị form
    const [editMode, setEditMode] = useState(false); // Chế độ sửa
    const [currentCourse, setCurrentCourse] = useState(null); // Môn học hiện tại
    const [selectedFiles, setSelectedFiles] = useState([]); // File đã chọn
    const apiURL = "http://localhost:8084/api/monhoc/grouped";

    // Fetch danh sách môn học
    const fetchCourses1 = async () => {
        try {
            const response = await fetch(apiURL, {
                headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
            });
            const data = await response.json();
            setCourses1(data["GENERAL"]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách môn học:", error);
        }
    };

    const fetchCourses2 = async () => {
        try {
            const response = await fetch(apiURL, {
                headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
            });
            const data = await response.json();
            setCourses2(data["FOUNDATION"]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách môn học:", error);
        }
    };

    const fetchCourses3 = async () => {
        try {
            const response = await fetch(apiURL, {
                headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
            });
            const data = await response.json();
            setCourses3(data["SPECIALIZED"]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách môn học:", error);
        }
    };

    const token = localStorage.getItem("auth_token")

    useEffect(() => {
        fetchCourses1();
        fetchCourses2();
        fetchCourses3();
    }, []);

    // Mở form thêm mới
    const handleAddCourse = () => {
        setCurrentCourse({ tenMonHoc: "", moTa: "", soTinChi: "" });
        setSelectedFiles([]);
        setEditMode(false);
        setShowForm(true);
    };

    // Mở form chỉnh sửa
    const handleEditCourse = (course) => {
        setCurrentCourse(course);
        setSelectedFiles([]);
        setEditMode(true);
        setShowForm(true);
    };

    // Xóa file đã chọn trước khi gửi lên API
    const handleRemoveFile = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
    };

    // Xóa môn học
    const handleDeleteCourse = async (idMonHoc) => {
        try {
            await fetch(`${apiURL}/${idMonHoc}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
            });
            fetchCourses1();
            fetchCourses2();
            fetchCourses3();
        } catch (error) {
            console.error("Lỗi khi xóa môn học:", error);
        }
    };

    // Xử lý chọn file
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // Lưu môn học
    const handleSaveCourse = async () => {
        const formData = new FormData();
        formData.append("tenMonHoc", currentCourse.tenMonHoc);
        formData.append("moTa", currentCourse.moTa);
        formData.append("soTinChi", currentCourse.soTinChi);

        selectedFiles.forEach((file) => {
            formData.append("file", file); // Tất cả file dùng field "file"
        });

        const method = editMode ? "PUT" : "POST";
        const url = editMode ? `${apiURL}/${currentCourse.idMonHoc}` : apiURL;

        try {
            await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
                body: formData,
            });
            setShowForm(false);
            fetchCourses1();
            fetchCourses2();
            fetchCourses3();
        } catch (error) {
            console.error("Lỗi khi lưu môn học:", error);
        }
    };

    const [form] = Form.useForm();
    const onFinish = async (values) => {
        const formData = new FormData();

        // Thêm các trường dữ liệu từ form
        formData.append("tenMonHoc", values.Input);
        formData.append("moTa", values.descript);
        formData.append("soTinChi", values.tinchi);
        formData.append("category", values.kind);
        // Tên sự kiện
        // Xử lý file upload
        if (values.document && values.document.length > 0) {
            values.document.forEach((file) => {
                formData.append("file", file.originFileObj); // Tất cả đều có key "file"
            });
        }

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Gửi FormData qua Fetch API
        try {
            const response = await fetch("http://localhost:8084/api/monhoc", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Thêm môn học thành công");
            } else {
                console.error("Failed:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }

        fetchCourses1();
        fetchCourses2();
        fetchCourses3();
    };

    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div className={cx("course-document")}>
            <div className={cx("title-school")}>
                <img src="https://actvn-edu.appspot.com/resources/images/hvmm/tag-nganh.svg" />
                <span>
                    CÔNG NGHỆ THÔNG TIN</span>
                {(user.roles.includes("ROLE_ADMIN") || user.roles.includes("ROLE_EMPLOYEE")) && <Button onClick={showModal} className={cx("add-button")}>Thêm Môn Học</Button>}
                <Modal title="Thêm môn học mới" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <Form
                        form={form}
                        style={{
                            maxWidth: 600,
                        }}
                        className={cx("form")}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="Tên môn học"
                            name="Input"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả"
                            name="descript"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                            ]}
                        >
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                            label="Số tín chỉ"
                            name="tinchi"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                            ]}
                        >
                            <InputNumber />
                        </Form.Item>
                        <Form.Item
                            label="Tài liệu"
                            name="document"
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
                            label="Thể loại"
                            name="kind"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input!',
                                },
                            ]}
                        >
                            <Select>
                                <Option value="GENERAL">Đại cương</Option>
                                <Option value="FOUNDATION">Cơ sở ngành</Option>
                                <Option value="SPECIALIZED">Chuyên ngành</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{
                                offset: 6,
                                span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>


            {/* Danh sách môn học */}
            <h3 className={cx("title-list")}>Môn học đại cương</h3>
            <div className={cx("course-list")}>

                {courses1.map((course) => (
                    <div key={course.monHocID} className={cx("course-card")}>
                        <img src="https://actvn-edu.appspot.com/resources/images/background-course.jpg"></img>
                        <h3>{course.tenMonHoc}</h3>
                        <p><strong>Mô tả:</strong> {course.description}</p>

                        {/* Hiển thị tài liệu */}
                        {/* <div className={cx("documents")}>
                            <h4>Tài liệu:</h4>
                            {course.taiLieuMHList?.map((doc) => (
                                <a
                                    key={doc.id}
                                    href={`http://localhost:8084${doc.downloadUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Tải tài liệu {doc.id}
                                </a>
                            ))}
                        </div> */}

                        {/* Hành động */}
                        {!user.roles.includes("ROLE_STUDENT") && <div className={cx("actions")}>
                            <button onClick={() => handleEditCourse(course)} className={cx("edit-button")}>
                                Sửa
                            </button>
                            <button onClick={() => handleDeleteCourse(course.idMonHoc)} className={cx("delete-button")}>
                                Xóa
                            </button>
                        </div>}
                    </div>
                ))}
            </div>

            <h3 className={cx("title-list")}>Cơ sở ngành</h3>
            <div className={cx("course-list")}>

                {courses2.map((course) => (
                    <div key={course.monHocID} className={cx("course-card")}>
                        <img src="https://actvn-edu.appspot.com/resources/images/background-course.jpg"></img>
                        <h3>{course.tenMonHoc}</h3>
                        <p><strong>Mô tả:</strong> {course.description}</p>

                        {/* Hiển thị tài liệu */}
                        {/* <div className={cx("documents")}>
                            <h4>Tài liệu:</h4>
                            {course.taiLieuMHList?.map((doc) => (
                                <a
                                    key={doc.id}
                                    href={`http://localhost:8084${doc.downloadUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Tải tài liệu {doc.id}
                                </a>
                            ))}
                        </div> */}

                        {/* Hành động */}
                        {!user.roles.includes("ROLE_STUDENT") && <div className={cx("actions")}>
                            <button onClick={() => handleEditCourse(course)} className={cx("edit-button")}>
                                Sửa
                            </button>
                            <button onClick={() => handleDeleteCourse(course.idMonHoc)} className={cx("delete-button")}>
                                Xóa
                            </button>
                        </div>}
                    </div>
                ))}
            </div>

            <h3 className={cx("title-list")}>Chuyên ngành</h3>
            <div className={cx("course-list")}>

                {courses3.map((course) => (
                    <div key={course.monHocID} className={cx("course-card")}>
                        <img src="https://actvn-edu.appspot.com/resources/images/background-course.jpg"></img>
                        <h3>{course.tenMonHoc}</h3>
                        <p><strong>Mô tả:</strong> {course.description}</p>

                        {/* Hiển thị tài liệu */}
                        {/* <div className={cx("documents")}>
                            <h4>Tài liệu:</h4>
                            {course.taiLieuMHList?.map((doc) => (
                                <a
                                    key={doc.id}
                                    href={`http://localhost:8084${doc.downloadUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Tải tài liệu {doc.id}
                                </a>
                            ))}
                        </div> */}

                        {/* Hành động */}
                        {!user.roles.includes("ROLE_STUDENT") && <div className={cx("actions")}>
                            <button onClick={() => handleEditCourse(course)} className={cx("edit-button")}>
                                Sửa
                            </button>
                            <button onClick={() => handleDeleteCourse(course.idMonHoc)} className={cx("delete-button")}>
                                Xóa
                            </button>
                        </div>}
                    </div>
                ))}
            </div>

            {/* Modal Thêm/Sửa */}
            {showForm && (
                <div className={cx("form-overlay")}>
                    <div className={cx("form-container")}>
                        <h3>{editMode ? "Chỉnh Sửa Môn Học" : "Thêm Môn Học"}</h3>
                        <input
                            type="text"
                            placeholder="Tên Môn Học"
                            value={currentCourse.tenMonHoc}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, tenMonHoc: e.target.value })}
                        />
                        <textarea
                            placeholder="Mô Tả"
                            value={currentCourse.moTa}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, moTa: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Số Tín Chỉ"
                            value={currentCourse.soTinChi}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, soTinChi: e.target.value })}
                        />

                        {/* Upload file */}
                        <input type="file" multiple onChange={handleFileChange} />
                        <div className={cx("file-list")}>
                            {selectedFiles.map((file, index) => (
                                <div key={index} className={cx("file-item")}>
                                    {file.name}
                                    <button onClick={() => handleRemoveFile(index)}>Xóa</button>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSaveCourse} className={cx("save-button")}>Lưu</button>
                        <button onClick={() => setShowForm(false)} className={cx("cancel-button")}>Hủy</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseDocument;
