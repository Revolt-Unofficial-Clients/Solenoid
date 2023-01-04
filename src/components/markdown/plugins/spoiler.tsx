import { createSignal } from "solid-js";
import { styled } from "solid-styled-components";

import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Spoiler = styled("span")<{ shown: boolean }>`
  padding: 0 2px;
  border-radius: 6px;
  cursor: ${(props) => (props.shown ? "auto" : "pointer")};
  user-select: ${(props) => (props.shown ? "all" : "none")};
  color: ${(props) =>
    props.shown ? "#8d93a1" : "transparent"};
  background: ${(props) =>
    props.shown ? "#191d24" : "#151515"};
  > * {
    opacity: ${(props) => (props.shown ? 1 : 0)};
    pointer-events: ${(props) => (props.shown ? "unset" : "none")};
  }
`;

export function RenderSpoiler({ match }: CustomComponentProps) {
  const [shown, setShown] = createSignal(false);

  return (
    <Spoiler shown={shown()} onClick={() => setShown(true)}>
      {match}
    </Spoiler>
  );
}

export const remarkSpoiler = createComponent("spoiler", /!!([^!]+)!!/g);