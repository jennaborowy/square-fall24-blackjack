"use client";
import LogoutButton from "@/app/lobby/LogoutButton";
import TableManagement from "@/app/table/TableManagement";
import axios from "axios";

function Lobby() {
    return (
        <div className="m-3">
            <LogoutButton></LogoutButton>
            <h1 className="text-center mb-2"> Welcome to the Lobby!</h1>
            <div className="w-[600px]">
                <h2 className="mt-4">Table List</h2>
                <div className="mb-4">
                    <TableManagement/>
                </div>
            </div>
        </div>
    )
}

export default Lobby;