import multer from "multer";

const storage = multer.memoryStorage();

export const singleFileUpload = multer({
  storage: storage,
}).single("file");
