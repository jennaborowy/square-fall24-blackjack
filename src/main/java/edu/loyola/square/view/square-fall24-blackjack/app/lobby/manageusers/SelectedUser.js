import "./SelectedUser.css";
import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

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


    const handleFirstNameChange = async (e) => {
        e.preventDefault();

        // precautionary
        setErr(false);
        setSuccess(false);

        if (first.trim().length !== 0) {
            const docRef = doc(db, 'users', userInfo.uid.toString());
            await updateDoc(docRef, {"firstName": first});
            setSuccessMsg("Successfully reset first name.");
            setSuccess(true);
            console.log("first name successfully reset");
        }

        else {
            setErrMsg("First name field must be populated to update");
            setErr(true);
        }
    }


    const handleLastNameChange = async (e) => {
        e.preventDefault();

        // precautionary
        setErr(false);
        setSuccess(false);

        if (last.trim().length !== 0) {
            const docRef = doc(db, 'users', userInfo.uid.toString());
            await updateDoc(docRef, {"lastName": last});
            setSuccessMsg("Successfully reset last name.");
            setSuccess(true);
            console.log("last name successfully reset");
        }

        else {
            setErrMsg("Last name field must be populated to update");
            setErr(true);
        }
    }


    const handleUsernameChange = async (e) => {
        e.preventDefault();
        // precautionary
        setErr(false);
        setSuccess(false);

        let body = {
            "uid": userInfo.uid,
            "username": username,
        };

        if (username.trim().length !== 0) {
            const response = await fetch("http://localhost:8080/api/user/reset-username", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                setErrMsg("Username is already taken");
                setErr(true);
                return;
            }

            else {
                setSuccessMsg("Successfully reset username.")
                setSuccess(true);
            }
            console.log("Username successfully reset");
        } else {
            setErrMsg("Username field must be populated to update");
            setErr(true);
        }
    }


    const handleEmailChange = async (e) => {
        e.preventDefault();

        // precautionary
        setErr(false);
        setSuccess(false);

        if (email.trim().length !== 0) {
            const q = query(collection(db, "users"),
                where('email', '==', email));

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                const docRef = doc(db, 'users', userInfo.uid.toString());
                await updateDoc(docRef, {"email": email});
                setSuccessMsg("Successfully reset email.");
                setSuccess(true);
                console.log("email successfully reset");
            }
            else {
                setErrMsg("Email is already in use");
                setErr(true);
            }
        }

        else {
            setErrMsg("Email field must be populated to update");
            setErr(true);
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
                            <div className="form-style flex-grow-1">
                                <form className="mx-3 my-4" onSubmit={(e) => handleFirstNameChange(e)}>
                                    <label htmlFor={userInfo.firstName}>{userInfo.firstName}</label>
                                    <div className="input-group w-100 d-flex align-items-center">
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter New First Name"
                                            name="first"
                                            onInput={handleChange}/>
                                        <button className="btn btn-danger reset-button" type="submit" title="change first name">
                                            Reset First Name
                                        </button>
                                    </div>
                                </form>

                                <form className="mx-3 my-4" onSubmit={(e) => handleLastNameChange(e)}>
                                    <label htmlFor={userInfo.lastName}>{userInfo.lastName}</label>
                                    <div className="input-group w-100 d-flex align-items-center">
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter New Last Name"
                                            name="last"
                                            onInput={handleChange}/>
                                        <button className="btn btn-danger reset-button" type="submit" title="change last name">
                                            Reset Last Name
                                        </button>
                                    </div>
                                </form>

                                <form className="mx-3 my-4" onSubmit={(e) => handleUsernameChange(e)}>
                                    <label htmlFor={userInfo.username}>{userInfo.username}</label>
                                    <div className="input-group w-100 d-flex align-items-center">
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter New Username"
                                            name="username"
                                            onInput={handleChange}
                                            required/>

                                        <button className="btn btn-danger reset-button" type="submit" title="change username">
                                            Reset Username
                                        </button>
                                    </div>
                                </form>

                                <form className="mx-3 my-4" onSubmit={(e) => handleEmailChange(e)}>
                                    <label htmlFor={userInfo.email}>{userInfo.email}</label>
                                    <div className="input-group w-100 d-flex align-items-center">
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter New Email"
                                            name="email"
                                            onInput={handleChange}
                                        />
                                        <button className="btn btn-danger reset-button" type="submit" title="change email">
                                            Reset Email
                                        </button>
                                    </div>
                                </form>


                                <form className="password-change d-flex align-items-center"
                                      onSubmit={(e) => handlePasswordReset(e)}>
                                    <div className="input-group m-3 w-100">
                                        <input
                                            className="form-control"
                                            type="password"
                                            placeholder="Enter New Password"
                                            name="password"
                                            onInput={handleChange}
                                        />
                                        <button className="btn btn-danger reset-button" type="submit">
                                            Reset Password
                                        </button>
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