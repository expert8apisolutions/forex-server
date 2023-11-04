"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const ebook_controller_1 = require("../controllers/ebook.controller");
const ebookRouter = express_1.default.Router();
ebookRouter.post("/create-ebook", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), ebook_controller_1.uploadEbook);
ebookRouter.get("/get-ebooks", ebook_controller_1.getAllBoook);
ebookRouter.get("/get-ebook/:id", ebook_controller_1.getSingleEbook);
ebookRouter.get("/get-admin-ebook/:id", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), ebook_controller_1.getSingleEbookAdmin);
ebookRouter.get("/get-ebook/:id/download", auth_1.isAutheticated, ebook_controller_1.downloadEbook);
ebookRouter.post("/add-ebook-user", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), ebook_controller_1.addEbookToUser);
ebookRouter.put("/edit-ebook/:id", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), ebook_controller_1.editEbook);
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
ebookRouter.delete("/delete-ebook/:id", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), ebook_controller_1.deleteEbook);
exports.default = ebookRouter;
