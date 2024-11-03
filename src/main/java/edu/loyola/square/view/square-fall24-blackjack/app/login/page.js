"use client";
import "../globals.css";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import React, { useState } from "react";
import Link from "next/Link";

import "./login.css";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginErr, setLoginErr] = useState(false);

    const errMsg = "User credentials invalid";
    const router = useRouter();

    console.log(auth?.currentUser?.uid)

    //handles submitting inputted login info from user
    const handleSubmit = async (e) => {
        e.preventDefault();

        async function login(userUsername, userPassword) {
            let url = `http://localhost:8080/api/user/login`;

            let headers = {
                'Content-Type': 'application/json',
            };

            let body = {
                "username": userUsername,
            };

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body),
                    cache: 'no-cache',
                });

                if (!res.ok) {
                    setLoginErr(true);
                    console.log(res);
                } else {
                    const { email } = await res.json();
                    await signInWithEmailAndPassword(auth, email, password);

                    console.log("user signed in!");
                    router.push('/lobby');
                }
            } catch (error) {
                setLoginErr(true);
                console.log("Sign in Error: ", error);
            }
        }
        await login(username, password);
    }

    //close error popup
    const handleClose = () => {
        setLoginErr(false);
    };

    //handle changing input form
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    return (
        <div className="container">
            <img src={"/logo-transparent.png"}
                 alt=""
                 height={215}
                 width={290}
                 style={{alignSelf: "center"}}
            />
            <div className="title">
                <h1>Login</h1>
            </div>
            {/*This is the form where user inputs info*/}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username"></label>
                    <input
                        className="form-control"
                        type="text"
                        id="username"
                        name="username"
                        title="username"
                        placeholder="Username"
                        value={username}
                        onInput={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password"></label>
                    <input
                        className="form-control"
                        type="password"
                        id="password"
                        name="password"
                        title="Enter password"
                        placeholder="Password"
                        value={password}
                        onInput={handleChange}
                    />
                </div>
                <button className="mt-3 btn btn-success border" type="submit" name="login">Submit</button>
            </form>
            {/*Redirect to signup page by clicking button*/}
            <footer className="footer">
                <Link
                    href="/signup"
                >
                    <span>
                    Sign up for Account
                    </span>
                </Link>
            </footer>
            {/*This is the popup for when there is a login error*/}
            <Dialog
                onClose={handleClose}
                open={loginErr}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Error"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {errMsg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light border" onClick={handleClose}>Exit</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Login;