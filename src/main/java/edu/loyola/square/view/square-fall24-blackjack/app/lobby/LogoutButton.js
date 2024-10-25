"use client";

import { useRouter } from "next/navigation";

function LogoutButton() {

    const router = useRouter();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/api/logout/", {
                method: 'POST',
            })
            if (!response.ok) {
                const error = await response.json();
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    return (
        <form onSubmit={handleLogout}>
            <button className="btn btn-warning mt-3" type="submit">Logout</button>
        </form>
    );
}
export default LogoutButton;