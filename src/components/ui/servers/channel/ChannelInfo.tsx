import { Channel } from "revolt.js";
import { styled } from "solid-styled-components";

interface ChannelInfoProps {
    channel: Channel;
}

const ChannelInfoContainer = styled('div')`
    background-color: ${props => props.theme["primary-header"]};
    color: ${props => props.theme.foreground};
    display: flex;
    flex-shrink: 1;
    height: 1.75rem;
    padding: 1.5rem;
    width: 100%;
    position: sticky;
    top: 0px;
    left: 0px;
    align-items: center;
`

const ChannelInfo = (props: ChannelInfoProps) => {
    return (
        <ChannelInfoContainer>
            <h1 class="inline-block text-ellipsis whitespace-nowrap w-full">
                {/* TODO Add Channel Toggle */}
                #{props.channel.name}{" "}
                <span class="">
                    {props.channel.description &&
                        "| " +
                            props.channel.description.replace(/[\n\r]+/g, " ")}
                </span>
            </h1>
        </ChannelInfoContainer>
    );
};

export default ChannelInfo;
