"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

import "./signup.css"
import "../globals.css"
import "../loading/loading"
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

import { auth, onAuthStateChanged } from "@/firebaseConfig";

const Page=()=> {

    const router = useRouter();

    // might put user data in one useState()?
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

    // closes error dialog
    const handleClose = () => {
        setErr(false);
    }

    return (
        <div className="container">
            <img src={"/logo-transparent.png"}
                 alt=""
                 height={215}
                 width={290}
                 style={{alignSelf:"center"}}
                 className="mt-5 pt-3"
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
                                <Link href="/gameplay"> Guest</Link>
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
                            {/*{Object.entries(errMsg).map(([index, message]) => (*/}
                            {/*    <li key={index}>{message}</li>*/}
                            {/*))}*/}
                            {errMsg}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <button className="btn btn-light border" onClick={handleClose}>Exit</button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}
export default Page;
