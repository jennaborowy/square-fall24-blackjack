import { auth } from "@/firebaseConfig";

function Lobby() {

    console.log(auth?.currentUser?.uid)
    return (
        <div className="m-3">

        </div>
    )
}

export default Lobby;