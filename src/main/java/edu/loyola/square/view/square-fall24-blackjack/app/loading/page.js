import Image from "next/image";
import React from "react";

export default function Page() {
    return(
        <Image src={"/logo-gif-transparent.gif"}
               alt=""
               height={500}
               width={500}
        />
    );
}