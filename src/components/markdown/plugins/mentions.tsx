import { RE_MENTIONS } from "revolt.js";
import { styled } from "solid-styled-components";

import { createComponent, CustomComponentProps } from "./remarkRegexComponent";
import { client } from "../../providers/client";

const Mention = styled.a`
  gap: 4px;
  flex-shrink: 0;
  padding-left: 2px;
  padding-right: 6px;
  align-items: center;
  display: inline-flex;
  vertical-align: middle;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none !important;
  transition: 0.1s ease filter;
  &:hover {
    filter: brightness(0.75);
  }
  &:active {
    filter: brightness(0.65);
  }
  svg {
    width: 1em;
    height: 1em;
  }
`;

export function RenderMention({ match }: CustomComponentProps) {
  const user = client.users.get(match)!;
  return (
    <Mention class="bg-base-300 rounded-full h-max w-max">
      <div class="rounded-full flex w-full items-center gap-2">
          <img
            src={
              user.generateAvatarURL()
            }
            class="w-5 h-5 rounded-full"
          />
          @{user.username}
        </div>
    </Mention>
  );
}

export const remarkMention = createComponent("mention", RE_MENTIONS, (match: any) =>
  client.users.has(match)
);