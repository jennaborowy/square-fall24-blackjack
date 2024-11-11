import './userInfo.css'
import {useContext} from "react";
import {AuthContext} from "@/app/messages/AuthContext";
import {ChatContext} from "@/app/messages/ChatContext";
export default function UserInfo () {
  const {currentUser} = useContext(AuthContext);
  const {dispatch} = useContext(ChatContext);
  return(
    <div className="userinfo">
     <div className="user"> </div>
      <h6>{currentUser?.username}</h6>
    </div>
  )
}