"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/["']/g, "") ?? null,
            renderHTML: (attributes) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {}
          }
        }
      }
    ];
  }
});

const fontOptions = [
  { label: "Sans", value: "var(--font-sans)" },
  { label: "Display", value: "var(--font-display)" },
  { label: "Serif", value: "serif" }
];

const sizeOptions = ["12px", "14px", "16px", "18px", "20px", "24px"];

const toolbarButtonClass = (active: boolean) =>
  [
    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
    active ? "border-ink/60 text-ink" : "border-ink/10 text-ink/60 hover:border-ink/30"
  ].join(" ");

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const [selectionTick, setSelectionTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noreferrer",
          target: "_blank"
        }
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[160px] text-sm text-ink outline-none"
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(editor.isEmpty ? "" : html);
    },
    onSelectionUpdate: () => {
      setSelectionTick((prev) => prev + 1);
    }
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (value !== html) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  const currentFont = editor?.getAttributes("textStyle")?.fontFamily ?? "";
  const currentSize = editor?.getAttributes("textStyle")?.fontSize ?? "";

  const headingValue = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  }, [editor, selectionTick]);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-slate">
        Chargement de l'editeur...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-3 py-2">
        <select
          value={headingValue}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "h2") {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            } else if (value === "h3") {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
          }}
          className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
        >
          <option value="paragraph">Texte</option>
          <option value="h2">Titre H2</option>
          <option value="h3">Titre H3</option>
        </select>

        <select
          value={currentFont || ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(value).run();
            }
          }}
          className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
        >
          <option value="">Police</option>
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={currentSize || ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
            } else {
              editor.chain().focus().setMark("textStyle", { fontSize: value }).run();
            }
          }}
          className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70"
        >
          <option value="">Taille</option>
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive("bold"))}
        >
          Gras
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive("italic"))}
        >
          Italique
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(editor.isActive("underline"))}
        >
          Souligne
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
        >
          Puces
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive("orderedList"))}
        >
          Liste
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={toolbarButtonClass(editor.isActive({ textAlign: "left" }))}
        >
          Gauche
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={toolbarButtonClass(editor.isActive({ textAlign: "center" }))}
        >
          Centre
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={toolbarButtonClass(editor.isActive({ textAlign: "right" }))}
        >
          Droite
        </button>

        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes("link")?.href ?? "";
            const url = window.prompt("Lien", previousUrl);
            if (url === null) return;
            if (url.trim() === "") {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: url.trim() }).run();
          }}
          className={toolbarButtonClass(editor.isActive("link"))}
        >
          Lien
        </button>
      </div>

      <div className="px-4 py-3">
        <div onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} className="rich-editor" />
        </div>
      </div>
    </div>
  );
};
