import React from 'react';
import './TableInfo.css';

const TableInfoButton = ({ tableId }) => {
    return (
        <button
            className="table-info-button"
            style={{ backgroundColor: '#22c55e', color: 'white' }}
            onClick={() => console.log(`Showing info for table ${tableId}`)}
        >
            Table Info
        </button>
    );
};

export default TableInfoButton;