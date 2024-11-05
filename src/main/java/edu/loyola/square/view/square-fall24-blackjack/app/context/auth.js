// code from https://monsterlessons-academy.com/posts/next-js-authentication-with-firebase-do-it-right
"use client"

import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";

export const AuthContext = createContext({
    currentUser: null,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser({
                    uid: user.uid,
                    displayName: user.displayName
                });
            } else {
                //setCurrentUser(null);
                console.log("logged out user")
            }
        });
    }, []);
    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};