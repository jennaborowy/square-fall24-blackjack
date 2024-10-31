import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import './TableInfo.css';

const TableInfoButton = ({ tableId, table, disabled = false }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleJoin = () => {
        console.log(`Joining table ${tableId}`);
        setOpen(false);
    };

    return (
        <>
            <button
                className="table-info-button"
                onClick={handleClickOpen}
                disabled={disabled}
                style={{
                    backgroundColor: '#468cff',
                    color: 'white'
                }}
            >
                Table Info
            </button>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="table-info-dialog-title"
                PaperProps={{
                    style: {
                        borderRadius: '8px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle
                    id="table-info-dialog-title"
                    style={{
                        padding: '16px 24px',
                        fontSize: '1.25rem',
                        fontWeight: 500
                    }}
                >
                    Table #{tableId} Details
                </DialogTitle>
                <DialogContent style={{ padding: '16px 24px' }}>
                    <DialogContentText>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                fontWeight: 600,
                                color: 'white',
                                marginBottom: '8px'
                            }}>
                                Player Information:
                            </div>
                            Current Players: {table?.playerAmount || 0}
                        </div>
                        <div>
                            <div style={{
                                fontWeight: 600,
                                color: 'white',
                                marginBottom: '8px'
                            }}>
                                Betting Information:
                            </div>
                            Minimum Bet: ${table?.minBet || 'N/A'}
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        onClick={handleClose}
                        style={{
                            textTransform: 'none',
                            fontWeight: 500,
                            color: '#6b7280'
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleJoin}
                        style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                    >
                        Join Table
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TableInfoButton;