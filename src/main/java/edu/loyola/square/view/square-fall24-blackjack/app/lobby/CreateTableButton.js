import React, { useState } from 'react';
import { Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions } from "@mui/material";

const CreateTableButton = ({ onTableCreate }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        playerAmount: '',
        minBet: ''
    });
    const [errors, setErrors] = useState({});

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({ playerAmount: '', minBet: '' });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.playerAmount) {
            newErrors.playerAmount = 'Player amount is required';
        } else if (isNaN(formData.playerAmount) || formData.playerAmount < 1 || formData.playerAmount > 6) {
            newErrors.playerAmount = 'Player amount must be between 1 and 6';
        }

        if (!formData.minBet) {
            newErrors.minBet = 'Minimum bet is required';
        } else {
            const minBetValue = parseInt(formData.minBet);
            if (isNaN(minBetValue) || minBetValue <= 0) {
                newErrors.minBet = 'Minimum bet must be a positive integer';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const submissionData = {
                ...formData,
                minBet: parseInt(formData.minBet)
            };
            onTableCreate(submissionData);
            handleClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'minBet') {
            const newValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div>
            <button className="btn btn-success border" onClick={handleClickOpen}>
                Create Table
            </button>

            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {"Create New Table"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText className="mb-8">
                            Please fill in the details below to create a new table.
                        </DialogContentText>
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium">
                                    Player Amount (max 6)
                                </label>
                                <input
                                    type="number"
                                    name="playerAmount"
                                    value={formData.playerAmount}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                    max="6"
                                />
                                {errors.playerAmount && (
                                    <p className="text-red-500 text-sm mt-2">{errors.playerAmount}</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium">
                                    Minimum Bet
                                </label>
                                <input
                                    type="text"
                                    name="minBet"
                                    value={formData.minBet}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter minimum bet"
                                />
                                {errors.minBet && (
                                    <p className="text-red-500 text-sm mt-2">{errors.minBet}</p>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <button type="button" className="btn border" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-success border">
                            Create
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default CreateTableButton;
