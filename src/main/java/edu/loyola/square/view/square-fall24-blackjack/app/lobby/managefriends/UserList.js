import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/app/context/auth";

function UserList({ userList, setUserList }) {
    const [friend, setFriend] = useState(null);
    const [modalOn, setModalOn] = useState(false);
    const [friends, setFriends] = useState([]);

    const currentUser = useAuth().currentUser;

    // adds friend to currentUser's friend list
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

    // verifies potential friend by uid
    async function updateFriend(user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        setFriend(docSnap.data())
        setModalOn(true);
    }

    // dependent on currentUser loading
    useEffect(() => {
        async function initializeFriends() {
            if (!currentUser) return;
            const userRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userRef);
            const initFriends = docSnap.data().friends || [];
            setFriends(initFriends);
        }

        initializeFriends().catch((error) => console.log("eqwleu: ", error));
    }, [currentUser])

    useEffect(() => {
        function updateRemainingUsers() {
            console.log("Updated friends state:", friends);
            const updatedList = userList.filter((user) => !friends.includes(user.uid));
            if (JSON.stringify(updatedList) !== JSON.stringify(userList)) {
                setUserList(updatedList);
            }
        }
        updateRemainingUsers();

    }, [friends, userList]);

    return (
        <div className="row">
            <div className="TableList-container mt-4 p-10 h-96 border rounded-lg overflow-y-auto shadow-md col">
                <h1 className="text-center mt-3 mb-0">Find Friends</h1>
                <div className="space-y-2 pt-1 p-4">
                    {userList.map((user, index) => (// check that user is not in currentUser.friends
                        <div>
                            <div
                                key={index}
                                className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                            >
                                <div className="flex justify-between items-center row">
                                    <div className="col" id={user.uid}>
                                        <h3 className="font-medium">@{user.username}</h3>
                                        <p className="text-sm text-gray-600">{user.firstName + " " + user.lastName}
                                        </p>
                                    </div>
                                    <div className="col">
                                        <div className="button-container">
                                            <button className="btn btn-success mt-3" onClick={(e) => {
                                                updateFriend(user)
                                                    .then(() => console.log("updated"))
                                                    .catch((error) => {
                                                        console.log(error);
                                                    });

                                                setModalOn(true);
                                            }}>Add Friend</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Dialog
                                open={modalOn}
                                onClose={(e) => setModalOn(false)}>
                                <DialogContent> {(friend != null) && (
                                    <DialogContentText>
                                        Add @{friend.username}?
                                    </DialogContentText>
                                )}
                                </DialogContent>
                                <DialogActions>
                                    <button className="mt-3 btn btn-success border" onClick={(e) => addFriend(friend)}>
                                        Yes
                                    </button>
                                    <button className="mt-3 btn btn-danger border" onClick={(e) => setModalOn(false)}>
                                        No
                                    </button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default UserList;