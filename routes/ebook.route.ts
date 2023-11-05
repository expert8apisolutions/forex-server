import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { addEbookToUser, deleteEbook, downloadEbook, editEbook, getAllBoook, getSingleEbook, getSingleEbookAdmin, uploadEbook } from "../controllers/ebook.controller";
const ebookRouter = express.Router();

ebookRouter.post(
  "/create-ebook",
  isAutheticated,
  authorizeRoles("admin"),
  uploadEbook
);

ebookRouter.get("/get-ebooks", getAllBoook);

ebookRouter.get("/get-ebook/:id", getSingleEbook);

ebookRouter.get("/get-admin-ebook/:id",  
isAutheticated,
authorizeRoles("admin"),
getSingleEbookAdmin);

ebookRouter.get("/get-ebook/:id/download", isAutheticated, downloadEbook);

ebookRouter.post("/add-ebook-user", isAutheticated, authorizeRoles("admin"), addEbookToUser);

ebookRouter.get("/get-ebook-owner", isAutheticated, );

ebookRouter.put(
  "/edit-ebook/:id",
  isAutheticated,
  authorizeRoles("admin"),
  editEbook
);


// courseRouter.get("/get-courses", getAllCourses);

// courseRouter.get(
//   "/get-admin-courses",
//   isAutheticated,
//   authorizeRoles("admin"),
//   getAdminAllCourses
// );

// courseRouter.get("/get-course-content/:id", isAutheticated, getCourseByUser);

// courseRouter.put("/add-question", isAutheticated, addQuestion);

// courseRouter.put("/add-answer", isAutheticated, addAnwser);

// courseRouter.put("/add-review/:id", isAutheticated, addReview);

// courseRouter.put(
//   "/add-reply",
//   isAutheticated,
//   authorizeRoles("admin"),
//   addReplyToReview
// );

// courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

ebookRouter.delete(
  "/delete-ebook/:id",
  isAutheticated,
  authorizeRoles("admin"),
  deleteEbook
);

export default ebookRouter;
