"use client"

import React, { useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/navigation';

import "./signup.css"
import "../globals.css"
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

const Page=()=> {

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passMatch, setPassMatch] = useState(true);

    // make dialog component? make dialog error list based on backend requirements, pass as prop
    //  (password length, email validation, etc.)


    const [loginErr, setLoginErr] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        async function createAccount(userUsername, userPassword, userEmail, userFirst, userLast) {
            let url = `http://localhost:8080/api/user/signup`;

            let headers = {
                'Content-Type': 'application/json',
            };

            let body = {
                "username": userUsername,
                "password": userPassword,
                "email": userEmail,
                "first_name": userFirst,
                "last_name": userLast,
            };

            await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            })
                .then((res) => {
                    if (res.ok) {
                        console.log(res.status)
                        router.push('/login') // was ../login
                    } else {
                        setLoginErr(true);
                        console.log(res.json);
                    }
                });
        }
        await createAccount(username, password, email, first, last);
    }

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
            if (value !== password) {
                setPassMatch(false);
            }
        }
    }

    const handleClose = () => {
        setLoginErr(false);
    }

    return (
        <div className="container">
            <div className="form-container">
                <img src={"/logo-transparent.png"}
                     alt=""
                     height={215}
                     width={290}
                     style={{alignSelf:"center"}}
                />

                <div className="title">
                    <h1>Signup</h1>
                </div>

                <div className="form">
                    <form onSubmit={handleSubmit}>

                        <div className="input">
                            <input type="text" placeholder="First Name" name="first" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Last Name" name="last" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Username" name="username" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Email" name="email" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Password" name="password" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Confirm Password" name="confirm" onInput={handleChange} required/>
                        </div>

                        <button className="create-acct-btn" >
                            <Link href="/login"> Create Account</Link>
                        </button>

                        <div className="login">
                            <p>Already a user?
                                <span>
                                    <Link href="/login"> Login</Link>
                                </span>
                            </p>

                            <p>- or -</p>

                        </div>
                        <div className={"guest"}>
                            <p>Continue as
                                <span>
                                    <Link href="/table"> Guest</Link>
                                </span>
                            </p>
                        </div>
                    </form>
                    <Dialog
                        onClose={handleClose}
                        open={loginErr}
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Error"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Password fields do not match. Please try again.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <button className="btn btn-light border" onClick={handleClose}>Exit</button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>

    );
}
export default Page
