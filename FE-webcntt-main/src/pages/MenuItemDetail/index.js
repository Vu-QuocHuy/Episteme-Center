import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./MenuItemDetail.module.scss";
import { message, Card, List, Pagination, Button } from "antd";

const { Meta } = Card;

function MenuItemDetail() {
    const { slug } = useParams();
    const [articles, setArticles] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Số bài viết trên mỗi trang
    const cx = classNames.bind(styles);
    const [menuItem, setMenuItem] = useState(null);
    const api = process.env.REACT_APP_API_URL;

    const fetchMenuItem = async (slug) => {
        try {
            const response = await fetch(`${api}/api/public/menu_items`);
            const data = await response.json();

            const result = findNestedObjectBySlug(data, slug);
            setMenuItem(result);

            if (!response.ok)
                throw new Error("Không lấy được menuItem");
        } catch (error) {
            message.error(error);
        }
    };

    const fetchArticles = async (page = 1, size = 10) => {
        try {
            const response = await fetch(
                `${api}/api/public/${slug}/articles?page=${page - 1}&size=${size}`
            );
            const data = await response.json();

            setArticles(data.content);
            setTotalElements(data.totalElements);

            if (!response.ok)
                throw new Error("Không lấy được bài viết");

        } catch (error) {
            alert(error);
        }
    };

    useEffect(() => {
        fetchArticles(currentPage, pageSize);
        fetchMenuItem(slug);
    }, [slug, currentPage, pageSize]);

    // Hàm đệ quy để render menu dạng cây
    const renderTreeMenu = (items) => {
        return (
            <ul className={cx("tree-menu")}>
                {items.map((item) => {
                    if (item.deleted === false)
                        return (<li key={item.id}>
                            {/* Mục cha có Link */}
                            <Link to={`/${item.slug}`} className={cx("tree-menu-item")}>
                                {item.title}
                            </Link>
                            {/* Nếu có children, render đệ quy */}
                            {item.children && item.children.length > 0 && (
                                renderTreeMenu(item.children)
                            )}
                        </li>)
                })}
            </ul>
        );
    };

    const findNestedObjectBySlug = (items, targetSlug) => {
        for (const item of items) {
            // Nếu slug trùng khớp, trả về object hiện tại (bao gồm tất cả children)
            if (item.slug === targetSlug) {
                return item;
            }

            // Nếu item có children, tiếp tục tìm trong children
            if (item.children && item.children.length > 0) {
                const foundInChildren = findNestedObjectBySlug(item.children, targetSlug);
                if (foundInChildren) {
                    // Trả về object hiện tại với children đã được cập nhật
                    return {
                        ...item,
                        children: item.children.map(child =>
                            child.slug === foundInChildren.slug ? foundInChildren : child
                        ),
                    };
                }
            }
        }

        // Nếu không tìm thấy, trả về null
        return null;
    };

    // Xử lý khi click vào bài viết
    const handleArticleClick = (article) => {
        setSelectedArticle(article);
    };

    // Xử lý khi thay đổi trang
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    return (
        <div className={cx("main")} style={{
            display: "flex",
            maxWidth: "1200px",
        }}>
            {/* Phần anchor hiển thị menu dạng cây */}
            <div className={cx("anchor")} style={{
                width: "250px",
                marginRight: "20px",
                position: "sticky",
                top: "20px",
                alignSelf: "flex-start",
            }}>
                <h2>{menuItem?.title}</h2>
                {/* Render menu dạng cây */}
                {menuItem?.children && renderTreeMenu(menuItem.children)}
            </div>

            {/* Phần content nằm ở giữa */}
            <div style={{
                flex: 1,
                maxWidth: "700px",
                margin: "0 auto",
            }}>
                {totalElements === 1 ? (
                    // Nếu chỉ có 1 bài viết, hiển thị thẳng nội dung
                    <div dangerouslySetInnerHTML={{ __html: articles[0].content }}></div>
                ) : (
                    // Nếu có nhiều bài viết, hiển thị danh sách dưới dạng card
                    <div>
                        {selectedArticle ? (
                            // Nếu đã chọn bài viết, hiển thị nội dung chi tiết
                            <div>
                                <Button type="primary" onClick={() => setSelectedArticle(null)}>
                                    Quay lại
                                </Button>
                                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }}></div>
                            </div>
                        ) : (
                            // Hiển thị danh sách bài viết dưới dạng List của AntD
                            <div>
                                <List
                                    style={{ width: "1100px" }}
                                    grid={{
                                        gutter: 16, // Khoảng cách giữa các card
                                        column: 3,  // Số cột (số card mỗi hàng)
                                        xs: 1,      // Số cột trên màn hình nhỏ (mobile)
                                        sm: 2,      // Số cột trên màn hình nhỏ (tablet)
                                        md: 3,      // Số cột trên màn hình trung bình
                                        lg: 3,      // Số cột trên màn hình lớn
                                        xl: 3,      // Số cột trên màn hình rất lớn
                                        xxl: 3,     // Số cột trên màn hình siêu lớn
                                    }}
                                    dataSource={articles}
                                    renderItem={(article) => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                cover={
                                                    article.file_dto && article.file_dto.length > 0 ? (
                                                        <img
                                                            alt="Ảnh tiêu đề"
                                                            src={`${api}${article.file_dto[0].downloadUrl}`}
                                                            style={{ height: "200px", objectFit: "cover" }}
                                                        />
                                                    ) : null
                                                }
                                                onClick={() => handleArticleClick(article)}
                                            >
                                                <Meta
                                                    title={article.title}
                                                    description={`Ngày đăng: ${article.createAt.split('-').reverse().join('/')}`}
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                                {/* Phân trang */}
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={totalElements}
                                    onChange={handlePageChange}
                                    style={{ marginTop: "16px", textAlign: "center" }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MenuItemDetail;