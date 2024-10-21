"use client";
import "../globals.css";
import axios from "axios";

import React, { useState, useRef } from "react";
import Link from "next/Link";

import { Form, ButtonToolbar, Button, Input } from 'rsuite';
import styles from "@/app/page.module.css";
import Image from "next/image";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // indicates whether post request was successful or not
    const [success, setSuccess] = useState('');
    const [errors, setErrors] = useState([]);

    //
    const userRef = useRef(null);
    const passRef = useRef(null);

    // prevents form from submitting
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3306/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Content-Type-Options": "no-sniff"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })

                }
            );
            if (response.ok) {
                const responseData = await response.json();
                console.log("User logged in:", responseData);
            } else {
                console.error("Login failed:", response.statusText);
            }
        } catch (error) {
            console.error("Error during fetch:", error);
        }
    }

    // // do a post request to backend
    // try {
    //     // send POST request using axios
    //
    //     // setSuccess("Data received")
    // } catch (err) {
    //     handleErrors(err);
    // }

    // const handleErrors = (err) => {
    //
    // }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
        setSuccess("");
        setErrors([]);
    };

    return (
        <div className="container-sm m-5 p-5 rounded shadow-lg">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <div className="form-group">
                        <label htmlFor="username">username</label>
                        <input
                            className="form-control"
                            type="text"
                            id="username"
                            name="username"
                            title="Enter username"
                            value={username}
                            onInput={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">password</label>
                        <input
                            className="form-control"
                            type="text"
                            id="password"
                            name="password"
                            title="Enter password"
                            value={password}
                            onInput={handleChange}
                        />
                    </div>
                    <button className="mt-3 btn btn-light" type="submit">submit</button>
                </form>
            </div>
            <footer className={styles.footer}>
                <Link
                    href="/signup"
                >
                    <Image
                        aria-hidden
                        src="https://nextjs.org/icons/file.svg"
                        alt="File icon"
                        width={16}
                        height={16}
                    />
                    Sign up for Account
                </Link>
            </footer>
        </div>
    );
}

export default Login;