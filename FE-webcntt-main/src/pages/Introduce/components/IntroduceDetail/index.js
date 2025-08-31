import { useEffect, useState } from "react";
import { useParams } from "react-router";


function EmployeeDetail() {

    const { slug } = useParams();
    const [content, setContent] = useState(null);
    const api = process.env.REACT_APP_API_URL;

    const fetchEm = async () => {
        try {
            const response = await fetch(`${api}/api/public/nhanvien/${slug}/cv`)
            const data = await response.json();

            setContent(data.content);
            if (!response.ok)
                throw new Error("Không lấy được CV nhân viên")

        } catch (error) {
            alert(error)
        }
    }

    useEffect(() => {
        fetchEm();
    })
    return (<div style={{
        margin: "20px auto",
        width: "50%"
    }}>
        <div style={{}}>
            <div style={{
                position: "relative", // Để giữ layout chính xác
                width: "100%",
            }} dangerouslySetInnerHTML={{ __html: content }}></div>
        </div>
    </div>);
}

export default EmployeeDetail;