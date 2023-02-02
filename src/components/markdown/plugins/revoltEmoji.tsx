import { Emoji } from "./unicodeEmoji";
import { createSignal, Match, Switch } from "solid-js";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";
import { emojiDictionary } from "../../../assets/emoji";
import { settings } from "../../../lib/solenoid";

export const RE_EMOJI = /:([a-zA-Z0-9_+]+):/g;
const RE_ULID = /:([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}):/g;

/**
 * Function provided under the MIT License
 * Copyright (c) 2016-20 Ionică Bizău <bizauionica@gmail.com> (https://ionicabizau.net)
 * https://github.com/IonicaBizau/emoji-unicode/blob/master/LICENSE
 */
function toCodepoint(input: string) {
  if (input.length === 1) {
    return input.charCodeAt(0).toString(16);
  } else if (input.length > 1) {
    const pairs = [];
    for (let i = 0; i < input.length; i++) {
      if (
        // high surrogate
        input.charCodeAt(i) >= 0xd800 &&
        input.charCodeAt(i) <= 0xdbff
      ) {
        if (
          input.charCodeAt(i + 1) >= 0xdc00 &&
          input.charCodeAt(i + 1) <= 0xdfff
        ) {
          // low surrogate
          pairs.push(
            (input.charCodeAt(i) - 0xd800) * 0x400 +
              (input.charCodeAt(i + 1) - 0xdc00) +
              0x10000
          );
        }
      } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
        // modifiers and joiners
        pairs.push(input.charCodeAt(i));
      }
    }

    return pairs.map((char) => char.toString(16)).join("-");
  }

  return "";
}

function parseEmoji(emoji: string) {
  if (emoji.startsWith("custom:")) {
    return `https://dl.insrt.uk/projects/revolt/emotes/${emoji.substring(7)}`;
  }

  const codepoint = toCodepoint(emoji);
  return `https://static.revolt.chat/emoji/mutant/${codepoint}.svg?v=1`;
}

export function RenderCustomEmoji({ match }: CustomComponentProps) {
  const [exists, setExists] = createSignal(true);
  const url = RE_ULID.test(match)
    ?  `https://static.revolt.chat/emoji/${settings.emoji}/${toCodepoint(match)}.svg?v=1`
    : parseEmoji(
        match in emojiDictionary
          ? emojiDictionary[match as keyof typeof emojiDictionary]
          : match
      );

  return (
    <Emoji
      loading="lazy"
      class="w-3"
      draggable={false}
      src={url}
      onError={() => setExists(false)}
    />
    // <Switch fallback={<span>{`:${match}:`}</span>}>
    //   <Match when={exists()}>

    //   </Match>
    // </Switch>
  );
}

export const remarkRevoltEmoji = createComponent("cemoji", RE_EMOJI, (match) => match in emojiDictionary || RE_ULID.test(match));
