import { Emoji, toCodepoint } from "./unicodeEmoji";
import { createSignal, Match, Switch } from "solid-js";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";
import { client } from "../../providers/client";
import { emojiDictionary } from "../../../assets/emoji";
import { settings } from "../../../lib/solenoid";

export const RE_CUSTOM_EMOJI = /:([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}):/g;
const RE_ULID = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

function parseEmoji(emoji: string) {
  if (emoji.startsWith("custom:")) {
    return `https://dl.insrt.uk/projects/revolt/emotes/${emoji.substring(7)}`;
  }

  const codepoint = toCodepoint(emoji);
  return `https://static.revolt.chat/emoji/${settings.emoji}/${codepoint}.svg?v=1`;
}

export function RenderCustomEmoji({ match }: CustomComponentProps) {
  const [exists, setExists] = createSignal(true);
  const url = RE_ULID.test(match)
    ? `${client?.config?.features.autumn.url}/emojis/${match}`
    : parseEmoji(
        match in emojiDictionary
          ? emojiDictionary[match as keyof typeof emojiDictionary]
          : match
      );

  return (
    <Switch fallback={<span>{`:${match}:`}</span>}>
      <Match when={exists()}>
        <Emoji
          loading="lazy"
          class="w-5 h-5 block"
          draggable={false}
          src={url}
          onError={() => setExists(false)}
        />
      </Match>
    </Switch>
  );
}

export const remarkCustomEmoji = createComponent("cemoji", RE_CUSTOM_EMOJI, (match: any) => match in emojiDictionary || RE_ULID.test(match));
