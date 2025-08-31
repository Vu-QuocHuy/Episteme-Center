import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm, Tag } from "antd";

const PendingDiscussions = () => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("auth_token");

    // Gọi API để lấy danh sách bài thảo luận
    useEffect(() => {
        fetchPendingDiscussions();
    }, []);

    const fetchPendingDiscussions = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8084/api/discussions/pending", {
                headers: {
                    Authorization: `Bearer ${token}`, // Thay YOUR_ACCESS_TOKEN bằng token thực tế
                },
            });
            const data = await response.json();
            if (response.ok) {
                setDiscussions(data.content); // Gán danh sách bài thảo luận
            } else {
                message.error("Không thể tải danh sách bài thảo luận.");
            }
        } catch (error) {
            console.error("Error fetching discussions:", error);
            message.error("Có lỗi xảy ra khi tải danh sách bài thảo luận.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API duyệt bài thảo luận
    const handleApprove = async (discussionId) => {
        try {
            const formData = new FormData();
            formData.append("discussionStatus", "APPROVED");
            formData.append("discussionId", discussionId);

            const response = await fetch("http://localhost:8084/api/discussions/status", {
                method: "PATCH",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`, // Thay YOUR_ACCESS_TOKEN bằng token thực tếs
                }
            });

            if (response.ok) {
                message.success("Bài thảo luận đã được duyệt.");
                setDiscussions(discussions.filter((discussion) => discussion.discussionId !== discussionId));
            } else {
                const errorData = await response.json();
                message.error(`Lỗi: ${errorData.message || "Không thể duyệt bài thảo luận."}`);
            }
        } catch (error) {
            console.error("Error approving discussion:", error);
            message.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    // Hàm gọi API xóa bài thảo luận
    const handleReject = async (discussionId) => {
        try {
            const formData = new FormData();
            formData.append("discussionStatus", "REJECTED");
            formData.append("discussionId", discussionId);

            const response = await fetch("http://localhost:8084/api/discussions/status", {
                method: "PATCH",
                body: formData,
            });

            if (response.ok) {
                message.success("Bài thảo luận đã bị từ chối.");
                setDiscussions(discussions.filter((discussion) => discussion.discussionId !== discussionId));
            } else {
                const errorData = await response.json();
                message.error(`Lỗi: ${errorData.message || "Không thể từ chối bài thảo luận."}`);
            }
        } catch (error) {
            console.error("Error rejecting discussion:", error);
            message.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    const columns = [
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Người đăng",
            dataIndex: ["author_DTO", "name"],
            key: "author",
            render: (name) => <Tag color="blue">{name}</Tag>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createAt",
            key: "createAt",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div>
                    <Button
                        type="primary"
                        onClick={() => handleApprove(record.discussionId)}
                        style={{ marginRight: "10px" }}
                    >
                        Duyệt
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn từ chối bài thảo luận này không?"
                        onConfirm={() => handleReject(record.discussionId)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button style={{ color: "red" }} type="danger">Từ chối</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={discussions}
            rowKey="discussionId"
            loading={loading}
            pagination={{ pageSize: 5 }}
        />
    );
};

export default PendingDiscussions;
