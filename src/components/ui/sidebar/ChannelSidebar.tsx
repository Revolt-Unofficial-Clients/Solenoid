import { styled } from "solid-styled-components";
import { selectedServer } from "../servers";
import ChannelList from "../servers/lists/ChannelList";

const ChannelSidebarBase = styled("div")`
    background-color: ${props => props.theme["primary-background"]};
    width: 16rem;
    height: 100vh;
    margin: 0px;
    display: flex;
    flex-shrink: 0;
    flex-grow: 0;
    overflow-y: scroll;
`

const ChannelSidebar = () => {
    return (
        <ChannelSidebarBase>
            {/* TODO: Add Direct Message Support */}
            <ChannelList server={selectedServer()} />
        </ChannelSidebarBase>
    );
};

export default ChannelSidebar;