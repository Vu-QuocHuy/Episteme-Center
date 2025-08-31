import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./Posts.module.scss";
import ReactQuill from "react-quill";
import { AuthContext } from "~/Authentication/AuthContext";
import { Divider, List, Button } from "antd";
import { Link } from "react-router-dom";


function Posts() {
    const url = process.env.REACT_APP_API_URL; // URL API của bạn
    const cx = classNames.bind(styles);
    const editorRef = useRef(null);
    const { user } = useContext(AuthContext);

    const modules = {
        toolbar: [
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike'],// Các nút căn chỉnh văn bản
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'], // Các nút định dạng văn bản
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Các nút danh sách
            ['link', 'image'], // Các nút thêm link và hình ảnh
            [{ 'size': [false, 'small', 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }], // Các nút chọn Heading 1, 2, 3
            ['clean'], // Nút xóa định dạng
        ]
    };
    const token = localStorage.getItem("auth_token")

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [postToUpdate, setPostToUpdate] = useState(null);
    const [fileData, setFileData] = useState([]);
    const [myPosts, setMyPosts] = useState([]);

    const size = 10;

    console.log(posts)

    const fetchMyPosts = async (page) => {
        try {
            const response = await fetch(`${url}/api/public/posts?page=${page}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch my posts")
            }
            const data = await response.json();
            const arr = []
            data.content.map((item) => {
                arr.push(item)
            })
            setMyPosts(arr);


        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    const handleEditorChange = (value) => {
        setPostToUpdate({ ...postToUpdate, content: value }); // Cập nhật nội dung vào content
    };

    const fetchPosts = async (currentPage) => {
        setLoading(true);
        try {
            const response = await fetch(`${url}/api/public/posts?page=${currentPage}&size=${size}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.status}`);
            }

            const data = await response.json();
            setPosts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async () => {
        if (!postToUpdate) return;

        try {
            // Tạo FormData từ dữ liệu
            const formData = new FormData();

            // Thêm các trường thông tin cơ bản
            formData.append("title", postToUpdate.title);
            formData.append("content", postToUpdate.content);
            formData.append("author_id", 2);

            // Thêm từng ID file cần xóa dưới dạng các trường riêng biệt tên deleteFileIds
            if (postToUpdate.deleteFileIds) {
                postToUpdate.deleteFileIds.forEach((fileId) => {
                    formData.append("deleteFileIds", fileId);
                });
            }

            // Thêm các file mới (nếu có)
            if (postToUpdate.newFiles) {
                postToUpdate.newFiles.forEach((file) => {
                    formData.append("file", file); // Mỗi file là một phần trong FormData
                });
            }

            const token = localStorage.getItem("auth_token")
            // Gửi FormData qua API
            const response = await fetch(`${url}/api/posts/${postToUpdate.post_id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                } // FormData không cần Content-Type, fetch tự thêm
            });

            if (!response.ok) {
                throw new Error("Failed to update post");
            }

            alert("Bài viết đã được cập nhật thành công!");
            fetchPosts(page); // Tải lại danh sách bài viết
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Cập nhật bài viết thất bại!");
        } finally {
            setIsUpdateModalOpen(false); // Đóng modal
            setPostToUpdate(null); // Reset bài viết cần chỉnh sửa
        }
    };




    const openUpdateModal = async (post) => {
        const response = await fetch(`${url}/api/public/posts/${post.postId}`, {
            method: "GET",
        });

        if (!response.ok) {
            console.error("Failed to get post");
            return;
        }

        const data = await response.json();
        setPostToUpdate({ ...data, deleteFileIds: [] });

        if (data?.file_dto) {
            const checkFiles = async () => {
                const filesWithContentType = await Promise.all(
                    data.file_dto.map(async (file) => {
                        const fileUrl = url + file.downloadUrl;
                        const response = await fetch(fileUrl, { method: "GET" });
                        const contentType = response.headers.get("Content-Type");

                        let filename = "Unknown";
                        const contentDisposition = response.headers.get("Content-Disposition");
                        if (contentDisposition && contentDisposition.includes("filename=")) {
                            const match = contentDisposition.match(/filename="?([^"]+)"?/);
                            if (match) {
                                filename = match[1];
                            }
                        }
                        return { ...file, contentType, fileUrl, filename };
                    })
                );
                setFileData(filesWithContentType); // Chỉ khởi tạo khi tải modal
            };
            checkFiles();
        }

        setIsUpdateModalOpen(true); // Đặt trạng thái mở modal
    };


    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setPostToUpdate(null);
    };

    const handleDeleteFile = (fileId) => {
        if (!fileId) {
            console.error("Invalid file ID:", fileId); // Debug nếu fileId không hợp lệ
            return;
        }

        // Cập nhật danh sách file cần xóa trong `postToUpdate`
        setPostToUpdate((prevPost) => {
            const updatedDeleteFileIds = prevPost.deleteFileIds
                ? [...prevPost.deleteFileIds, fileId] // Thêm fileId vào danh sách
                : [fileId];
            return {
                ...prevPost,
                deleteFileIds: updatedDeleteFileIds,
            };
        });

        // Loại bỏ file khỏi danh sách hiển thị trong modal
        setFileData((prevFileData) => {
            const updatedFileData = prevFileData.filter((file) => file.id !== fileId);
            return updatedFileData;
        });
    };



    const deletePost = async () => {
        if (!postToDelete) return;

        const token = localStorage.getItem("auth_token")

        try {
            const response = await fetch(`${url}/api/posts/${postToDelete.postId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            alert("Bài viết đã được xóa thành công!");
            fetchPosts(page);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Xóa bài viết thất bại!");
        } finally {
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
        }
    };

    const handleAddNewFiles = (files) => {
        // Chuyển từ FileList thành array để dễ thao tác
        const filesArray = Array.from(files);

        // Cập nhật vào state
        setPostToUpdate((prevPost) => ({
            ...prevPost,
            newFiles: [...(prevPost.newFiles || []), ...filesArray],
        }));

    };

    const handleRemoveNewFile = (index) => {
        setPostToUpdate((prevPost) => {
            const updatedFiles = [...prevPost.newFiles];
            updatedFiles.splice(index, 1); // Xóa file tại vị trí index
            return { ...prevPost, newFiles: updatedFiles };
        });

    };


    const openDeleteModal = (post) => {
        setPostToDelete(post);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPostToDelete(null);
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
        fetchPosts(pageNumber);
    };

    useEffect(() => {
        fetchPosts(0);
        fetchMyPosts(0);
    }, []);

    const getFileIcon = (contentType) => {
        if (contentType.startsWith("image/")) {
            return "https://cdn-icons-png.flaticon.com/512/7274/7274156.png"; // Icon ảnh
        }
        if (contentType === "application/pdf") {
            return "https://png.pngtree.com/png-clipart/20220612/original/pngtree-pdf-file-icon-png-png-image_7965915.png"; // Icon PDF
        }
        if (contentType === "application/docx" || contentType.includes("word")) {
            return "https://download.logo.wine/logo/Microsoft_Word/Microsoft_Word-Logo.wine.png"; // Icon Word
        }
        if (contentType === "application/xlsx" || contentType.includes("excel")) {
            return "https://cdn.pixabay.com/photo/2023/06/01/12/02/excel-logo-8033473_960_720.png"; // Icon Excel
        }
        return "https://cdn-icons-png.flaticon.com/512/2246/2246713.png"; // Icon mặc định
    };

    return (
        <div className={cx("container")}>
            <div className={cx("posts-list")}>
                <Divider orientation="left"><h1>Tất cả bài viết</h1></Divider>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.postId} className={cx("post-item")}>
                            <div className={cx("post-image")}>
                                <img src={post.file_dto[0] ? (url + post.file_dto[0].downloadUrl) : "https://actvn.edu.vn/News/GetImage/28237"} alt=""></img>
                            </div>
                            <div className={cx("post-content")}>
                                <Link to={`/posts/${post.postId}`} className={cx("post-title")}>{post.title}</Link>
                                <p className={cx("post-meta")}>
                                    Tác giả: {post.authorName} | Ngày tạo: {post.createAt}
                                </p>
                                <p className={cx("post-excerpt")} dangerouslySetInnerHTML={{ __html: post.content }}>
                                </p>
                                <div className={cx("actions")}>
                                    <a href={`/posts/${post.postId}`} className={cx("read-more")}>
                                        Xem chi tiết
                                    </a>
                                    {!(user?.roles.includes("ROLE_STUDENT") || user == null) && <div className={cx("UD-buttons")}>
                                        <Button
                                            className={cx("update-button")}
                                            onClick={() => openUpdateModal(post)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <button
                                            className={cx("delete-button")}
                                            onClick={() => openDeleteModal(post)}
                                        >
                                            Xóa
                                        </button>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có bài viết nào để hiển thị.</p>
                )}

                <div className={cx("pagination")}>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            className={cx("page-button", { active: page === index })}
                            onClick={() => handlePageClick(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className={cx("loading")}>Đang tải...</p>}



            {isUpdateModalOpen && (
                <div className={cx('modal-overlay')}>
                    <div className={cx("update-modal")}>
                        <h2>Chỉnh sửa bài viết</h2>
                        <div className={cx("update-content")}>
                            <input
                                className={cx("title")}
                                value={postToUpdate?.title || ""}
                                onChange={(e) =>
                                    setPostToUpdate({ ...postToUpdate, title: e.target.value })
                                }
                            />
                            <ReactQuill
                                className={cx('content')}
                                ref={editorRef}
                                theme="snow"   // Sử dụng theme snow
                                value={postToUpdate?.content || ""}
                                onChange={handleEditorChange}  // Xử lý thay đổi nội dung
                                modules={modules}  // Sử dụng các module cơ bản
                                placeholder="Nhập nội dung bài viết ở đây..."  // Placeholder cho editor
                            />
                        </div>
                        <div className={cx("files")}>
                            <h3>Files:</h3>
                            {/* Danh sách các file hiện tại */}
                            {fileData.map((file, index) => (
                                <div className={cx("file-item")} key={file.id || index}>
                                    <img
                                        src={getFileIcon(file.contentType)}
                                        alt="File Icon"
                                        style={{ width: "20px", marginRight: "10px" }}
                                    />
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                        {file.filename}
                                    </a>
                                    <button
                                        className={cx("delete-file-button")}
                                        onClick={() => handleDeleteFile(file.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                            {/* Thêm file mới */}
                            <h3>Thêm file mới:</h3>
                            <input
                                type="file"
                                title=" "
                                multiple
                                className={cx("custom-file-input")}
                                onChange={(e) => handleAddNewFiles(e.target.files)}
                            />
                            {/* Hiển thị danh sách các file mới được chọn */}
                            {postToUpdate?.newFiles && postToUpdate.newFiles.length > 0 && (
                                <div className={cx("new-files")}>
                                    <h4>Các file mới:</h4>
                                    {postToUpdate.newFiles.map((file, index) => (
                                        <div className={cx("file-item")} key={index}>
                                            <span>{file.name}</span>
                                            <button
                                                className={cx("delete-file-button")}
                                                onClick={() => handleRemoveNewFile(index)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={cx("modal-actions")}>
                            <button className={cx("confirm-button")} onClick={updatePost}>
                                Chấp nhận
                            </button>
                            <button className={cx("cancel-button")} onClick={closeUpdateModal}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isDeleteModalOpen && (
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal-content")}>
                        <p>
                            Bạn có chắc chắn muốn xóa bài viết{" "}
                            <strong>{postToDelete?.title}</strong> không?
                        </p>
                        <div className={cx("modal-actions")}>
                            <button className={cx("confirm-button")} onClick={deletePost}>
                                Chấp nhận
                            </button>
                            <button className={cx("cancel-button")} onClick={closeDeleteModal}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={cx("my-post")}>
                <Divider orientation="left"><h3>Bài viết mới nhất</h3></Divider>
                <List
                    bordered
                    pagination={{
                        position: "bottom",
                        align: "center",
                        onChange: (page) => {
                            fetchMyPosts(page - 1);
                        },
                        pageSize: 10,
                    }}
                    dataSource={myPosts}
                    renderItem={(item) => (
                        <List.Item>
                            <Link to={`/posts/${item.postId}`}>{item.title}</Link>
                        </List.Item>
                    )}>

                </List>
            </div>
        </div>
    );
}

export default Posts;
