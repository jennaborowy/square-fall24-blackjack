'use client'
import react, {useState, useEffect} from 'react'
import './chatList.css'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import {MinusIcon} from "lucide-react";
import {doc, onSnapshot, getDoc} from "firebase/firestore";
import {db, auth} from "@/firebaseConfig";
import { collection, query, where, getDocs } from 'firebase/firestore';
import AddUser from "@/app/messages/list/chatList/addUser/addUser";
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatList () {
  const [addMode, setAddMode] = useState(false)
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

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


  useEffect(() => {
    console.log(auth?.currentUser?.uid)

    const unsubscribe = onSnapshot(doc(db, "userChats", currentUser.uid), async (res) => {
      const items = res.data().chats;
      const promises = items.map(async(item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data()
        return {...item, user};
      });
      const chatData = await Promise.all(promises)
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    }
  );
    return () => {
      unsubscribe();
    };
  }, [currentUser.uid]);

  console.log(chats)

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
        <div className="item" key={chat.chatId}>
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
