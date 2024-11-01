"use client"
import React, { useState } from 'react';
import { auth } from "@/firebaseConfig";
import TableList from "@/app/lobby/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";

function Lobby() {
    const [tables, setTables] = useState([]);

    const handleTableCreate = (newTable) => {
        setTables(prevTables => [...prevTables, newTable]);
    };

    console.log(auth?.currentUser?.uid);

    return (
        <div className="m-3">
            <h1>Welcome to the Lobby!</h1>
            <TableList tables={tables}/>
            <CreateTableButton onTableCreate={handleTableCreate}/>
        </div>
    )
}

export default Lobby;