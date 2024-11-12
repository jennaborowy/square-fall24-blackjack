import "./UserList.css";

function FriendsList({ updateFriend, detailedFriends }) {
    return (
        <div>
            <h1 className="UserList-header p-2 pt-3 rounded-top mt-3 mb-0">View Current Friends</h1>
            <div className="UserList-container p-10 h-96 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4">
                    {(detailedFriends) && detailedFriends.map((friend) => (
                        <div
                            key={friend.uid}
                            className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center row">
                                <div className="col text-start" id={friend.uid}>
                                    <h3 className="font-medium">@{friend.username}</h3>
                                    <p className="text-sm text-gray-600">{friend.firstName} {friend.lastName}
                                    </p>
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-danger mt-3" onClick={(e) => {
                                        updateFriend(friend)
                                            .then(() => console.log("updated"))
                                            .catch((error) => {
                                                console.log(error);
                                            });
                                    }}>Remove Friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FriendsList;