import type { Client } from "revolt.js";
import type { Component } from "solid-js";

import {FiSettings } from "solid-icons/fi";
import { SetStoreFunction } from "solid-js/store/types";
import { settings } from "../../types";

interface user_information {
    client: Client,
    setSettings: SetStoreFunction<settings>
}

const UserInfo: Component<user_information> = (props) => {
    const avatar_url = props.client.user?.avatar
    ?  `https://autumn.revolt.chat/avatars/${props.client.user?.avatar?._id}`
    : `https://api.revolt.chat/users/${props.client.user?._id}/default_avatar` 
    
    return (
        <>  
            <img src={avatar_url} width={32} height={32} />
            <div class="userinfo">
                <span class="userbar-username">@{props.client.user?.username}</span>
                <div class="box" role="button" onClick={() => {
                    props.setSettings("show", true)
                    console.log("you should show settings... NOW")
                    }}><FiSettings /></div>
            </div>
        </>
    )
}

export {UserInfo};