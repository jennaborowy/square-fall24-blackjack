"use client";
import "../../globals.css"
import React, { useEffect, useRef, useState } from "react";
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

                const friendIds = data.friends || [];

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

    // dependent on currentUser loading -- initializes the lists
    const initializeFriendsAndRemainingUsers = async () => {
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

        console.log(friendsData)

        setFriends(friendsData);

    }

    useEffect(() => {
        console.log("before: ", userList)
        initUserList();
        console.log("after: ", userList)
        initializeFriendsAndRemainingUsers();
        console.log(friends)

        // console.log("friends: ", friends)
        // console.log("remaining users: ", userList)
    }, [currentUser])

    useEffect(() => {
        console.log(friends)
        setUserList(userList.filter((user) => !friends.includes(user.uid)));
    }, [friends]);

    // useEffect(() => {
    //     initializeFriendsAndRemainingUsers();
    //     console.log("friends: ", friends)
    //     console.log("remaining users: ", userList)
    // }, [userList]);


    async function addFriend(user) {
        setModalOn(false);

        const userRef = doc(collection(db, "users"), currentUser.uid);
        try {
            await updateDoc(userRef, {
                friends: arrayUnion(user.uid),
            });
            const docSnap = await getDoc(userRef);
            // update the friends list in here
            setFriends([...docSnap.data().friends]);
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
            //const docSnap = await getDoc(userRef);
            setDetailedFriends((prevFriends) => prevFriends.filter((f) => f.uid !== user.uid));
            setUserList([...userList, user]);
            // onFriendUpdate();
            console.log("removed user: ", user)
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
                    //setUserList={setUserList}

                    //addFriend={addFriend()}
                    //friend={friendToAdd}
                    updateFriend={updateFriendToAdd}
                    setModalOn={setModalOn}


                    //onFriendUpdate={onFriendUpdate}

                    // userList={userList}
                    // onAddFriend={handleAddFriend()}
                >
                </UserList>
            </div>
            <div className="col">
                <FriendsList
                    deteailedFriends={friends}
                    setModalOn={setModalOn}
                    updateFriend={updateFriendToRemove}

                    //setUserList={setUserList}

                    // updateFriend={updateFriendToRemove()}
                    // removeFriend={removeFriend()}
                    //friend={friendToRemove}

                    //onFriendUpdate={onFriendUpdate}

                    // friends={friends}
                    // onRemoveFriend={handleRemoveFriend}
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
                            friendToRemove ?
                            removeFriend(friendToRemove) : addFriend(friendToAdd)
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