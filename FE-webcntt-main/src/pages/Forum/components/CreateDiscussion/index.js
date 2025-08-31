import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Tag, message } from "antd";

const { Option } = Select;

const CreateDiscussion = () => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]); // Lưu danh sách tags từ API
    const [selectedTags, setSelectedTags] = useState([]); // Lưu các tag đã chọn
    const token = localStorage.getItem("auth_token")
    // Gọi API để lấy danh sách tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch("http://localhost:8084/api/tags", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Thay YOUR_ACCESS_TOKEN bằng token thực tế nếu cần
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setTags(data.content); // Lấy danh sách tags từ API
                } else {
                    message.error("Không thể tải danh sách tags.");
                }
            } catch (error) {
                console.error("Error fetching tags:", error);
                message.error("Có lỗi xảy ra khi tải danh sách tags.");
            }
        };

        fetchTags();
    }, []);

    // Xử lý khi người dùng chọn một tag
    const handleTagSelect = (value) => {
        const selectedTag = tags.find((tag) => tag.tagId === value);
        if (!selectedTags.some((tag) => tag.tagId === value)) {
            setSelectedTags([...selectedTags, selectedTag]); // Thêm tag vào danh sách đã chọn
        }
    };

    // Xử lý khi người dùng xóa một tag
    const handleTagClose = (tagId) => {
        setSelectedTags(selectedTags.filter((tag) => tag.tagId !== tagId)); // Xóa tag khỏi danh sách đã chọn
    };

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("content", values.content);
            formData.append("createAt", new Date().toISOString().split("T")[0]); // Lấy ngày hiện tại
            formData.append(
                "tags",
                selectedTags.map((tag) => tag.tagId).join(",") // Truyền danh sách tagId đã chọn
            );

            const response = await fetch("http://localhost:8084/api/discussions", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                message.success("Tạo bài thảo luận thành công!");
                form.resetFields();
                setSelectedTags([]); // Reset danh sách tags đã chọn
            } else {
                const errorData = await response.json();
                message.error(`Lỗi: ${errorData.message || "Không thể tạo bài thảo luận"}`);
            }
        } catch (error) {
            console.error("Error creating discussion:", error);
            message.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: "600px", margin: "0 auto", marginTop: "50px" }}
        >
            <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
                <Input placeholder="Nhập tiêu đề thảo luận" />
            </Form.Item>

            <Form.Item
                label="Nội dung"
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            >
                <Input.TextArea rows={4} placeholder="Nhập nội dung thảo luận" />
            </Form.Item>

            <Form.Item label="Thẻ (Tags)">
                <Select
                    placeholder="Chọn thẻ"
                    onSelect={handleTagSelect}
                    style={{ width: "100%" }}
                >
                    {tags.map((tag) => (
                        <Option key={tag.tagId} value={tag.tagId}>
                            {tag.tagName}
                        </Option>
                    ))}
                </Select>
                <div style={{ marginTop: "10px" }}>
                    {selectedTags.map((tag) => (
                        <Tag
                            key={tag.tagId}
                            closable
                            onClose={() => handleTagClose(tag.tagId)}
                        >
                            {tag.tagName}
                        </Tag>
                    ))}
                </div>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Tạo bài thảo luận
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateDiscussion;
