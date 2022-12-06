import { sendMessageToChannel } from "~/libs/revolt/servers/messages";
import { selectedChannel } from "../servers";
import { setNewMessage, newMessage } from "~/routes/client";
import { styled } from "solid-styled-components";

const MessageBoxContainer = styled("div")`
    background: ${(props) => props.theme["tertiary-background"]};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 100%;
    height: 2.5rem;
    max-height: 5rem;
    position: sticky;
    bottom: 0px;
    left: 0px;
    justify-content: center;
    flex-grow: 1;
    z-index: 1;
`;

const MessageBoxForm = styled("form")`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MessageBoxInput = styled("input")`
    background: ${(props) => props.theme["tertiary-background"]};
`;

const MessageBoxSendBtn = styled("button")`
    margin-right: 0.5rem;
    color: ${(props) => props.theme.foreground};
`;

const MessageBox = () => {
    return (
        <MessageBoxContainer>
            {/* TODO: Add Emoji Picker */}
            {/* TODO: Add Attachment Support */}
            {/* TODO: Finalize UI */}
            <MessageBoxForm
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageToChannel(selectedChannel(), newMessage()).then(
                        () => {
                            setNewMessage("");
                        }
                    );
                }}
            >
                <MessageBoxInput
                    value={newMessage()}
                    onChange={(e) => setNewMessage(e.currentTarget.value)}
                    placeholder={`Message ${selectedChannel()?.name}`}
                    class="flex-1 h-full w-full"
                />
                <MessageBoxSendBtn class="ml-2 text-white" type="submit">
                    Send
                </MessageBoxSendBtn>
            </MessageBoxForm>
        </MessageBoxContainer>
    );
};

export default MessageBox;
