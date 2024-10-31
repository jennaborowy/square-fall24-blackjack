"use client";

import { useRouter } from "next/navigation";
import { auth, signOut } from "@/firebaseConfig";

function LogoutButton() {

    const router = useRouter();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    return (
        <form onSubmit={handleLogout}>
            <button className="btn btn-warning" type="submit">Logout</button>
        </form>
    );
}
export default LogoutButton;