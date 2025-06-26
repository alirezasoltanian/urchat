"use client";

import CopyButton from "./CopyButton";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const language = className?.match(/language-(\w+)/)?.[1] || "plaintext";
  const code = typeof children === "string" ? children.trim() : "";
  if (!inline) {
    return (
      // <div className="not-prose flex flex-col my-2 w-[90%]">
      <pre
        className={`  dark:bg-zinc-900 p-4 pt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
      >
        <p className={`text-xs  py-2  `}>{language}</p>
        <div className="sticky top-5">
          <div className="absolute end-0 bottom-0 flex h-9 items-center pe-1">
            <CopyButton text={typeof children === "string" ? children : ""} />
          </div>
        </div>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            padding: "0",
            fontSize: "0.875rem",
            background: "inherit",
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre-wrap",
              wordBreak: "normal",
              overflowWrap: "break-word",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </pre>
      // </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
