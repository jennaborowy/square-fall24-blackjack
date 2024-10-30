import React from 'react';
import './JoinTable.css';

const JoinTableButton = ({ tableId }) => {
    return (
        <button
            className="join-table-button"
            style={{ backgroundColor: '#22c55e', color: 'white' }}  // Adding inline styles as backup
            onClick={() => console.log(`Joining table ${tableId}`)}
        >
            Join Table
        </button>
    );
};

export default JoinTableButton;