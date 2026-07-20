import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {

  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP files are allowed."
      )
    );
  }

};

export const uploadProductImage = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 5 * 1024 * 1024

  }

});