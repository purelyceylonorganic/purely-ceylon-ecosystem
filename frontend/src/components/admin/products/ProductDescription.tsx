import DOMPurify from "dompurify";
import "./ProductDescription.css";
interface Props {
  description?: string | null;
}

export default function ProductDescription({
  description,
}: Props) {
  if (!description?.trim()) {
    return (
      <section className="pco-product-description">
        <h2>Product Description</h2>
        <p>Product information will be available soon.</p>
      </section>
    );
  }

  const safeHtml = DOMPurify.sanitize(description, {
    USE_PROFILES: { html: true },
  });

  return (
    <section className="pco-product-description">
      <div
        className="pco-product-description__content"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </section>
  );
}
