'use client'
import react, {useState, useEffect, useContext} from 'react'
import './chatList.css'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import {doc, onSnapshot, getDoc} from "firebase/firestore";
import {db, auth} from "@/firebaseConfig";
import AddUser from "@/app/messages/list/chatList/addUser/addUser";
import {AuthContext} from "@/app/messages/AuthContext";
import {ChatContext} from "@/app/messages/ChatContext";

export default function ChatList () {
  const [addMode, setAddMode] = useState(false)
  const [chats, setChats] = useState([]);
  //authenticates user
  const {currentUser} = useContext(AuthContext);
  const {dispatch} = useContext(ChatContext)


  useEffect(() => {
    //console.log(auth?.currentUser?.uid)
    if (!currentUser) {
     // console.error("Current user not authenticated");
      return;
    }
    //snapshot of all the users current chats
    const unsubscribe = onSnapshot(doc(db, "userChats", currentUser.uid), async (res) => {
      //if document hasnt been created
      if (!res.exists()) {
        setChats([]);
        return;
      }
      //get the chats
      const items = res.data().chats;
      const promises = items.map(async(item) => {
        //maps messages to a receiverId
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        //gets receiver id for
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          return {...item, user: {...userData, uid: item.receiverId}};
        }
        return item;
      });
      const chatData = await Promise.all(promises)
      //sort messages based on when they were created
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  //opens a specific chat
  const handleSelectChat = (chat) => {
    const conversationId = [currentUser.uid, chat.receiverId].sort().join('_');
    //changes the user (recipient of the chat)
    dispatch({type: "CHANGE_USER", payload: {user: chats.user, chatId: conversationId, conversationId: conversationId}})
  };

  return(
    <div className="chatlist">
      <div className="search">
        <div className="searchBar">
          <SearchIcon/>
          <input type="text" placeholder="Search"/>
        </div>
        <div className="add" onClick={() => setAddMode((prev) => !prev)}>
          {addMode ? <RemoveIcon/> : <AddIcon/>}
        </div>
      </div>
      {chats.map((chat)=> (
        <div className="item" key={chat.chatId} onClick={() => handleSelectChat(chat)}>
          <div className="texts">
            <span>{chat.receiverName}</span>
            <p>{chat.lastMessage || "No messages have been sent yet"}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser/>}
    </div>
  );
}
