// import arr from "./fetchAPI";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import SpecialPost from "./components/SpecialPost";
import AutoSlide from "./components/AutoSlide";
import SpecialEvent from "./components/SpecialEvent";
// import ImageRender from "./components/ImageRender";


function Home() {

  const cx = classNames.bind(styles);

  return (
    <div>
      <div className={cx("wrapper")}>
        <AutoSlide></AutoSlide>
        <SpecialPost></SpecialPost>
        <div className={cx("fake-tuyen")}>
          <h1>ĐÀO TẠO - TUYỂN SINH</h1>
          <p className={cx("lol")}>Năm 2022, Tổ chức Giáo dục Quacquarelli Symonds (viết tắt QS – Vương quốc Anh) đã đánh giá và xếp chất lượng đào tạo và nghiên cứu của ĐHBK Hà Nội trong các lĩnh vực mà Trường đang đảm nhận thuộc nhóm hạng từ 401 đến 450 trên toàn Thế giới, tiếp tục giữ vị trí số 1 tại Việt Nam.</p>
          <div className={cx("tuyen-card")}>
            <div className={cx("card")}>
              <img src="https://vcdn1-vnexpress.vnecdn.net/2024/08/17/338445954-1612910142468651-775-8478-1160-1723889955.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=c5wDVLG6O8ueCkAnGIlNTw" alt=""></img>
              <div className={cx("content")}>
                <h4>CHƯƠNG TRÌNH ĐÀO TẠO</h4>
                <p>Trường hiện đang cung cấp hơn 20 chương trình đào tạo chất lượng cao thuộc 3 hệ đại học, ThS và TS; trong đó, có chương trình được thị trường lao động quốc tế đón nhận với hơn 60% sinh viên tốt nghiệp làm việc ở nước ngoài. Các chương trình đào tạo thuộc vào 3 nhóm ngành chính: Khoa học Máy tính, Kỹ thuật Máy tính, và Khoa học Dữ liệu và Trí tuệ Nhân tạo…(xem tiếp)</p>
              </div>
            </div>
            <div className={cx("card")}>
              <img src="https://actvn.edu.vn/Images/Uploadimages/2023/Tin%20tuc/TV2.jpg" alt=""></img>
              <div className={cx("content")}>
                <h4>CHƯƠNG TRÌNH ĐÀO TẠO</h4>
                <p>Trường hiện đang cung cấp hơn 20 chương trình đào tạo chất lượng cao thuộc 3 hệ đại học, ThS và TS; trong đó, có chương trình được thị trường lao động quốc tế đón nhận với hơn 60% sinh viên tốt nghiệp làm việc ở nước ngoài. Các chương trình đào tạo thuộc vào 3 nhóm ngành chính: Khoa học Máy tính, Kỹ thuật Máy tính, và Khoa học Dữ liệu và Trí tuệ Nhân tạo…(xem tiếp)</p>
              </div>
            </div>
          </div>

        </div>
        <SpecialEvent></SpecialEvent>
      </div>
    </div>
  );
}

export default Home;
