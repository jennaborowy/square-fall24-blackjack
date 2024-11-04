'use client'
import react, {useState, useEffect} from 'react'
import {Rnd } from 'react-rnd'
import './chat.css'

export default function  Chat () {
  const [text, setText] = useState("");

  console.log(text)
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          {/* add user avatar here*/}
          <div className="texts">
            <span> username </span>
            <p> hello i am callie</p>
          </div>
        </div>
      </div>
      <div className="center">
        <div className="message own ">
          <div className="texts">
            <p>
              here is a text messafe
            </p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className="message">
          <div className="texts">
            <p>
              here is a text messafe
            </p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>
              here is a text messafe
            </p>
            <span>1 min ago</span>
          </div>
        </div>
      </div>

      <div className="bottom">
        <div className="icons">
          <input type="text" placeholder="Type a message..." onChange={e => setText(e.target.value)}/>
          {/*add user avatar*/}

          <button className="sendButton">Send</button>
        </div>
      </div>
    </div>
  )
}