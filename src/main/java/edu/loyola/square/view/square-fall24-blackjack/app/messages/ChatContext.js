import { createContext, useContext, useReducer } from "react";

export const ChatContext = createContext();
export const ChatContextProvider = ({ children }) => {

  //if data is not defined already, set them to null
  const INITIAL_STATE = {
    chatId: null,
    user: null,
    conversationId: null,
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      //changes the current chat
      case "CHANGE_USER":
        return {
          user: action.payload.user,
          chatId: action.payload.chatId,
          conversationId: action.payload.conversationId,
        };
        //changes the conversation id to match selected chat
      case "SET_CONVERSATION_ID":
        return {
          ...state,
          conversationId: action.payload,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
