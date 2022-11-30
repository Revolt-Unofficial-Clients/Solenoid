import { For } from "solid-js";
import { messages } from "~/routes/client";
import MessageBase from "./MessageBase";
import { styled } from "solid-styled-components";

const MessageDivContainer = styled('div')`
    background-color: ${props => props.theme["secondary-background"]};
    overflow-x: none;
`


const MessageContainer = () => {
    return (
        <MessageDivContainer class="w-full p-0 m-0">
            <For each={messages()}>
                {message => (
                    <MessageBase
                        author={message.author}
                        message={message}
                    />
                )}
            </For>
        </MessageDivContainer>
    )
}

export default MessageContainer;