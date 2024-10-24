"use client";

import axios from "axios";

import React, { useState, useEffect } from 'react';
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
    const [errMsg, setErrMsg] = useState([]);
    const [err, setErr] = useState(null);
    const [verifyPass, setVerifyPass] = useState(true)

    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            setSuccess(true);

        } catch (err) {
            setErr(err.message);
        }

    }

    // useEffect for handling side effects based on success
    // runs on success state change
    useEffect(() => {
        if (success) {
            console.log('Form submitted successfully!');
            router.push('/login');
            // Handle additional side effects here (e.g., redirect, show a message)
        }
    }, [success]);

    // useEffect for handling side effects based on error
    // runs on err state change
    useEffect(() => {
        if (err) {
            console.error('An error occurred:', err);
            // Handle error display or logging here
        }
    }, [err]);


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
            if (confirm !== password) {
                setErrMsg([... "Password fields do not match."]);
                setVerifyPass(false);
            } else {
                setVerifyPass(true);
            }
        }
    }

    const handleClose = () => {
        setErr(false);
    }

    return (
            <div className="container container-sm mt-3 mb-3 rounded shadow bg-light text-center w-50 signup">

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
                    <form onSubmit={(e) => handleSubmit(e)}>

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
                            <input type="password" placeholder="Password" name="password" onInput={handleChange} required/>
                        </div>

                        <div className="input">
                            <input type="password" placeholder="Confirm Password" name="confirm" onInput={handleChange} required/>
                        </div>

                        <button className="btn btn-success" >
                            Create Account
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
                        open={err}
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Error"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {errMsg.join("")} Please try again.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <button className="btn btn-light border" onClick={handleClose}>Exit</button>
                        </DialogActions>
                    </Dialog>
                </div>
                {err && <p>{err}</p>}
                {success && <p>Form submitted successfully!</p>}
            </div>

    );
}
export default Page
