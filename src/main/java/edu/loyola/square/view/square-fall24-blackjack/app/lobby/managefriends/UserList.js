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
        const initializeFriends = async () => {
            if (!currentUser) return;

            const userRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userRef);
            const updatedFriends = docSnap.data().friends || [];

            setFriends(updatedFriends);
            setUserList(userList.filter((user) => !updatedFriends.includes(user.uid)));
        }

       //

    useEffect(() => {
        initializeFriends();
    }, [currentUser])

    // updates the userList of those who aren't added whenever friends are added
    useEffect(() => {
        function updateRemainingUsers() {
            const updatedList = userList.filter((user) => !friends.includes(user.uid));
            if (JSON.stringify(updatedList) !== JSON.stringify(userList)) {
                setUserList(updatedList);
            }
        }
        updateRemainingUsers();

    }, [friends, userList]);

    return (
        <div className="row">
            <h1 className="UserList-header ms-5 p-2 pt-3 rounded-top mt-3 mb-0">Find New Friends</h1>
            <div className="UserList-container ms-5 p-10 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4">
                    {userList.map((user, index) => (
                        <div
                            key={index}
                            className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center row">
                                <div className="col text-start" id={user.uid}>
                                    <h3 className="font-medium">@{user.username}</h3>
                                    <p className="text-sm text-gray-600">{user.firstName + " " + user.lastName}
                                    </p>
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-success mt-3" onClick={(e) => {
                                        updateFriend(user)
                                            .then(() => console.log("updated"))
                                            .catch((error) => {
                                                console.log(error);
                                            });

                                        setModalOn(true);
                                    }}>Add Friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
            </div>
        </div>
    );
}

export default UserList;