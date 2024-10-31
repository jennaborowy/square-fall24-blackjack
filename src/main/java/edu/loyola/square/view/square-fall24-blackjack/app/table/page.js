import React, { useState } from 'react';
import TableList from "@/app/table/TableList";
import CreateTableButton from "@/app/lobby/CreateTableButton";

const TableManagement = () => {
    const [tables, setTables] = useState([]);

    const handleTableCreate = (newTable) => {
        setTables(prevTables => [...prevTables, newTable]);
    };

    return (
        <div className="space-y-8">
            <TableList tables={tables} />
            <CreateTableButton onTableCreate={handleTableCreate} />
        </div>
    );
};

export default TableManagement;