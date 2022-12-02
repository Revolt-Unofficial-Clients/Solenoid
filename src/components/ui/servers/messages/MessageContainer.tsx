import { For, Match, Switch } from "solid-js";
import { messages } from "~/routes/client";
import MessageBase from "./MessageBase";
import { styled } from "solid-styled-components";
import SystemMessageBase from "./SystemMessageBase";

const MessageDivContainer = styled('div')`
    background-color: ${props => props.theme["secondary-background"]};
    overflow-x: none;
`


const MessageContainer = () => {
    return (
        <MessageDivContainer class="overflow-y-scroll overflow-x-hidden w-full h-full p-0 m-0">
            <For each={messages()}>
                {message => (
                    <Switch fallback={
                        <MessageBase
                        author={message.author}
                        message={message}
                        />
                    }>
                        <Match when={message.system}>
                            <SystemMessageBase
                                system={message}
                            />
                        </Match>
                    </Switch>
                )
            }
            </For>
        </MessageDivContainer>
    )
}

export default MessageContainer;