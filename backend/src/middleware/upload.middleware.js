import multer from "multer";
import path from "path";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".svg",
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  // 1. Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new ApiError(
        415,
        `Unsupported media type '${file.mimetype}'. Allowed: JPEG, PNG, WebP, SVG.`,
        "UNSUPPORTED_MEDIA_TYPE"
      ),
      false
    );
  }

  // 2. Check File Extension
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new ApiError(
        400,
        `Invalid file extension '${ext}'. Allowed: .jpg, .jpeg, .png, .webp, .svg`,
        "INVALID_FILE_EXTENSION"
      ),
      false
    );
  }

  // 3. Prevent path traversal in originalname
  if (file.originalname.includes("..") || file.originalname.includes("/") || file.originalname.includes("\\")) {
    return cb(
      new ApiError(400, "Malformed filename with unsafe path characters.", "MALFORMED_FILENAME"),
      false
    );
  }

  cb(null, true);
}

const multerUpload = multer({
  storage,
  limits: {
    fileSize: env.MEDIA_MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Express middleware wrapper to catch Multer errors gracefully
 */
export function handleMediaUpload(req, res, next) {
  const uploadSingle = multerUpload.single("file");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          const maxMb = Math.round(env.MEDIA_MAX_FILE_SIZE / (1024 * 1024));
          return next(
            new ApiError(
              413,
              `File is too large. Maximum allowed size is ${maxMb}MB.`,
              "FILE_TOO_LARGE"
            )
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`, "UPLOAD_ERROR"));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new ApiError(400, "No file uploaded. Please provide a file under field 'file'.", "MISSING_FILE"));
    }

    // SVG Security check
    if (req.file.mimetype === "image/svg+xml") {
      const svgContent = req.file.buffer.toString("utf-8").toLowerCase();
      if (
        svgContent.includes("<script") ||
        svgContent.includes("javascript:") ||
        svgContent.includes("onload=") ||
        svgContent.includes("onerror=")
      ) {
        return next(
          new ApiError(400, "Unsafe SVG content detected. Embedded scripts are prohibited.", "UNSAFE_SVG_CONTENT")
        );
      }
    }

    next();
  });
}
