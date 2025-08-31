import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./PostDetail.module.scss";

function PostDetail() {
    const cx = classNames.bind(styles);
    const { slug } = useParams();
    const urlAPI = process.env.REACT_APP_API_URL;
    const [post, setPost] = useState(null);
    const [fileData, setFileData] = useState([]); // Lưu thông tin file với content-type
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null); // Lưu URL file PDF để hiển thị

    useEffect(() => {
        fetch(urlAPI + "/api/public/posts/" + slug, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                const foundPost = data;
                setPost(foundPost);

                if (foundPost?.file_dto) {
                    const checkFiles = async () => {
                        const filesWithContentType = await Promise.all(
                            foundPost.file_dto.map(async (file) => {
                                const fileUrl = urlAPI + file.downloadUrl;
                                const response = await fetch(fileUrl, { method: "GET" });
                                const contentType = response.headers.get("Content-Type");

                                // Lấy filename từ header Content-Disposition
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
                        setFileData(filesWithContentType);
                    };
                    checkFiles();
                }
            })
            .catch((err) => console.error("Error fetching:", err));
    }, [slug]);

    if (!post) {
        return <p>Loading...</p>;
    }

    const handleFileClick = (fileUrl) => {
        window.open(fileUrl, "_blank"); // Mở file trong tab mới
    };

    const handlePdfPreview = (pdfUrl) => {
        fetch(pdfUrl, {
            method: "GET"
        })
            .then(response => response.blob())
            .then(data => {
                setPdfPreviewUrl(URL.createObjectURL(data));
            }
            )
    };

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
            <h1 className={cx('post-title')}>{post.title}</h1>

            <div className={cx("contents")}>
                <p className={cx('profile')}>
                    {post.author} | {post.create_at}
                </p>

                <div className={cx("")} style={{
                    position: "relative", // Để giữ layout chính xác
                    width: "100%",
                }} dangerouslySetInnerHTML={{ __html: post.content }}></div>

                {/* Phần danh sách file */}
                <div className={cx("files")}>
                    <h3>Files:</h3>
                    {fileData.map((file, index) => (
                        <div className={cx("file-item")} key={index} >
                            <img src={getFileIcon(file.contentType)} alt="File Icon" />
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" onClick={() => handleFileClick(file.fileUrl)}>
                                {file.filename.slice(9)}
                            </a>

                            {/* Nút preview PDF nếu file là PDF */}
                            {file.contentType === "application/pdf" && (
                                <button
                                    className={cx("preview-pdf-button")}
                                    onClick={() => handlePdfPreview(file.fileUrl)}
                                >
                                    Preview PDF
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Hiển thị preview PDF riêng */}
                {pdfPreviewUrl && (
                    <div className={cx("pdf-preview")}>
                        <h3>PDF Preview:</h3>
                        <iframe
                            src={pdfPreviewUrl + "#zoom=67"}
                            title="PDF Preview"
                            width="100%"
                            height="600px"
                        ></iframe>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostDetail;
