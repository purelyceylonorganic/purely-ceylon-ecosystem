
export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

const SITE_NAME = "Purely Ceylon Organic";
const DEFAULT_IMAGE = "/logo/pco-logo.png";

export function setSEO({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = window.location.href,
}: SEOConfig): void {
  document.title = title;

  setMeta("description", description);
  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:image", toAbsoluteUrl(image), "property");
  setMeta("og:url", url, "property");
  setMeta("og:site_name", SITE_NAME, "property");
  setMeta("og:type", "website", "property");

  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", toAbsoluteUrl(image));

  setCanonical(url);
}

function toAbsoluteUrl(path: string): string {
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

function setMeta(
  key: string,
  content: string,
  attribute: "name" | "property" = "name"
): void {
  const selector = `meta[${attribute}="${key}"]`;
  const elements = document.head.querySelectorAll<HTMLMetaElement>(
    selector
  );

  let element = elements[0];

  // Remove duplicate meta tags.
  elements.forEach((item, index) => {
    if (index > 0) item.remove();
  });

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(url: string): void {
  const elements = document.head.querySelectorAll<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  let element = elements[0];

  // Remove duplicate canonical tags.
  elements.forEach((item, index) => {
    if (index > 0) item.remove();
  });

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = url;
}
