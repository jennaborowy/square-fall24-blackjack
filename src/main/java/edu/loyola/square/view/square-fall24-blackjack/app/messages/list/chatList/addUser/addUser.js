import './addUser.css'
import Form from "react-bootstrap/Form";
import { formatRelative } from 'date-fns'
import {auth, db} from '@/firebaseConfig'
import {useEffect, useState} from "react";
import {doc, collection, query, where, getDocs, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import {onAuthStateChanged} from "firebase/auth";

export const AddUser = () => {


  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("")

  //authenticates current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          username: user.displayName,
        })
      }
      else {
        setCurrentUser(null)
      }
    })
    return () => unsubscribe()
  }, [])


  //search for a user to chat with
  const handleSearch = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data();
        setUser({...foundUser, id: querySnapshot.docs[0].id});
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error searching for user:", err);
      setUser(null);
    }
  }

  //add new chat with a specified user
  const handleAddChat = async () => {
    console.log(auth?.currentUser?.uid)

   // currentUser.uid
    if (!currentUser?.uid || !user?.id) {
      console.error("Either currentUser or recipient user ID is undefined.");
      return;
    }
    //the collection of messages
    const chatRef = collection(db, "conversations")
    //the collection of a user's chats with other users
    const userChatsRef = collection(db, "userChats")
    try {
      const newChatRef = doc(chatRef)

      //create new document
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUser.uid, user.uid]
      });
      console.log(newChatRef.id)
      console.log(userChatsRef.id)
      console.log(auth.currentUser.uid)
      console.log(user.uid)

      const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
      const currentUserDoc = await getDoc(currentUserChatsRef);
      const recipientChatsRef = doc(db, "userChats", user.uid);
      const recipientDoc = await getDoc(recipientChatsRef);

      //set chat data for user (sender)
      const chatData = {
        chatId: newChatRef.id,
        lastMessage:"",
        receiverId: user.uid,
        receiverName: user.username,
        updatedAt: Date.now(),

      }
      const recipientChatData = {
        chatId: newChatRef.id,
        lastMessage:"",
        receiverId: currentUser.uid,
        receiverName: currentUser.username,
        updatedAt: Date.now(),
      }

      //check if the documents exist
      if (!currentUserDoc.exists()) {
        await setDoc(currentUserChatsRef, { chats: [chatData] });
      } else {
        await updateDoc(currentUserChatsRef, {
          chats: arrayUnion(chatData)
        });
      }
      if (!recipientDoc.exists()) {
        await setDoc(recipientChatsRef, { chats: [recipientChatData] });
      } else {
        await updateDoc(recipientChatsRef, {
          chats: arrayUnion(recipientChatData)
        });
      }
      console.log(userChatsRef.id)
      //updates user chat
      console.log(newChatRef.id)
    }catch(err){
      console.log(err)
    }
  };

  return (
    <div className="addUser">
      <Form onSubmit={handleSearch}>
        <input type="text" placeholder="username" name="username" value={username}
               onChange={(e) => setUsername(e.target.value)}/>
        <button type="submit">Search</button>
      </Form>
      {user && (
        <div className="user">
        <div className="detail">
          <span>{user.username}</span>
        </div>
        <button onClick={handleAddChat}> Add User </button>
      </div>)}
    </div>
  );
};
export default AddUser;