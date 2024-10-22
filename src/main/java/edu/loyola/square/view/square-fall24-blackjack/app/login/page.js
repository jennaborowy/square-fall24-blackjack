"use client";
import "../globals.css";
import { useRouter } from 'next/navigation';
import axios from "axios";

import React, { useState } from "react";
import Link from "next/Link";

import styles from "@/app/page.module.css";
import Image from "next/image";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        async function login(userUsername, userPassword) {
            let url = `http://localhost:8080/api/user/login`;

            let headers = {
                'Content-Type': 'application/json',
            };

            let body = {
                "username": userUsername,
                "password": userPassword,
            };

            let response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            })
                .then(() => {
                    if (response.ok) {
                        console.log(response.status)

                        router.push('/table')
                    }
                });
        }

        await login(username, password);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    return (
        <div className="container-sm m-5 p-5 rounded shadow-lg bg-light-subtle">
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