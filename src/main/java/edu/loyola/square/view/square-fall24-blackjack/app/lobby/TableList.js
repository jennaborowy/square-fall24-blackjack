//TableList
import React from 'react';
import JoinTableButton from "@/app/lobby/JoinTableButton";
import TableInfoButton from "@/app/lobby/TableInfoButton";
import "./TableList.css"

const TableList = ({ tables, onJoinTable, users }) => {

    return (
        <div className="TableList-container mt-4 p-10 h-96 border rounded-lg overflow-y-auto shadow-md">
            <div className="space-y-2 p-4">
                {tables.map((table, index) => (
                    <div
                        key={index}
                        className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{table.table_Name}</h3>
                                <p className="text-sm text-gray-600">
                                    Max Players: {table.max_players} | Current Players: {table.players.length} | Min Bet:
                                    ${table.minimum_bet}
                                </p>
                            </div>
                            <div className="mt-2">
                                <div className="button-container">
                                    <JoinTableButton
                                        tableId={table.id}
                                        onJoinTable={onJoinTable}
                                        table={table}
                                    />
                                    <TableInfoButton
                                        tableId={table.id}
                                        table={table}
                                        users={users}
                                        onJoinTable={onJoinTable}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {tables.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No tables available. Create a new one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableList;