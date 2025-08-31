import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import classNames from 'classnames/bind';
import styles from './CreatePost.module.scss';
import './CreatePost.css'
import { Editor } from "@tinymce/tinymce-react";


function CreatePost() {
    const api = process.env.REACT_APP_API_URL;
    const cx = classNames.bind(styles);
    const editorRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });
    const [files, setFiles] = useState([]); // Lưu danh sách file
    const [thumbnail, setThumbnail] = useState(null); // Lưu file ảnh tiêu đề
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Lưu URL preview ảnh tiêu đề
    const [editorContent, setEditorContent] = useState("");

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
            ['table'],
            // Nút xóa định dạng
        ]
    };

    const token = localStorage.getItem("auth_token")


    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Gửi ảnh lên server và lấy URL ảnh
            const response = await fetch(api + "/uploadImg", {
                method: "POST",
                body: formData,

            });
            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // Nhận URL và ID ảnh từ server
            const data = await response.json();

            console.log(data);

            // Chèn ảnh vào Quill với thuộc tính data-id
            const quill = editorRef.current.getEditor();
            const range = quill.getSelection(); // Lấy vị trí chèn ảnh
            const image = `<img src="${api + data.downloadUrl}" data-id="${data.id}"/>`; // Tạo thẻ <img> với data-id

            // Chèn ảnh vào vị trí con trỏ
            quill.clipboard.dangerouslyPasteHTML(range.index, image);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const editorStyle = {
        fontWeight: 'normal',
        // Đảm bảo không có bôi đậm mặc định
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditorChange = (value) => {
        setFormData({ ...formData, content: value }); // Cập nhật nội dung vào content
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files); // Chuyển FileList thành mảng
        setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Gộp file mới vào danh sách
        e.target.value = ''; // Reset input file để có thể chọn lại cùng tên file
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0]; // Lấy file đầu tiên được chọn
        if (file) {
            setThumbnail(file); // Lưu file ảnh tiêu đề vào state
            setThumbnailPreview(URL.createObjectURL(file)); // Tạo URL để hiển thị preview
        }
        e.target.value = ''; // Reset input file
    };

    const removeThumbnail = () => {
        setThumbnail(null); // Xóa file ảnh tiêu đề khỏi state
        setThumbnailPreview(null); // Xóa preview
    };

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Xóa file tại vị trí index
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const bodyData = new FormData();
        bodyData.append('title', formData.title);
        bodyData.append('content', editorContent);

        const allFiles = thumbnail ? [thumbnail, ...files] : files;

        allFiles.forEach((file) => {
            bodyData.append('file', file, file.name);
        });

        const token = localStorage.getItem("auth_token")

        fetch(api + '/api/posts', {
            method: 'POST',
            body: bodyData,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to create post');
                }
                return response.text();
            })
            .then((data) => {
                alert('Bài viết đã được tạo thành công!');
                setFiles([]); // Reset danh sách file sau khi upload thành công
                setThumbnail(null); // Reset ảnh tiêu đề
                setThumbnailPreview(null); // Reset preview
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Đã xảy ra lỗi khi tạo bài viết.');
            });
    };

    const renderFileList = () => {
        if (files.length === 0) {
            return <p className={cx('no-files')}>Chưa có tệp nào được chọn.</p>;
        }
        return (
            <ul className={cx('file-list')}>
                {files.map((file, index) => (
                    <li key={index} className={cx('file-item')}>
                        {file.name}
                        <button
                            type="button"
                            className={cx('remove-file-button')}
                            onClick={() => removeFile(index)}
                        >
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        );
    };



    return (
        <div className={cx('container')}>
            <h2 className={cx('title')}>Tạo Bài Viết Mới</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <label className={cx('label')}>
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className={cx('input')}
                    />
                </label>
                <br />

                <div className={cx('label')}>
                    Content:
                    <Editor
                        apiKey="8bg7zb9qu8fvseg9gigmni6bbgp0yu9ce25mvyurt11xf3k4"
                        initialValue=""
                        init={{
                            height: 400,
                            menubar: "file edit view insert format tools table help",
                            plugins: [
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "preview",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "code",
                                "help",
                                "wordcount",
                            ],
                            toolbar:
                                "undo redo | blocks | " +
                                "bold italic forecolor | alignleft aligncenter " +
                                "alignright alignjustify | bullist numlist outdent indent | table |" +
                                "removeformat | help",
                            file_picker_callback: (async (callback, value, meta) => {
                                // Kiểm tra loại file được chọn
                                if (meta.filetype === "image") {
                                    // Xử lý tải ảnh
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = "image/*";
                                    input.onchange = async function () {
                                        const formData = new FormData();
                                        formData.append("file", input.files[0]);

                                        try {
                                            // Tải ảnh lên server
                                            const response = await fetch(api + "/uploadImg", {
                                                method: "POST",
                                                headers: {
                                                    "Authorization": `Bearer ${token}`,
                                                },
                                                body: formData
                                            })

                                            const data = await response.json();

                                            if (data) {
                                                console.log(data)
                                                const imageUrl = `${api}${data.downloadUrl}`; // URL đầy đủ của ảnh

                                                // Gọi callback để chèn ảnh vào editor
                                                callback(imageUrl, { alt: "Uploaded Image" });
                                            } else {
                                                alert("Không thể tải ảnh lên.");
                                            }
                                        } catch (error) {
                                            console.error("Error uploading image", error);
                                            alert("Không thể tải ảnh lên.");
                                        }

                                    };
                                    input.click(); // Mở hộp thoại chọn file
                                } else if (meta.filetype === "file") {
                                    // Xử lý tải tệp tin (PDF, Word, Excel...)
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".pdf,.doc,.docx,.xls,.xlsx"; // Cho phép chọn các tệp tin
                                    input.onchange = async function () {
                                        const file = input.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append("file", file);

                                            try {
                                                // Tải ảnh lên server
                                                const response = await fetch(api + "/uploadImg", {
                                                    method: "POST",
                                                    headers: {
                                                        "Authorization": `Bearer ${token}`
                                                    },
                                                    body: formData
                                                })

                                                const data = await response.json();

                                                if (data) {
                                                    const imageUrl = `${api}${data.downloadUrl}`; // URL đầy đủ của ảnh

                                                    // Gọi callback để chèn ảnh vào editor
                                                    callback(imageUrl, { alt: "Uploaded Image" });
                                                } else {
                                                    alert("Không thể tải ảnh lên.");
                                                }
                                            } catch (error) {
                                                console.error("Error uploading image", error);
                                                alert("Không thể tải ảnh lên.");
                                            }
                                        }
                                    };
                                    input.click(); // Mở hộp thoại chọn file
                                } else if (meta.filetype === "link") {
                                    // Xử lý liên kết (URL)
                                    const url = prompt("Nhập URL của liên kết:");
                                    if (url) {
                                        // Gọi callback để chèn URL vào editor
                                        callback(url);
                                    }
                                }
                            })
                        }}
                        value={editorContent}
                        onEditorChange={(content) => setEditorContent(content)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                </div>

                <br />
                <label className={cx('custom-file-label')}>
                    Thêm Ảnh Tiêu Đề:
                    <input
                        type="file"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        className={cx('file-input')}
                    />
                </label>
                {thumbnailPreview && (
                    <div className={cx('thumbnail-preview')}>
                        <p>Xem trước ảnh tiêu đề:</p>
                        <img src={thumbnailPreview} alt="Thumbnail Preview" className={cx('thumbnail-image')} />
                        <button
                            type="button"
                            className={cx('remove-thumbnail-button')}
                            onClick={removeThumbnail}
                        >
                            &times;
                        </button>
                    </div>
                )}
                <br />
                <label className={cx('custom-file-label')}>
                    Thêm Nhiều Tệp:
                    <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className={cx('file-input')}
                    />
                </label>
                <br />
                {renderFileList()}
                <br />
                <button type="submit" className={cx('create-button')}>
                    Tạo Bài Viết
                </button>
            </form>
        </div>
    );
}

export default CreatePost;
