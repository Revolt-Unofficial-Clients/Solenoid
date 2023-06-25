import { Emoji } from "./unicodeEmoji";
import { createSignal, Match, Switch } from "solid-js";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";
import { revolt } from "../../../lib/revolt";

export const RE_CUSTOM_EMOJI = /:([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}):/g;

export function RenderCustomEmoji({ match }: CustomComponentProps) {
  const [exists, setExists] = createSignal(true);
  const url = `${
    revolt?.config?.features.autumn.url
  }/emojis/${match}`;

  return (
    <Switch fallback={<span>{`:${match}:`}</span>}>
      <Match when={exists()}>
        <Emoji
          loading="lazy"
          class="w-5"
          draggable={false}
          src={url}
          onError={() => setExists(false)}
        />
      </Match>
    </Switch>
  );
}

export const remarkLegacyCustomEmoji = createComponent("lcemoji", RE_CUSTOM_EMOJI);