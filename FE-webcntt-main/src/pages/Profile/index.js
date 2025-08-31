import React, { useState } from "react";
import { Form, Input, Button, Upload, Checkbox, Row, Col, Divider, Drawer, Space, Alert } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import classNames from "classnames/bind";
import styles from "./Profile.module.scss";
import { useAuth } from "~/Authentication/AuthContext";

const cx = classNames.bind(styles);

const Profile = () => {
    const url = process.env.REACT_APP_API_URL; // URL cơ sở
    const user = JSON.parse(localStorage.getItem("user"));
    const [formCp] = Form.useForm();
    const [open, setOpen] = useState(false);
    const token = localStorage.getItem("auth_token")
    console.log(user)
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const changePass = async () => {
        try {
            const formData = new FormData();
            const data = formCp.getFieldsValue();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            const res = await fetch(`${url}/user/${user.accountId}/change_password`, {
                method: "PUT",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (res.status === 400)
                throw new Error("Bạn đã nhập sai mật khẩu hiện tại")

            if (!res.ok) {
                throw new Error("Thay đổi mật khẩu thất bại")
            }
            alert("Thay đổi mật khẩu thành công")
            setOpen(false);
        }
        catch (err) {
            alert(err)
        }
    }



    return (
        <div className={cx("container")}>
            <Drawer
                title="Change Password"
                width={620}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={changePass} type="primary">
                            Submit
                        </Button>
                    </Space>
                }>
                <Form
                    form={formCp}
                    name="dependencies"
                    autoComplete="off"
                    style={{
                        maxWidth: 600,
                    }}
                    layout="vertical">
                    <Form.Item
                        name="oldPassword"
                        label="Current Password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}

                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input new password!',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The new password that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Drawer>
            <div className={cx("header")}>
                <div className={cx("wallpaper")}></div>
                <div className={cx("info")}>
                    <img src={url + user.avaFileCode} alt=""></img>
                    <div className={cx("username")}>
                        <h2>{user.fullName}</h2>
                        <p>{user.roles[0] === "ROLE_ADMIN" ? "Admin" : user.roles[0] === "ROLE_EMPLOYEE" ? "Nhân viên" : "Sinh viên"}</p>
                    </div>
                    <Button className={cx("changePass")} onClick={showDrawer}>Change password</Button>
                </div>
            </div>

            <div className={cx("content")}>
                <Divider orientation="left">Thông tin cá nhân</Divider>
            </div>


        </div>
    );
};

export default Profile;
