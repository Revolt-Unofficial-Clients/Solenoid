import { For } from "solid-js";
import { messages } from "~/routes/client";
import MessageBase from "./MessageBase";
import { styled } from "solid-styled-components";

const MessageDivContainer = styled('div')`
    background-color: ${props => props.theme.background};
    overflow-x: none;
`


const MessageContainer = () => {
    return (
        <MessageDivContainer>
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