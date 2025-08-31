import {
    Button,
    Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Mentions,
    Select,
    TreeSelect,
    Segmented,
    Divider,
    Upload,
} from 'antd';
import classNames from "classnames/bind";
import styles from "./CreateEvent.module.scss"
import { UploadOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);
const api = process.env.REACT_APP_API_URL;

const { RangePicker } = DatePicker;
const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};
const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 6,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 14,
        },
    },
};

const token = localStorage.getItem("auth_token");

const onFinish = async (values) => {
    const formData = new FormData();

    // Thêm các trường dữ liệu từ form
    formData.append("eventName", values.Input); // Tên sự kiện
    formData.append("description", values.TextArea); // Mô tả
    formData.append("location", values.locate); // Địa điểm
    formData.append("startAt", values.RangePicker[0].format("YYYY-MM-DD")); // Ngày bắt đầu
    formData.append("endAt", values.RangePicker[1].format("YYYY-MM-DD"));
    formData.append("organizedBy", values.organize); // Ngày kết thúc
    // Xử lý file upload
    if (values.titlePic && values.titlePic.length > 0) {
        formData.append("file", values.titlePic[0].originFileObj);
    }


    // Gửi FormData qua Fetch API
    try {
        const response = await fetch(api + "/api/sukien", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Success:", result);
        } else {
            console.error("Failed:", response.statusText);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

function CreateEvent() {
    const [form] = Form.useForm();

    return (
        <div className={cx("container")}>

            <Form
                {...formItemLayout}
                form={form}
                style={{
                    maxWidth: 600,
                }}
                className={cx("form")}
                onFinish={onFinish}
            >
                <Divider orientation='center'>
                    <h2>Tạo sự kiện mới</h2>
                </Divider>
                <Form.Item
                    label="Tên sự kiện"
                    name="Input"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Địa điểm"
                    name="locate"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input
                    />
                </Form.Item>
                <Form.Item
                    label="Mô tả"
                    name="TextArea"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Đơn vị tổ chức"
                    name="organize"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input
                    />
                </Form.Item>
                <Form.Item
                    name="titlePic"
                    label="Ảnh tiêu đề"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Upload name="logo" listType="picture">
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="RangePicker"
                    name="RangePicker"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <RangePicker />
                </Form.Item>
                <Form.Item
                    wrapperCol={{
                        offset: 6,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default CreateEvent;