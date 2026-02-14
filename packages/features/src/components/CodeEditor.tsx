"use client";

import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import { cn } from "@sous/ui";

const prismStyles = `
  .prism-editor textarea {
    outline: none !important;
  }
  
  .prism-editor {
    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    font-size: 13px !important;
  }
  
  .dark .token.comment,
  .dark .token.prolog,
  .dark .token.doctype,
  .dark .token.cdata { color: #636f72; }
  .dark .token.punctuation { color: #a0a0a0; }
  .dark .token.property,
  .dark .token.tag,
  .dark .token.boolean,
  .dark .token.number,
  .dark .token.constant,
  .dark .token.symbol,
  .dark .token.deleted { color: #0ea5e9; }
  .dark .token.selector,
  .dark .token.attr-name,
  .dark .token.string,
  .dark .token.char,
  .dark .token.builtin,
  .dark .token.inserted { color: #10b981; }
  .dark .token.operator,
  .dark .token.entity,
  .dark .token.url,
  .dark .language-css .token.string,
  .dark .style .token.string { color: #f59e0b; }
  .dark .token.atrule,
  .dark .token.attr-value,
  .dark .token.keyword { color: #8b5cf6; }
  .dark .token.function,
  .dark .token.class-name { color: #ec4899; }
  .dark .token.regex,
  .dark .token.important,
  .dark .token.variable { color: #f59e0b; }

  /* Light Mode Defaults */
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata { color: #999; }
  .token.punctuation { color: #999; }
  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted { color: #0284c7; }
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted { color: #059669; }
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string { color: #d97706; }
  .token.atrule,
  .token.attr-value,
  .token.keyword { color: #7c3aed; }
  .token.function,
  .token.class-name { color: #db2777; }
  .token.regex,
  .token.important,
  .token.variable { color: #d97706; }
`;

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: "json" | "css";
  placeholder?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative group border border-border rounded-xl bg-background overflow-hidden flex flex-col",
        className,
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: prismStyles }} />
      <div className="flex-1 overflow-auto min-h-0">
        <Editor
          value={value || ""}
          onValueChange={onChange}
          highlight={(code) =>
            highlight(code || "", languages[language], language)
          }
          padding={24}
          placeholder={placeholder}
          className="prism-editor min-h-full outline-none text-foreground"
          style={{
            minHeight: "100%",
          }}
        />
      </div>
    </div>
  );
};
