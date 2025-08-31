import React from "react";
import classNames from "classnames/bind";
import styles from "./Footer.module.scss";

const cx = classNames.bind(styles);

function Footer() {
    return (
        <footer className={cx("footer")}>
            <div className={cx("container")}>
                <div className={cx("footer-section")}>
                    <h3>CÁC ĐƠN VỊ</h3>
                    <ul>
                        <li>Khoa Khoa học Máy tính</li>
                        <li>Khoa Kỹ thuật Máy tính</li>
                        <li>Văn phòng Trường</li>
                        <li>Trung tâm Máy tính và Thực hành</li>
                        <li>Trung tâm Đổi mới Sáng tạo</li>
                    </ul>
                </div>
                <div className={cx("footer-section")}>
                    <h3>CHƯƠNG TRÌNH ĐÀO TẠO</h3>
                    <ul>
                        <li>Hệ đại học</li>
                        <li>Hệ thạc sĩ</li>
                        <li>Hệ tiến sĩ</li>
                    </ul>
                </div>
                <div className={cx("footer-section")}>
                    <h3>HỆ THỐNG VÀ TÀI NGUYÊN</h3>
                    <ul>
                        <li>Hệ thống Quản lý Đào tạo</li>
                        <li>Hệ thống Quản lý Hợp tác Doanh nghiệp</li>
                        <li>Các mẫu biểu dành cho sinh viên</li>
                    </ul>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.2948096523733!2d105.79365357569304!3d20.980816389422746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acc508f938fd%3A0x883e474806a2d1f2!2zSOG7jWMgdmnhu4duIEvhu7kgdGh14bqtdCBt4bqtdCBtw6M!5e0!3m2!1svi!2s!4v1735212528139!5m2!1svi!2s" width="350" height="250" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div className={cx("footer-section", "contact")}>
                    <h3>ACTVN - Khoa Công nghệ thông tin</h3>
                    <p>
                        <span>📞</span> (+84) 24 3869 2463
                    </p>
                    <p>
                        <span>📧</span> acbd@actvn.edu.vn
                    </p>
                    <p>
                        141 - Chiến Thắng - Thanh Trì - Hà Nội <br />
                    </p>
                    <div className={cx("social-icons")}>
                        <a href="#">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="#">
                            <i className="fab fa-youtube"></i>
                        </a>
                        <a href="#">
                            <i className="fas fa-map-marker-alt"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
