import { Message } from "revolt.js";
import { Component, Show } from "solid-js";
import { For } from "solid-js";
import { Markdown } from "../../../markdown";

interface ComponentProps {
  message: Message;
}

const RevoltEmbeds: Component<ComponentProps> = (props) => {
  return (
    <For each={props.message.embeds}>
      {(embed) => {
        if (embed.type === "Website") {
          return (
            <div class="card w-full bg-base-100">
              <Show when={embed.image}>
                <figure>
                  <img src={embed.image?.url || ""} />
                </figure>
              </Show>
              <div class={`card-body rounded-bl-2xl break-words`}>
                <span class="flex items-center gap-2">
                    <Show when={embed.icon_url}>
                        <img src={embed.icon_url || ""} class="w-5" />
                    </Show>
                  <h2 class="card-title break-normal">{embed.title}</h2>
                </span>
                <Markdown content={embed.description || ""} />
                <Show when={embed.original_url && embed.site_name}>
                <div class="card-actions justify-end">
                    <a href={embed.original_url || ""} class="btn btn-primary">Go to {embed.site_name}</a>
                </div>
              </Show>
              </div>
            </div>
          );
        } else if (embed.type === "Text") {
            return (
                <div class="card w-96 m:w-auto bg-base-100">
                    <div class={`card-body border-l-2 border-[${embed.colour || "#7ccbff"}] rounded-l-2xl`}>
                        <h2 class="card-title">{embed.title}</h2>
                        <Markdown content={embed.description || ""} />
                    </div>
                </div>
            )
        } else if (embed.type === "Image") {
          return (
            <div class="card w-96 m:w-10 bg-base-100">
              <figure>
                <img src={embed.url} />
              </figure>
            </div>
        )
        }
      }}
    </For>
  );
};

export default RevoltEmbeds;
