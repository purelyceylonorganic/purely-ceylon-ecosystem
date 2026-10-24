
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

export default function ProductDescriptionEditor({
  value,
  onChange,
  disabled = false,
}: ProductDescriptionEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "<p>Enter product description...</p>",
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
      editor.commands.setContent(value || "<p></p>", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return <p>Loading description editor...</p>;
  }

  const insertImage = () => {
    if (disabled) return;

    const inputUrl = window.prompt("Enter product image URL:");

    if (!inputUrl?.trim()) return;

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(inputUrl.trim());

      if (
        parsedUrl.protocol !== "https:" &&
        parsedUrl.protocol !== "http:"
      ) {
        window.alert("Please enter a valid HTTP or HTTPS image URL.");
        return;
      }
    } catch {
      window.alert("Please enter a valid image URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: parsedUrl.href,
        alt: "Product image",
      })
      .run();
  };

  const toolbarButton = (
    label: string,
    active: boolean,
    action: () => void
  ) => (
    <button
      key={label}
      type="button"
      disabled={disabled}
      onClick={action}
      aria-pressed={active}
      className={`rounded-md border px-3 py-2 text-sm ${
        active
          ? "border-[#0E4B32] bg-[#0E4B32] text-white"
          : "border-gray-300 bg-white text-gray-800"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-t-lg border border-gray-300 bg-[#FFF8EE] p-3">
        {toolbarButton("Bold", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run()
        )}

        {toolbarButton("Italic", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run()
        )}

        {toolbarButton(
          "H2",
          editor.isActive("heading", { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run()
        )}

        {toolbarButton(
          "H3",
          editor.isActive("heading", { level: 3 }),
          () => editor.chain().focus().toggleHeading({ level: 3 }).run()
        )}

        {toolbarButton("• Bullets", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run()
        )}

        {toolbarButton(
          "1. Numbered",
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run()
        )}

        {toolbarButton("Quote", editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run()
        )}

        {toolbarButton("Undo", false, () =>
          editor.chain().focus().undo().run()
        )}

        {toolbarButton("Redo", false, () =>
          editor.chain().focus().redo().run()
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={insertImage}
          className="rounded-md border border-[#0E4B32] bg-white px-3 py-2 text-sm text-[#0E4B32] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Insert Image
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
        >
          Clear formatting
        </button>

        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          className="rounded-md border border-[#D4AF37] px-3 py-2 text-sm font-semibold"
        >
          {showPreview ? "Edit description" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="rounded-b-lg border border-gray-300 bg-white p-5">
          <div className="mb-4 border-b-2 border-[#D4AF37] pb-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#0E4B32]">
              Purely Ceylon
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Product Description
            </h3>
          </div>

          <div className="product-description-content">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <div className="rounded-b-lg border border-gray-300 bg-white p-4">
          <EditorContent editor={editor} />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Use accurate product facts only. Save the description after editing.
      </p>
    </section>
  );
}
