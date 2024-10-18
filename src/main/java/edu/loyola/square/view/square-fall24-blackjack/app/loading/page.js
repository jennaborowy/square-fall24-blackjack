import Image from "next/image";
import React from "react";
import "./loading.css"

export default function Page() {
    return(
        <div className="main">
            <div className="gif">
                <img src={"/logo-gif-transparent.gif"}
                    alt=""

                />
            </div>
        </div>
    );
}