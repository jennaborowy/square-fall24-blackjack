import './addUser.css'
import Form from "react-bootstrap/Form";
import { auth, db } from '@/firebaseConfig'
import {useContext, useState} from "react";
import {doc, collection, query, where, getDocs, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp} from 'firebase/firestore';
import { AuthContext } from "@/app/messages/AuthContext";
import { ChatContext } from "@/app/messages/ChatContext";

export const AddUser = () => {
  const {currentUser} = useContext(AuthContext);
  const {dispatch} = useContext(ChatContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const [admins, setAdmins] = useState([])
  //search for friends available to chat with
  const handleSearch = async (e) => {
    e.preventDefault();
    //get user name from search form
    const formData = new FormData(e.target);
    const username = formData.get("username");

    //searches users for inputted username
    try {
      if(username !== "admin") {
        const userRef = collection(db, "users");
        const friendUsernameQuery = query(userRef, where("username", "==", username));
        const friendSnapshot = await getDocs(friendUsernameQuery);
        if (friendSnapshot.empty) {
          console.log("No user found with that username.");
          return;
        }
        //gets the friend / recipients id to search user
        const friendDoc = friendSnapshot.docs[0];
        const friendId = friendDoc.id;
        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserSnapshot = await getDoc(currentUserRef);

        //checks if the user is in the current user's friends list
        const currentUserData = currentUserSnapshot.data();
        const friendsList = currentUserData.friends || [];
        if (friendsList.includes(friendId)) {
          const foundUser = friendDoc.data();
          setUser({...foundUser, id: friendId});
        } else {
          console.log("This user is not in your friend list.");
          setUser(null);
        }
      }
      //current user wants to chat with an admin
      else {
        const adminRef = collection(db, "users");
        const adminQuery = query(adminRef, where("role", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.empty) {
          console.log("No admins found.");
          return;
        }
        // Get list of admins
        const adminUsers = adminSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUser(adminUsers);
      }
    } catch (error) {
      console.error("Error searching for user:", error);
      setUser(null);
    }
  };

  //add new chat with a specified user
  const handleAddChat = async (user) => {

    if (!currentUser?.uid || !user?.uid) {
      console.log("current user", currentUser.uid)
      console.log("user", user.uid)
      console.error("Either currentUser or recipient user ID is undefined.");
      return;
    }
    try {
      setUser(user);
      // Create sorted conversation ID
      const conversationId = [currentUser.uid, user.uid].sort().join('_');
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        // Create new conversation if it doesn't exist
        await setDoc(conversationRef, {
          conversationId,
          createdAt: serverTimestamp(),
          messages: [],
          participants: [currentUser.uid, user.uid],
          username: user.username,
          currentUser: currentUser.username,
        });
        // Updates userChats for both users
        const chatData = {
          chatId: conversationId,
          lastMessage: "",
          receiverId: user.uid,
          receiverName: user.username,
          updatedAt: Date.now(),
        };
        const recipientChatData = {
          chatId: conversationId,
          lastMessage: "",
          receiverId: currentUser.uid,
          receiverName: currentUser.username,
          updatedAt: Date.now(),
        };
        // Updates current user's chats
        const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
        const currentUserDoc = await getDoc(currentUserChatsRef);

        if (!currentUserDoc.exists()) {
          await setDoc(currentUserChatsRef, { chats: [chatData] });
        } else {
          await updateDoc(currentUserChatsRef, {
            chats: arrayUnion(chatData)
          });
        }
        // Updates recipient's chats
        const recipientChatsRef = doc(db, "userChats", user.uid);
        const recipientDoc = await getDoc(recipientChatsRef);

        if (!recipientDoc.exists()) {
          await setDoc(recipientChatsRef, { chats: [recipientChatData] });
        } else {
          await updateDoc(recipientChatsRef, {
            chats: arrayUnion(recipientChatData)
          });
        }
      }
      // Updates ChatContext with the new conversation
      dispatch({type: "CHANGE_USER", payload: {user: user, chatId: conversationId, conversationId: conversationId}
      });

    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleSelectAdmin = (admin) => {
    setSelectedAdminId(admin.id); // Set the selected admin ID
  };

  return (
    <div className="addUser">
      <Form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </Form>
      {user && Array.isArray(user) ? (
        <div className="user">
          <ul>
            {/* if user searched 'admin' display list of admins*/}
            {user.map((admin) => (
              <li key={admin.id}>
                <span>{admin.username}</span>
                <button type="button" onClick={() => handleSelectAdmin(admin)}>
                  Select Admin
                </button>
                <button type="submit" onClick={()=> handleAddChat(admin)} disabled={!selectedAdminId}>
                Add User
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : user ? (
        <div className="user">
          <div className="detail">
            <span>{user.username}</span>
          </div>
          <button type="submit" onClick={()=> handleAddChat(user)}>
            Add User
          </button>
        </div>) : null}
      </div>
  )};


export default AddUser;