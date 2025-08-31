import { React, useState, useEffect } from "react";
import styles from './Card.module.scss'
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";


function Card({ post }) {
    const cx = classNames.bind(styles);
    const navigate = useNavigate();
    const urlAPI = process.env.REACT_APP_API_URL;

    const [imageUrl, setImageUrl] = useState('https://actvn.edu.vn/Images/actvn_big_icon.png');
    useEffect(() => {

        const checkImageFiles = async () => {
            for (let file of post.file_dto) {
                try {
                    const response = await fetch(urlAPI + file.downloadUrl, { method: 'GET' });
                    const contentType = response.headers.get('content-type');

                    if (contentType && contentType.startsWith('image/')) {
                        setImageUrl(urlAPI + file.downloadUrl);
                        break; // Dừng vòng lặp khi tìm thấy ảnh đầu tiên
                    }
                } catch (error) {
                    console.error('Error fetching file:', error);
                }
            }
        };

        checkImageFiles();
    }, [post.file_dto]);
    return (
        <div key={post.post_id} className={cx("post-card")} onClick={() => navigate(`/posts/${post.post_id}`)}>
            <div className={cx('content-card')}>
                {imageUrl ? (<img alt="" src={imageUrl}></img>) : <p>Loading...</p>}
                {/* <img src="" alt=""></img> */}

                {/* <a className={cx("post-image")} href={post.url.replace("localhost", "172.20.10.3")}>{post.url.slice(32)}</a> */}
                <div className={cx("post-info")}>
                    <div className={cx("date")}>
                        <span className={cx("day")}>{post.create_at.slice(-2)}</span>
                        <span className={cx("month")}>TH {post.create_at.substring(5, 7)}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>
                        <i className={cx("fa-solid fa-user")}></i>
                        {post.author}</p>
                    <p className={cx('post-content')} dangerouslySetInnerHTML={{ __html: post.content }}></p>
                </div>
            </div>
        </div>)

}

export default Card;