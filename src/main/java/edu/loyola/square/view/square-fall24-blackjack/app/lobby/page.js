import LogoutButton from "@/app/lobby/LogoutButton";
import { auth } from "@/firebaseConfig";

function Lobby() {

    console.log(auth?.currentUser?.uid)
    return (
        <div className="m-3">
            <LogoutButton></LogoutButton>
            <h1>Lobby Placeholder</h1>
        </div>
    )
}

export default Lobby;