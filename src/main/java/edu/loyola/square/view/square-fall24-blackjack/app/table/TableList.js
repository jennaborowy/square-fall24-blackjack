import "./TableList.css"
import React from 'react';
import JoinTableButton from "@/app/table/JoinTableButton";
import TableInfoButton from "@/app/table/TableInfoButton";

const TableList = ({ tables }) => {
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
                                <h3 className="font-medium">Table #{index + 1}</h3>
                                <p className="text-sm text-gray-600">
                                    Max Players: {table.playerAmount} | Current Players: {table.playerAmount} | Min Bet:
                                    ${table.minBet}
                                </p>
                            </div>
                            <div className="mt-2">
                                <div className="button-container">
                                    <JoinTableButton tableId={index + 1}/>
                                    <TableInfoButton tableId={index + 1}/>
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