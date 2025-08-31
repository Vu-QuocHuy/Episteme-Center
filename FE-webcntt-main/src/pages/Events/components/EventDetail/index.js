import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './EventDetail.module.scss'; // Import SCSS file
import classNames from 'classnames/bind';


const EventDetail = () => {
    const cx = classNames.bind(styles);
    const { slug } = useParams();
    const eventId = slug; // Lấy eventId từ URL (slug)
    const [eventDetail, setEventDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sinhVienThamGia, setParticipants] = useState([]);
    const url = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Hàm fetch data
        const fetchEventDetail = async () => {
            try {
                const response = await fetch(`${url}/api/public/sukien/${eventId}`);

                if (!response.ok) {
                    throw new Error('Không thể lấy thông tin sự kiện');
                }

                const data = await response.json();
                setEventDetail(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchParticipant = async () => {
            try {
                const response = await fetch(`${url}/api/sukien/participation_list/${eventId}`);

                if (!response.ok) {
                    throw new Error('Không thể lấy danh sách tham gia');
                }

                const data = await response.json();
                setParticipants(data.content);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchEventDetail();
    }, [eventId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    if (eventDetail) {
        const {
            eventName,
            description,
            startAt,
            endAt,
            location,
            createAt,
            organizedBy,
            fileDTOList
        } = eventDetail;

        const srcImg = fileDTOList[0].downloadUrl


        return (
            <div className={cx("event-detail")}>
                <img src={url + srcImg}></img>
                <h1>{eventName}</h1>
                <p><strong>Miêu tả:</strong> {description}</p>
                <p><strong>Thời gian:</strong> {startAt} đến {endAt}</p>
                <p><strong>Địa điểm:</strong> {location}</p>
                <p><strong>Ngày tạo:</strong> {createAt}</p>
                <p><strong>Đơn vị tổ chức:</strong> {organizedBy}</p>


            </div>
        );
    }

    return null;
};

export default EventDetail;
