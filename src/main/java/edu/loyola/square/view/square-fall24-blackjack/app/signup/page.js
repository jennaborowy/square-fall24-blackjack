import React from 'react'

import Link from "next/link";
import Image from "next/image";
import "./signup.css"

const Page=()=> {

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
                    <form action={""}>

                        <div className="input">
                            <input type="text" placeholder="First Name" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Last Name" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Username" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Email" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Password" required/>
                        </div>

                        <div className="input">
                            <input type="text" placeholder="Confirm Password" required/>
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
                </div>
            </div>
        </div>



    );
}
export default Page
