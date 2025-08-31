import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import classNames from "classnames/bind";
import styles from './AutoSlide.module.scss';
import { useNavigate } from "react-router";

function AutoSlide() {
    const [articles, setArticles] = useState([]);
    const url = process.env.REACT_APP_API_URL;
    const cx = classNames.bind(styles);
    const navigate = useNavigate();

    // Fetch API
    useEffect(() => {
        fetch(url + "/api/public/posts/latest") // Thay API đúng vào đây
            .then((response) => response.json())
            .then((data) => {
                setArticles(data.slice(0, 4));
            })
            .catch((error) => console.error("Error fetching articles:", error));
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3500,
        arrows: true,

    };

    return (
        <div className={cx('container')}>
            <div className={cx("border")}></div>
            <Slider className={cx('slides')} {...settings}>
                {articles.map((item, index) => (
                    <div key={index} className={cx('slide-item')}>
                        <div className={cx('poster')}>
                            <img src={url + item.file_dto[0]?.downloadUrl} alt="" />
                            <div className={cx('bubbles')}>
                                {[...Array(10)].map((_, i) => (
                                    <span key={i} className={cx('bubble')}></span>
                                ))}
                            </div>
                            <div className={cx('overlay')}>
                                <div className={cx('info')}>
                                    <h3>{item.title}</h3>
                                    <button
                                        className={cx('detail-button')}
                                        onClick={() => navigate(`/posts/${item.post_id}`)}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                ))}
            </Slider>
            <div className={cx("border")}></div>
        </div>
    );
}

export default AutoSlide;
