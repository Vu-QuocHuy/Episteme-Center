import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link
import classNames from "classnames/bind";
import styles from "./Events.module.scss";

function Events() {
    const cx = classNames.bind(styles);
    const url = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const [arr, setArr] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(url + "/api/public/sukien?page=0", {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                setArr(data.content); // Lấy mảng sự kiện từ data.content
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Hàm để tính trạng thái của sự kiện
    const getEventStatus = (startAt, endAt) => {
        const today = new Date(); // Ngày hôm nay
        const startDate = new Date(startAt); // Chuyển startAt thành đối tượng Date
        const endDate = new Date(endAt); // Chuyển endAt thành đối tượng Date


        // So sánh ngày hôm nay với ngày bắt đầu và kết thúc sự kiện
        if (today < startDate) {
            return 'chua-bat-dau'; // Trạng thái "Chưa bắt đầu"
        } else if (today >= startDate && today <= endDate) {
            return 'dang-dien-ra'; // Trạng thái "Đang diễn ra"
        } else {
            return 'da-ket-thuc'; // Trạng thái "Đã kết thúc"
        }
    };

    return (
        <div className={cx('container')}>
            <h1>Sự kiện mới nhất</h1>

            <div className={cx('event-list')}>
                {arr.map((event, index) => (
                    <div key={index} className={cx('event-item')} onClick={() => navigate(`/events/${event.eventId}`)}>
                        <div className={cx('event-tag')} >Sự kiện</div>
                        <div className={cx('event-details')}>
                            <div className={cx('event-name')}>{event.eventName}</div>
                            <div className={cx('event-date')}>
                                <span className={cx('start-date')}>{event.startAt.split('-').reverse().join('/')}</span> -
                                <span className={cx('end-date')}>{event.endAt.split('-').reverse().join('/')}</span>
                            </div>
                            <div className={cx('event-location')}>{event.location}</div>
                            <div className={cx('event-organized')}>{event.organizedBy}</div>

                        </div>
                        <div className={cx('event-status', getEventStatus(event.startAt, event.endAt))}>
                            {getEventStatus(event.startAt, event.endAt) === 'chua-bat-dau' && 'Chưa bắt đầu'}
                            {getEventStatus(event.startAt, event.endAt) === 'dang-dien-ra' && 'Đang diễn ra'}
                            {getEventStatus(event.startAt, event.endAt) === 'da-ket-thuc' && 'Đã kết thúc'}
                        </div>

                    </div>
                ))}
            </div>

            {/* Thêm Link dẫn đến trang xem toàn bộ bài viết */}
            <div className={cx('view-all')}>
                <Link to="/events" className={cx('view-all-link')}>
                    Xem tất cả sự kiện
                </Link>
            </div>
        </div>
    );

}

export default Events;