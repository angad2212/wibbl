const fetchChats = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from local storage
    const loggedInUser = JSON.parse(localStorage.getItem("userInfo")); // Get user info from local storage

    // Retrieve the logged-in user's ID from the user info
    const excludedUserId = loggedInUser?._id || ''; // Accessing _id directly

    console.log('Logged In User ID:', excludedUserId); // Log the user ID for debugging

    const response = await fetch('http://localhost:3000/api/chat', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const data = await response.json();
        const allUsers = [];

        data.forEach(chat => {
            chat.users.forEach(user => {
                // Exclude the logged-in user dynamically
                if (user._id !== excludedUserId && !allUsers.find(u => u._id === user._id)) {
                    allUsers.push(user); // Avoid duplicates
                }
            });
        });

        console.log('Filtered Users:', allUsers); // Log the filtered users for debugging
        setUsers(allUsers); // Set the state with all unique users excluding the specified user
        setLoading(false);
    } else {
        console.error('Failed to fetch chats:', response.status);
        setLoading(false);
    }
};

export default fetchChats;