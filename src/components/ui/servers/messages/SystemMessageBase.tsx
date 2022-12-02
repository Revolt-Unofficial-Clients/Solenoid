import { client } from "~/libs/revolt";
import { Message, User } from "revolt.js";
import { For, Match, Switch } from "solid-js";
import showdown from "showdown";
import { styled } from "solid-styled-components";

interface MessageProps {
    system: Message
}

// TODO Random Kick/Ban Messages
// TODO Add Icons

const MessageBaseContainer = styled("div")`
    margin: 0.5rem;
    width: 100%;
    height: 5rem;
`;
const MessageContent = styled("div")`
    word-break: normal;
    margin-right: 4px;
    color: ${(props) => props.theme.foreground};
`;

const MessageReplyBase = styled("div")`
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    width: fit-content;
    margin-bottom: 0.5rem;
    background-color: ${(props) => props.theme["primary-background"]};
    border-left-width: 4px;
    border-left-color: ${(props) => props.theme.accent};
    align-items: center;
`;

const SystemMessageChip = styled("span")`
    display: inline-flex;
    align-items: center;
    border-radius: 99999px;
    background-color: ${(props) => props.theme.background};
    padding: 0.25rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    color: ${(props) => props.theme.accent};
    font-weight: 700;
    margin-left: -2px;
`;

const SystemMessageBase = (props: MessageProps) => {
    console.log(props.system.asSystemMessage.type);
    console.log(props.system.asSystemMessage.type == "user_joined" && props.system.asSystemMessage.user.username);
    return (
        <MessageBaseContainer>
            <div class="flex items-center">
                <h1 class="text-md text-white">
                    <SystemMessageChip>System Message</SystemMessageChip>
                </h1>
            </div>
            <div>
                <MessageContent>
                    <Switch>
                        <Match when={props.system.asSystemMessage.type == "user_joined"}>
                            <p>{props.system.asSystemMessage.type == "user_joined" && props.system.asSystemMessage.user.username} Joined</p>
                        </Match>
                        <Match when={props.system.asSystemMessage.type == "user_left"}>
                            <p>{props.system.asSystemMessage.type == "user_left" && props.system.asSystemMessage.user.username} Left</p>
                        </Match>
                        <Match when={props.system.asSystemMessage.type == "user_kicked"}>
                            <p>{props.system.asSystemMessage.type == "user_kicked" && props.system.asSystemMessage.user.username} was Kicked</p>
                        </Match>
                        <Match when={props.system.asSystemMessage.type == "user_banned"}>
                            <p>{props.system.asSystemMessage.type == "user_banned" && props.system.asSystemMessage.user.username} was Banned</p>
                        </Match>
                    </Switch>
                </MessageContent>
            </div>
        </MessageBaseContainer>
    );
};

export default SystemMessageBase;
