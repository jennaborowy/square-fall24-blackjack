import "../managefriends/UserList.css";

function AllUsers({ userList, setSelectedUser }) {
    return (
        <div className="row">
            <h1 className="UserList-header ms-5 p-2 pt-3 rounded-top mt-3 mb-0">All Users</h1>
            <div className="UserList-container ms-5 p-10 rounded-bottom overflow-y-auto shadow-md">
                <div className="space-y-2 pt-1 p-4">
                    {userList.map((user, index) => (
                        <div
                            key={index}
                            className="p-4 mt-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center row">
                                <div className="col text-start" id={user.uid}>
                                    <h3 className="font-medium">@{user.username}</h3>
                                    <p className="text-sm text-gray-600">{user.firstName + " " + user.lastName}
                                    </p>
                                </div>
                                <div className="col text-end">
                                    <button className="btn btn-success mt-3" onClick={(e) => {
                                        setSelectedUser(user)
                                    }}>Select User
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

export default AllUsers;