//This layout is edited from Material UI's docs: https://mui.com/material-ui/react-app-bar/
"use client"

import * as React from 'react';
import { useState, useEffect } from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider } from "@mui/material";
import { useRouter } from "next/navigation";
import { auth, signOut } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../context/auth";

function LobbyLayout({children}) {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAccountUser, setIsAccountUser] = useState(false);
    const [userDisp, setUserDisp] = useState(null);

    const currentUser = useAuth().currentUser;

    // Function to set claims in state
    const setClaims = (admin, accountUser, userDisp) => {
        setIsAdmin(admin);
        setIsAccountUser(accountUser);
        setUserDisp(userDisp);
    };

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Fetch ID token and check custom claims
                user.getIdTokenResult()
                    .then((idTokenResult) => {
                        const admin = !!idTokenResult.claims.admin;
                        const accountUser = !!idTokenResult.claims.accountUser;
                        setClaims(admin, accountUser, user.displayName);
                    })
                    .catch((error) => {
                        console.error("Error fetching claims:", error);
                    });
            } else {
                // Clear claims on sign out
                setClaims(false, false, null);
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            if (!isAdmin && !isAccountUser) {
                // delete the auth AND account
                const uid = currentUser.uid;
                try {
                    const response = await fetch('http://localhost:8080/api/user/delete', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({"uid": uid}),
                    });

                    if (response.ok) {
                        console.log("deleted user");
                        console.log(currentUser?.uid);
                    } else {
                        const errorData = await response.json();
                        console.log(errorData)
                        // setErrMsg(errorData.message);
                        // setErr(true);
                    }
                } catch (error) {
                    console.log('Error submitting form:', error);
                    // setErrMsg(error.message);
                    // setErr(true);
                }

            }
            useRouter().push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: "#5d0707",
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters variant='dense' sx={{minHeight: 85, height: 85}}>
                        <a href='/lobby'>
                            <img
                                alt='menu-logo'
                                src='/logo-transparent.png'
                                height={99}
                                width={132}
                            />
                        </a>

                        <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                                title="menu"
                            >
                                <MenuIcon/>
                            </IconButton>
                            {(isAccountUser || isAdmin) && (
                                <Menu
                                    id="menu-appbar"
                                    title="appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{display: {xs: 'block', md: 'none'}}}
                                >
                                    <MenuItem component='a' href='/lobby/stats' onClick={handleCloseUserMenu}>
                                        <Typography sx={{textAlign: 'center'}}>View Stats</Typography>
                                    </MenuItem>
                                    <MenuItem component='a' href='/lobby/managefriends' onClick={handleCloseUserMenu}>
                                        <Typography sx={{textAlign: 'center'}}>Manage Friends</Typography>
                                    </MenuItem>
                                </Menu>)}
                        </Box>

                        <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                            {(isAccountUser || isAdmin) && (
                                <>
                                    <Button
                                        component='a'
                                        href='/lobby/stats'
                                        onClick={handleCloseNavMenu}
                                        sx={{my: 2, color: 'white', display: 'block'}}
                                    >
                                        View Stats
                                    </Button>
                                    <Button
                                        component='a'
                                        href='/lobby/managefriends'
                                        onClick={handleCloseNavMenu}
                                        sx={{my: 2, color: 'white', display: 'block'}}
                                    >
                                        Manage Friends
                                    </Button>
                                </>)}
                        </Box>
                        <Box sx={{flexGrow: 0}}>
                            <Tooltip title="Open settings">
                                <IconButton title="settings" onClick={handleOpenUserMenu} sx={{p: 0}}>
                                    <Avatar alt="icon" src="/icon.png"/>
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        sx={{
                                            mr: 2,
                                            display: {xs: 'none', md: 'flex'},
                                            fontFamily: 'monospace',
                                            fontWeight: 525,
                                            letterSpacing: '.1rem',
                                            color: 'white',
                                            textDecoration: 'none',
                                            margin: '5px',
                                        }}
                                    >
                                        {currentUser ? currentUser.displayName : ""}
                                    </Typography>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{mt: '45px'}}
                                id="menu-appbar"
                                title="close menu"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            > {( isAccountUser || isAdmin ) && (
                                <MenuItem component='a' href='/lobby/manageaccount' onClick={handleCloseUserMenu}>
                                    <Typography sx={{textAlign: 'center'}}>Manage Account</Typography>
                                </MenuItem>
                            )}
                                <MenuItem title="exit" component='a' onClick={handleLogout}>
                                    <Typography sx={{textAlign: 'center'}}>{ (isAccountUser || isAdmin)? "Logout" : "Exit Game"}</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <main>{children}</main>
        </ThemeProvider>
    );
}

export default LobbyLayout;
