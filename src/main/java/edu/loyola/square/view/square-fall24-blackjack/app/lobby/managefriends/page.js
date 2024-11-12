"use client";
import "../../globals.css"
import React, { useEffect, useState } from "react";
import "./UserList.css";
import FriendsList from "./FriendsList";
import UserList from "./UserList";
import { useAuth } from "@/app/context/auth";
import {arrayRemove, arrayUnion, collection, doc, getDoc, updateDoc} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {Dialog, DialogActions, DialogContent, DialogContentText} from "@mui/material";

function ManageFriends() {
    const [userList, setUserList] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendToAdd, setFriendToAdd] = useState(null);
    const [friendToRemove, setFriendToRemove] = useState(null);
    const [modalOn, setModalOn] = useState(false);

    const currentUser = useAuth().currentUser;

    const initUserList = async () => {
        try {
            fetch('http://localhost:8080/api/user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((response) => response.json()
            ).then((data) => {
                if (!currentUser) return;
                // initializes user list to be without currentUser
                const initUserList = Object.values(data).filter((user) => user.uid !== currentUser.uid);
                setUserList(initUserList);
            }).catch((error) => {
                console.log("err in fetch: ", error.message);
            });

        } catch (error) {
            console.log(error.message);
        }
    }

    // dependent on currentUser loading -- initializes the lists after fetching from db
    const initFriends = async () => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        const friendUids = docSnap.data().friends || [];

        const friendsData = await Promise.all(
            friendUids.map(async (uid) => {
                const friendRef = doc(db, "users", uid);
                const friendSnap = await getDoc(friendRef);
                return {uid, ...friendSnap.data()}
            })
        );

        setFriends([...friendsData]);
    }

    useEffect(() => {
        if (currentUser) {
            initUserList().catch((error) => console.log(error));
            initFriends().catch((error) => console.log(error));
        }
    }, [currentUser])

    useEffect(() => {
        if (userList.length && friends.length) {
            console.log(friends)
            const friendUids = friends.map(friend => friend.uid);
            // update userList based on friends
            setUserList(userList.filter((user) => !friendUids.includes(user.uid)));
        }
    }, [friends]);


    async function addFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        try {
            await updateDoc(userRef, {
                friends: arrayUnion(user.uid),
            });
            // update the friends list in here
            setFriends(prevFriends => [...prevFriends, user]);
            setUserList(prevUserList => prevUserList.filter(u => u.uid !== user.uid));
            setFriendToAdd(null);
            setFriendToAdd(null);
        } catch(error) {
            console.log("error adding friend: ", error);
        }
        console.log("friends update: ", friends)
    }

    // removes friend from currentUser's friend list
    async function removeFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        try {
            await updateDoc(userRef, {
                friends: arrayRemove(user.uid),
            });
            setFriends((prevFriends) => prevFriends.filter((f) => f.uid !== user.uid));
            setUserList([...userList, user]);
            setFriendToRemove(null);
        } catch (error) {
            console.log("error removing friend: ", error);
        }
    }

    // verifies potential friend by uid
    async function updateFriendToAdd(user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        setFriendToAdd(docSnap.data())
        setModalOn(true);
    }

    // verfies friend to remove by uid
    async function updateFriendToRemove(user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        setFriendToRemove(docSnap.data())
        setModalOn(true);
    }

    return (
        <div className="row">
            <div className="col">
                <UserList
                    userList={userList}
                    updateFriend={updateFriendToAdd}
                >
                </UserList>
            </div>
            <div className="col">
                <FriendsList
                    detailedFriends={friends}
                    updateFriend={updateFriendToRemove}
                ></FriendsList>
            </div>
            <Dialog
                open={modalOn}
                onClose={(e) => setModalOn(false)}>
                <DialogContent> {(friendToRemove != null || friendToAdd != null) && (
                    <DialogContentText>
                        {friendToRemove ? `Remove @${friendToRemove.username}?` : `Add @${friendToAdd.username}?`}
                    </DialogContentText>
                )}
                </DialogContent>
                <DialogActions>
                    <button
                        className="mt-3 btn btn-danger border"
                        onClick={(e) => {
                            friendToRemove ? removeFriend(friendToRemove) : addFriend(friendToAdd)
                        }}>
                        Yes
                    </button>
                    <button className="mt-3 btn border" onClick={(e) => setModalOn(false)}>
                        No
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ManageFriends;