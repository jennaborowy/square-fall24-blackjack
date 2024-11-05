import {createContext, useEffect, useState} from "react";
import {auth} from "@/firebaseConfig";
//authenticates current user
export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
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

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  )
}