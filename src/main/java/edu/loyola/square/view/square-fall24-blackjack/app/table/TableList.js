import "./TableView.css"
import React from 'react';

const TableList = ({ tables }) => {
    return (
        <div className="TableList-container mt-4 p-10 h-96 border rounded-lg overflow-y-auto shadow-md">
            <div className="space-y-2 p-4">
                {tables.map((table, index) => (
                    <div
                        key={index}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">Table #{index + 1}</h3>
                                <p className="text-sm text-gray-600">
                                    Players: {table.playerAmount} | Min Bet: ${table.minBet}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {table.playerAmount === '1' ? '1 Player' : `${table.playerAmount} Players`}
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