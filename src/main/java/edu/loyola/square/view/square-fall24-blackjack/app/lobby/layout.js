//This layout is edited from Material UI's docs: https://mui.com/material-ui/react-app-bar/

"use client"

import * as React from 'react';
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
import {createTheme, ThemeProvider} from "@mui/material";
import { useRouter } from "next/navigation";
import {auth, db, signOut} from "@/firebaseConfig";
import {doc, getDoc} from 'firebase/firestore';
import {useEffect, useState} from "react";




function LobbyLayout({children}) {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const router = useRouter();

    const [username, setUsername] = useState("");

    useEffect( () => {
        const display = auth.onAuthStateChanged(async ()=>
        {
            const user = auth.currentUser.uid;
            const docRef = doc(db, 'users', user);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUsername(docSnap.data()['username']);
            }
        });
        return ()=> display;
    });

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            router.push('/');
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
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
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
                            </Menu>
                        </Box>

                        <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
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
                        </Box>
                        <Box sx={{flexGrow: 0}}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
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
                                        {username}
                                    </Typography>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{mt: '45px'}}
                                id="menu-appbar"
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
                            >
                                <MenuItem component='a' href='/lobby/manageaccount' onClick={handleCloseUserMenu}>
                                    <Typography sx={{textAlign: 'center'}}>Manage Account</Typography>
                                </MenuItem>
                                <MenuItem component='a' onClick={handleLogout}>
                                    <Typography sx={{textAlign: 'center'}}>Logout</Typography>
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
