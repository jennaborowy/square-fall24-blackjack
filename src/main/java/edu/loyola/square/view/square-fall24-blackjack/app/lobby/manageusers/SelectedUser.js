import "./SelectedUser.css";
import React, { useEffect, useState } from "react";

function SelectedUser({ userInfo, setErr, setErrMsg, setSuccess, setSuccessMsg }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

    // action performed upon submission
    const handlePasswordReset = async (e) => {
        e.preventDefault();

        // precautionary
        setErr(false);
        setSuccess(false);

        let body = {
            "uid": userInfo.uid,
            "password": password,
        };

        const response = await fetch("http://localhost:8080/api/user/reset-password", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // new password isn't valid, so doesn't reset
        if (!response.ok) {
            setErrMsg("Check that the new password is at least 8 characters long.");
            setErr(true);
        }

        else {
            setSuccessMsg("Successfully reset password.")
            setSuccess(true);
        }

    }

    // handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "first") {
            setFirst(value);
        } else if (name === "last") {
            setLast(value);
        } else if (name === "email") {
            setEmail(value);
        }
    }

    return (
        <div>
            <h1 className="SelectedUser-header p-2 pt-3 rounded-top mt-3 mb-0">{userInfo ? `${userInfo.username}'s Info` : "Selected User Info"}</h1>
            <div className="SelectedUser-container p-10 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4 d-flex flex-column">
                    {userInfo && (
                    <div>
                        <div className="form-style flex-grow-1 pb-3">
                            <form className="flex-shrink-0" onSubmit={(e) => handleSubmit(e)}>

                                <div className="m-3">
                                    <label htmlFor={userInfo.firstName}>{userInfo.firstName}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter New First Name"
                                        name="first"
                                        onInput={handleChange}
                                    />

                                </div>

                                <div className="m-3">
                                    <label htmlFor={userInfo.lastName}>{userInfo.lastName}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter New Last Name"
                                        name="last"
                                        onInput={handleChange}
                                    />
                                </div>

                                <div className="m-3">
                                    <label htmlFor={userInfo.username}>{userInfo.username}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter New Username"
                                        name="username"
                                        onInput={handleChange}
                                    />
                                </div>

                                <div className="m-3">
                                    <label htmlFor={userInfo.email}>{userInfo.email}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter New Email"
                                        name="email"
                                        onInput={handleChange}
                                    />
                                </div>

                                <button className="btn btn-success m-3" type="submit" title="submit">
                                    Edit Account
                                </button>

                            </form>
                        </div>
                        <div>
                            <form className="password-change d-flex align-items-center" onSubmit={(e) => handlePasswordReset(e)}>
                                <div className="input-group m-3 w-100">
                                    <input
                                        className="form-control"
                                        type="password"
                                        placeholder="Enter New Password"
                                        name="password"
                                        onInput={handleChange}
                                    />
                                    <button className="btn btn-danger" type="submit">Reset Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
    export default SelectedUser;