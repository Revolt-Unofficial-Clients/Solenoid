import type { Client } from "revolt.js";
import type { Component } from "solid-js";

interface user_information {
    client: Client
}

const UserInfo: Component<user_information> = (props) => {
    const avatar_url = props.client.user?.avatar
    ?  `https://autumn.revolt.chat/avatars/${props.client.user?.avatar?._id}`
    : `https://api.revolt.chat/users/${props.client.user?._id}/default_avatar` 
    
    return (
        <>  
            <img src={avatar_url} width={32} height={32} />
            <span class="userbar-username">@{props.client.user?.username}</span>
            <span class="userbar-icon">Settings</span>
        </>
    )
}

export {UserInfo};