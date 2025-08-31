import React, { useState, useRef, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Editor } from "@tinymce/tinymce-react";
import classNames from "classnames/bind";
import styles from "./AddLMI.module.scss";
import { Button, Form, Input, Modal, Select, Upload } from "antd";
import { Option } from "antd/es/mentions";
import { useParams } from "react-router";
import { UploadOutlined } from "@ant-design/icons";

const cx = classNames.bind(styles);
const ResponsiveGridLayout = WidthProvider(Responsive);

const AddLMI = () => {
    const { slug } = useParams();
    const [layouts, setLayouts] = useState({ lg: [] });
    const [title, setTitle] = useState("")
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ i: "", type: "text", content: "" });
    const [editorContent, setEditorContent] = useState("");
    const itemRefs = useRef({}); // Ref lưu các item
    const api = process.env.REACT_APP_API_URL;

    const addItem = async () => {
        if (!newItem.type || !["text", "input", "image"].includes(newItem.type)) {
            alert("Please select a valid type!");
            return;
        }

        const id = newItem.i || `item-${Date.now()}`;
        itemRefs.current[id] = React.createRef(); // Tạo ref mới cho item

        if (newItem.type === "image" && newItem.content) {
            try {
                const formData = new FormData();
                formData.append("file", newItem.content);

                // Gửi file ảnh lên server qua API
                const response = await fetch(api + "/uploadImg", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (response.ok && result.downloadUrl) {
                    const nextY = layouts.lg.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);
                    setLayouts((prev) => ({
                        ...prev,
                        lg: [
                            ...prev.lg,
                            {
                                i: id,
                                x: 0, // Vị trí x ban đầu
                                y: nextY, // Vị trí y tiếp theo
                                w: 3, // Độ rộng mặc định
                                h: 2, // Chiều cao mặc định
                            },
                        ],
                    }));

                    setItems((prev) => [
                        ...prev,
                        {
                            i: id,
                            type: newItem.type,
                            content: result.downloadUrl, // Lưu URL của ảnh trả về
                        },
                    ]);
                } else {
                    alert("Failed to upload image");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Error uploading image");
            }
        } else if (newItem.type !== "image") {
            const nextY = layouts.lg.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);
            setLayouts((prev) => ({
                ...prev,
                lg: [
                    ...prev.lg,
                    {
                        i: id,
                        x: 0, // Vị trí x ban đầu
                        y: nextY, // Vị trí y tiếp theo
                        w: 3, // Độ rộng mặc định
                        h: 2, // Chiều cao mặc định
                    },
                ],
            }));

            setItems((prev) => [
                ...prev,
                {
                    i: id,
                    type: newItem.type,
                    content: newItem.type === "text" ? editorContent : newItem.content,
                },
            ]);
        }

        setNewItem({ i: "", type: "text", content: "" });
        setEditorContent(""); // Reset nội dung
        handleCancel();
    };

    const removeItem = (id) => {
        setLayouts((prev) => ({
            ...prev,
            lg: prev.lg.filter((item) => item.i !== id),
        }));
        setItems((prev) => prev.filter((item) => item.i !== id));
        delete itemRefs.current[id]; // Xóa ref của item bị xóa
    };

    const adjustItemSize = (layoutItem) => {
        const item = items.find((i) => i.i === layoutItem.i);
        if (!item || item.type !== "text") return; // Chỉ điều chỉnh kích thước cho text

        const ref = itemRefs.current[layoutItem.i];
        if (ref && ref.current) {
            const { offsetWidth, offsetHeight } = ref.current;
            setLayouts((prev) => ({
                ...prev,
                lg: prev.lg.map((layout) =>
                    layout.i === layoutItem.i
                        ? {
                            ...layout,
                            w: Math.ceil(offsetWidth / 100), // Chia theo chiều rộng grid
                            h: Math.ceil(offsetHeight / 30), // Chia theo chiều cao grid
                        }
                        : layout
                ),
            }));
        }
    };


    const renderItemContent = (layoutItem) => {
        const item = items.find((i) => i.i === layoutItem.i);
        if (!item) return <div style={{ color: "red" }}>Invalid Item</div>;

        return (
            <div
                ref={itemRefs.current[layoutItem.i]}
                style={{
                    width: "100%",
                    height: "100%",
                    overflow: item.type === "text" ? "auto" : "hidden", // Chỉ cần scroll cho text
                }}
                onLoad={() => {
                    if (item.type === "text") adjustItemSize(layoutItem); // Chỉ điều chỉnh kích thước cho text
                }} // Điều chỉnh kích thước khi nội dung load
            >
                {(() => {
                    switch (item.type) {
                        case "text":
                            return (
                                <div
                                    dangerouslySetInnerHTML={{ __html: item.content || "<p>Default Text</p>" }}
                                ></div>
                            );
                        case "image":
                            return (
                                <img
                                    src={(api + item.content) || ""}
                                    alt="Uploaded"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            );
                        default:
                            return <div style={{ color: "red" }}>Invalid Type</div>;
                    }
                })()}
            </div>
        );
    };

    const onLayoutChange = (currentLayout) => {
        setLayouts((prev) => ({
            ...prev,
            lg: currentLayout,
        }));
    };
    const generateHTML = () => {
        let maxBottom = 0; // Tính chiều cao lớn nhất của layout

        const layoutHTML = layouts.lg.map((layoutItem) => {
            const item = items.find((i) => i.i === layoutItem.i);
            if (!item) return "";

            const x = layoutItem.x * 23; // Vị trí x tính bằng grid column width
            const y = layoutItem.y * 42; // Vị trí y tính bằng row height
            const width = layoutItem.w * 25; // Chiều rộng
            const height = layoutItem.h * 40; // Chiều cao
            const bottom = y + height;

            if (bottom > maxBottom) {
                maxBottom = bottom;
            }

            let contentHTML = "";
            switch (item.type) {
                case "text":
                    contentHTML = `<div>${item.content || "Default Text"}</div>`
                    break;
                case "input":
                    contentHTML = `<input type="text" value="${item.content || ""}" readonly />`;
                    break;
                case "image":
                    contentHTML = `<img src=${api}${item.content || ""}" alt="Uploaded Image" style="width: 100%; height: 100%; object-fit: cover;" />`;
                    break;
                default:
                    contentHTML = `<div>Invalid Type</div>`;
            }

            return `
                <div
                    style="
                        position: absolute;
                        transform: translate(${x}px, ${y}px);
                        width: ${width - 20}px;
                        height: ${height}px;
                        box-sizing: border-box;
                    "
                >
                    ${contentHTML}
                </div>`;
        });

        return `
            <div
                style="
                    position: relative;
                    width: 100%;
                    height: ${maxBottom}px; /* Đặt chiều cao theo phần tử con */
                    box-sizing: border-box;
                "
            >
                ${layoutHTML.join("\n")}
            </div>
        `;
    };
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const token = localStorage.getItem("auth_token");

    const saveLayout = async () => {
        const html = generateHTML(); // Chuyển layout thành HTML

        try {
            const formData = new FormData();
            formData.append("content", html);
            formData.append("title", title);
            formData.append("menuItemId", slug)
            formData.append("file", fileList[0].originFileObj)

            const response = await fetch(`${api}/api/articles`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Layout saved successfully!");
            } else {
                alert("Failed to save layout");
            }
        } catch (error) {
            console.error("Error saving layout:", error);
            alert("Error saving layout");
        }
    };

    const [fileList, setFileList] = useState([]);
    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    return (
        <div className={cx("main-container")}>
            <h1>Tạo Layout cho MenuItem</h1>
            <div className={cx("title")} style={{ display: "flex", width: "800px", alignItems: "center", marginTop: "20px" }}>
                <h3>Tiêu đề</h3>
                <Input
                    style={{ width: "80%", marginLeft: "20px" }}
                    onChange={(e) => setTitle(e.target.value)}
                ></Input>
            </div>
            <div className={cx("title")} style={{ display: "flex", width: "800px", alignItems: "center", marginTop: "20px" }}>
                <h3 style={{ marginRight: "10px" }}>Ảnh tiêu đề</h3>
                <Upload
                    listType="picture"
                    fileList={fileList}
                    onChange={handleChange}
                    beforeUpload={() => false}
                >
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
            </div>
            <div style={{
                width: "800px",
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                marginTop: "20px"
            }}>
                <Button type="primary" onClick={showModal}>
                    Thêm thành phần
                </Button>

                <Button type="primary" onClick={saveLayout}>
                    Lưu Layout
                </Button>
            </div>
            <Modal
                open={open}
                title="Tạo thành phần cho Layout"
                width={900}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={addItem}>
                        Thêm thành phần
                    </Button>,
                ]}
            >
                <Input
                    placeholder="ID(tùy chọn)"
                    value={newItem.i}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, i: e.target.value }))}
                ></Input>

                <Select
                    value={newItem.type}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, type: e }))}
                >
                    <Option value="text">Text</Option>
                    <Option value="image">Image</Option>
                </Select>


                {newItem.type === "text" && (
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
                )}

                {newItem.type === "image" && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                setNewItem((prev) => ({ ...prev, content: e.target.files[0] })); // Lưu file ảnh
                            }
                        }}
                    />
                )}
            </Modal>

            <div className={cx("watch-layout")}>
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                    cols={{ lg: 44, md: 44, sm: 44, xs: 4 }}
                    rowHeight={30}
                    onLayoutChange={onLayoutChange}
                >
                    {layouts.lg.map((layoutItem) => (
                        <div key={layoutItem.i} className={cx("layout-item")}>
                            <button
                                className={cx("remove-button")}
                                style={{
                                    marginTop: "10px",
                                    border: "none",
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                }}
                                onClick={() => removeItem(layoutItem.i)}
                            >
                                Remove
                            </button>
                            {renderItemContent(layoutItem)}
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>
        </div>
    );
};

export default AddLMI;
