import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Introduce.module.scss";
import { Pagination } from "antd";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function Introduce() {

    const [employees, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const api = process.env.REACT_APP_API_URL;

    const fetchEmployee = async (currentPage) => {
        try {
            const response = await fetch(`${api}/api/public/nhanvien?page=${currentPage}`)
            const data = await response.json()

            if (!response.ok)
                throw new Error("Không lấy được danh sách nhân viên")

            setEmployees(data.content);
            setTotalPage(data.totalPages);
        } catch (error) {
            alert(error)
        }
    }

    useEffect(() => {
        fetchEmployee(0)
    }, [])

    const handlePaginationChange = (page) => {
        setCurrentPage(page - 1);
    };

    return (
        <div className={cx("container")}>
            <div className={cx("employee-list")}>
                {employees.map((employee) => (
                    <div key={employee.idUser} className={cx("card")}>
                        {/* Sử dụng avaFileCode để lấy URL ảnh */}
                        <img
                            src={`${api}/downloadProfile/${employee.avaFileCode}`}
                            alt={employee.tenNhanVien}
                            className={cx("image")}
                        />
                        <p className={cx("name")}>{employee.tenNhanVien}</p>
                        <Link to={`/introducedetail/${employee.idUser}`}>Xem chi tiết</Link>
                    </div>
                ))}
            </div>
            <Pagination
                current={currentPage + 1}
                total={totalPage}
                onChange={handlePaginationChange}
            ></Pagination>
        </div>);
}

export default Introduce;