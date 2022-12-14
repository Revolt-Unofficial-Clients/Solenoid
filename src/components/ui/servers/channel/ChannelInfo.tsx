import { Channel } from "revolt.js";
import { BiRegularHash } from "solid-icons/bi";
import { styled } from "solid-styled-components";

interface ChannelInfoProps {
    channel: Channel;
}

const ChannelInfoContainer = styled("div")`
    background-color: ${(props) => props.theme["primary-header"]};
    color: ${(props) => props.theme.foreground};
    display: flex;
    flex-shrink: 1;
    height: 1.75rem;
    padding: 1.5rem;
    width: 100%;
    position: sticky;
    top: 0px;
    left: 0px;
    align-items: center;
`;

const ChannelInfo = (props: ChannelInfoProps) => {
    return (
        <ChannelInfoContainer>
            <h1 class="flex items-center text-ellipsis whitespace-nowrap w-full h-full">
                {/* TODO Add Channel Toggle */}
                <BiRegularHash />
                {props.channel.name}{" "}
                {props.channel.description && props.channel.description.replace(/[\n\r]+/g, " ")}
            </h1>
        </ChannelInfoContainer>
    );
};

export default ChannelInfo;
