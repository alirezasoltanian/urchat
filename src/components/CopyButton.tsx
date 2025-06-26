"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
  text: string;
  className?: string;
}

function CopyButton({ text, ...props }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    console.log(text);

    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };
  return (
    <button {...props} onClick={onCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

export default CopyButton;
