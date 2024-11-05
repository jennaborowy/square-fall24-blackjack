'use client'
import react, {useState} from 'react'
import './chatbox.css'
import List from '../list/list'
import Chat from '../chat/chat'
import { Rnd } from 'react-rnd';
import {doc, setDoc} from 'firebase/firestore'
import {db} from "@/firebaseConfig";
import {ChatContextProvider} from "@/app/messages/ChatContext";
import {AuthContextProvider} from "@/app/messages/AuthContext";

export default function ChatBox ({ isChatOpen, setIsChatOpen}) {
  const closeChat = () => setIsChatOpen(false);

  if (!isChatOpen) return null;

  return (
    <AuthContextProvider>
      <ChatContextProvider>
        {isChatOpen && (
        <div className="chat-box">
            <div className="chat-header">
              Conversations
              <button onClick={closeChat} className="close-button">
                ×
              </button>
            </div>
          <div className="chat-sections">
              <List/>
              <Chat db={db}/>
            </div>
          </div>)}
      </ChatContextProvider>
    </AuthContextProvider>

  )

}