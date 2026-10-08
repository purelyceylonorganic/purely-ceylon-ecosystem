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
}: SEOConfig) {
  document.title = title;

  setMeta("description", description);
  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:image", image, "property");
  setMeta("og:url", url, "property");
  setMeta("og:site_name", SITE_NAME, "property");

  setMeta("twitter:card", "summary_large_image", "name");
  setMeta("twitter:title", title, "name");
  setMeta("twitter:description", description, "name");
  setMeta("twitter:image", image, "name");
}

function setMeta(
  key: string,
  content: string,
  attribute: "name" | "property" = "name"
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}