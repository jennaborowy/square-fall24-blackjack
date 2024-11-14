import "../managefriends/UserList.css";
import Link from "next/link";
import React, {useEffect, useState} from "react";

function SelectedUser({ userInfo }) {

    console.log(userInfo);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [err, setErr] = useState(null);
    const [success, setSuccess] = useState(false);

    // action performed upon submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setErrMsg("Password fields do not match.")
            setErr(true);
            return;
        }

        let body = {
            "username": username,
            "password": password,
            "email": email,
            "firstName": first,
            "lastName": last,
        };

        setErr(null);

        try {
            const response = await fetch('http://localhost:8080/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setSuccess(true);
            }

            else {
                const errorData = await response.json();
                console.log(errorData)
                setErrMsg(errorData.message);
                setErr(true);
            }

        } catch (error) {
            console.log('Error submitting form:', error);
            setErrMsg(error.message);
            setErr(true);
        }
    }

    // useEffect for handling side effects based on success
    // runs on success state change
    useEffect(() => {
        if (success) {
            console.log('Form submitted successfully!');
            router.push('/login');
        }
    }, [success]);

    // useEffect for handling side effects based on error
    // runs on err state change
    useEffect(() => {
        if (err) {
            console.log('An error occurred:', errMsg);
        }
    }, [err]);

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
        } else if (name === "confirm") {
            setConfirm(value);

        }
    }

    return (
        <div>
            <h1 className="UserList-header p-2 pt-3 rounded-top mt-3 mb-0">{userInfo.username}'s Account</h1>
            <div className="UserList-container p-10 h-96 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4">

                    {userInfo && (

                    <div className="form">
                        <form onSubmit={(e) => handleSubmit(e)}>

                            <label htmlFor={userInfo.firstName}>{userInfo.firstName}</label>
                            <div className="input">
                                <input type="text" placeholder="First Name" name="first" onInput={handleChange}/>
                            </div>

                            <label htmlFor={userInfo.lastName}>{userInfo.lastName}</label>
                            <div className="input">
                                <input type="text" placeholder="Last Name" name="last" onInput={handleChange}/>
                            </div>

                            <label htmlFor={userInfo.username}>{userInfo.username}</label>
                            <div className="input">
                                <input type="text" placeholder="Username" name="username" onInput={handleChange}
                                       required/>
                            </div>

                            <label htmlFor={userInfo.email}>{userInfo.email}</label>
                            <div className="input">
                                <input type="text" placeholder="Email" name="email" onInput={handleChange}/>
                            </div>

                            <div className="input">
                                <input type="password" placeholder="Password" name="password" onInput={handleChange}/>
                            </div>

                            <button className="btn btn-success" type="submit" title="submit">
                                Edit Account
                            </button>
                        </form>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
    export default SelectedUser;