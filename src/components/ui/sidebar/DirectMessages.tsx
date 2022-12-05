import { createSignal } from "solid-js";
import { styled } from "solid-styled-components";

import { BiRegularHappyBeaming, BiRegularHome, BiRegularNotepad } from "solid-icons/bi";

const ItemSidebar = styled("div")`
    background-color: ${(props) => props.theme["secondary-background"]};
    height: 100%;
    width: 16rem;
    display: flex;
    margin: 0px;
    flex-shrink: 0;
    flex-direction: column;
    color: ${(props) => props.theme.foreground};
`;

const Item = styled("li")`
    background-color: ${(props) => props.theme["secondary-background"]};
    padding: 0.75rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    color: ${(props) => props.theme["tertiary-foreground"]};

    &[data-active="true"] {
        background-color: ${(props) => props.theme.hover};
        color: ${(props) => props.theme.foreground};
        cursor: unset;
    }
`;

export const [DMtab, setDMTab] = createSignal<number>(0);

const DirectMessages = () => {
    return (
        <ItemSidebar>
            <h1 class="m-4">Direct Messages</h1>
            <ul>
                <Item data-active={DMtab() === 0 ? "true" : "false"} onClick={() => setDMTab(0)}>
                    <BiRegularHome />
                    Home
                </Item>
                <Item data-active={DMtab() === 1 ? "true" : "false"} onClick={() => setDMTab(1)}>
                    <BiRegularHappyBeaming />
                    Friends
                </Item>
                <Item data-active={DMtab() === 2 ? "true" : "false"} onClick={() => setDMTab(2)}>
                    <BiRegularNotepad />
                    Notes
                </Item>
            </ul>
            <span class="ml-4 text-sm">Conversations</span>
            <ul>
                <Item>FIXME</Item>
                <Item>FIXME</Item>
                <Item>FIXME</Item>
            </ul>
        </ItemSidebar>
    )
}

export default DirectMessages;