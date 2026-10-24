
import sanitizeHtml from "sanitize-html";

export function sanitizeProductDescription(
  description: unknown
): string | null {
  if (description === null || description === undefined) {
    return null;
  }

  if (typeof description !== "string") {
    throw new Error("Product description must be text.");
  }

  if (description.length > 30000) {
    throw new Error("Product description is too long.");
  }

  return sanitizeHtml(description, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "strong",
      "b",
      "em",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: {
      img: ["https"],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}
