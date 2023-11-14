import express from "express";
import {
  addAnwser,
  addCourseToUser,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAdminAllCourses,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { createBlog, deleteBlog, editBlog, getAllBlog, getBlogContent, getBlogContentById, getBlogMeta } from "../controllers/blog.controller";
const blogRouter = express.Router();

blogRouter.post(
  "/create-blog",
  isAutheticated,
  authorizeRoles("admin"),
  createBlog
);

blogRouter.put(
  "/edit-blog/:id",
  isAutheticated,
  authorizeRoles("admin"),
  editBlog
);

blogRouter.get("/get-blog/:slug", getBlogContent); 
blogRouter.get("/get-blog-byid/:id", getBlogContentById); 
blogRouter.get("/get-blog-meta/:slug", getBlogMeta); 
blogRouter.get("/get-all-blog", getAllBlog); 

blogRouter.delete(
  "/delete-blog/:id",
  isAutheticated,
  authorizeRoles("admin"),
  deleteBlog
);

export default blogRouter;
