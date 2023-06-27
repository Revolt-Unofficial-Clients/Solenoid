import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

import { childrenToSolid } from "./solid-md/ast-to-solid";
import { defaults } from "./solid-md/defaults";
import { html } from "property-information";
import { unified } from "unified";
import { VFile } from "vfile";

import { remarkUnicodeEmoji, RenderUnicodeEmoji } from "./plugins/unicodeEmoji";
import { remarkCustomEmoji, RenderCustomEmoji } from "./plugins/customEmoji";
import { remarkMention, RenderMention } from "./plugins/mentions";
import { remarkSpoiler, RenderSpoiler } from "./plugins/spoiler";
import { remarkHtmlToText } from "./plugins/htmlToText";
import { remarkTimestamps } from "./plugins/timestamps";
import { RenderCodeblock } from "./plugins/Codeblock";
import { injectEmojiSize } from "./plugins/emoji";
import { RenderAnchor } from "./plugins/anchors";

import { handlers } from "./hast";
import { sanitise } from "./sanitise";
import { styled } from "solid-styled-components";
import { remarkRevoltEmoji } from "./plugins/revoltEmoji";

const Null = () => null;

/**
 * Custom Markdown components
 */
const components = {
  uemoji: RenderUnicodeEmoji,
  cemoji: RenderCustomEmoji,
  mention: RenderMention,
  spoiler: RenderSpoiler,
  a: RenderAnchor,
  p: styled.p<{ ["emoji-size"]?: "medium" | "large" }>`
    word-break: break-all;
    margin: 0;
    > code {
      padding: 1px 4px;
      flex-shrink: 0;
    }
    ${(props) => (props["emoji-size"] ? `--emoji-size:3em;` : "")}
  `,
  h1: styled.h1`
    margin: 0.2em 0;
  `,
  h2: styled.h2`
    margin: 0.2em 0;
  `,
  h3: styled.h3`
    margin: 0.2em 0;
  `,
  h4: styled.h4`
    margin: 0.2em 0;
  `,
  h5: styled.h5`
    margin: 0.2em 0;
  `,
  h6: styled.h6`
    margin: 0.2em 0;
  `,
  pre: RenderCodeblock,
  code: styled.code`
    background: inherit;
    font-size: 90%;
    font-family: var(--monospace-font), monospace;
    border-radius: 3px;
    box-decoration-break: clone;
  `,
  table: styled.table`
    border-collapse: collapse;
    th,
    td {
      padding: 6px;
      border: 1px solid #aaa;
    }
  `,
  ul: styled.ul`
    list-style-position: outside;
    padding-left: 1.5em;
    margin: 0.2em 0;
  `,
  ol: styled.ol`
    list-style-position: outside;
    padding-left: 1.5em;
    margin: 0.2em 0;
  `,
  blockquote: styled.blockquote`
    margin: 2px 0;
    padding: 2px 0;
    border-radius: 6px;
    background: #444;
    border-inline-start: 4px solid #ccc;
    > * {
      margin: 0 8px;
    }
  `,
  // Block image elements
  img: Null,
  // Catch literally everything else just in case
  video: Null,
  figure: Null,
  picture: Null,
  source: Null,
  audio: Null,
  script: Null,
  style: Null,
};

/**
 * Unified Markdown renderer
 */
const pipeline = unified()
  .use(remarkParse)
  .use(remarkBreaks)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkSpoiler)
  .use(remarkTimestamps)
  .use(remarkMention)
  .use(remarkUnicodeEmoji)
  .use(remarkRevoltEmoji)
  .use(remarkCustomEmoji)
  .use(remarkHtmlToText)
  .use(remarkRehype, {
    handlers,
  })
  .use(rehypeKatex, {
    maxSize: 10,
    maxExpand: 0,
    trust: false,
    strict: false,
    output: "html",
    throwOnError: false,
    errorColor: "var(--error)",
  })
  .use(rehypePrism);

export interface MarkdownProps {
  content: string;
  disallowBigEmoji?: boolean;
}

export { TextWithEmoji } from "./plugins/emoji";

/**
 * Remark renderer component
 */
export function Markdown(props: MarkdownProps) {
  const file = new VFile();
  file.value = sanitise(props.content);

  const hastNode = pipeline.runSync(pipeline.parse(file), file);

  injectEmojiSize(props, hastNode as any);

  return childrenToSolid(
    {
      options: {
        ...defaults,
        components,
      },
      schema: html,
      listDepth: 0,
    },
    hastNode
  );
}
