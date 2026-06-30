import { useState } from "react";

interface Image {
  id: string;
  url: string;
}

interface Props {
  images: Image[];
}

export default function ProductGallery({ images }: Props) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          width: 450,
          height: 450,
          background: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 15,
        }}
      >
        No Image
      </div>
    );
  }

  return (
    <div>
      <img
        src={images[selected].url}
        alt=""
        style={{
          width: 450,
          height: 450,
          objectFit: "cover",
          borderRadius: 15,
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 15,
        }}
      >
        {images.map((img, index) => (
          <img
            key={img.id}
            src={img.url}
            onClick={() => setSelected(index)}
            style={{
              width: 70,
              height: 70,
              cursor: "pointer",
              border:
                selected === index
                  ? "3px solid green"
                  : "1px solid #ddd",
            }}
          />
        ))}
      </div>
    </div>
  );
}