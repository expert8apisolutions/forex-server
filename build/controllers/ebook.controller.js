"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEbook = exports.getAllBoook = exports.getSingleEbookAdmin = exports.getSingleEbook = exports.downloadEbook = exports.editEbook = exports.uploadEbook = exports.addEbookToUser = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const redis_1 = require("../utils/redis");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_Model_1 = __importDefault(require("../models/notification.Model"));
const axios_1 = __importDefault(require("axios"));
const user_model_1 = __importDefault(require("../models/user.model"));
const order_service_1 = require("../services/order.service");
const ebook_model_1 = __importDefault(require("../models/ebook.model"));
const ebook_service_1 = require("../services/ebook.service");
exports.addEbookToUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { user_id, ebook_id } = req.body;
        const user = await user_model_1.default.findById(user_id);
        const ebookExistInUser = user?.ebooks.some((ebook) => ebook._id.toString() === ebook_id);
        if (ebookExistInUser) {
            return next(new ErrorHandler_1.default("You have already purchased this Ebook", 400));
        }
        const ebook = await ebook_model_1.default.findById(ebook_id);
        if (!ebook) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const data = {
            ebookId: ebook._id,
            userId: user?._id,
            payment_info: {},
        };
        const mailData = {
            order: {
                _id: ebook._id.toString().slice(0, 6),
                name: ebook.name,
                price: ebook.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        user?.ebooks.push(ebook?._id);
        await user?.save();
        await notification_Model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${ebook?.name}`,
        });
        await ebook_model_1.default.findOneAndUpdate({ _id: ebook?._id }, { purchased: ebook.purchased + 1 });
        (0, order_service_1.newOrderEbook)(data, res, next);
    }
    catch (error) {
        console.log("🚀 ~ file: ebook.controller.ts:100 ~ error:", error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// upload course
exports.uploadEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const filePdf = data.filePdf;
        if (filePdf) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(filePdf, {
                folder: "ebooks",
                resource_type: 'raw'
            });
            data.linkDownload = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
            data.totalSizeMB = data.filePdfSize;
        }
        const fileImg = data.fileImg;
        if (fileImg) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(fileImg, {
                folder: "ebooks",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, ebook_service_1.createEbook)(data, res, next);
    }
    catch (error) {
        console.log("🚀 ~ file: ebook.controller.ts:120 ~ error:", error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // edit course
// edit course
exports.editEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const ebookId = req.params.id;
        const ebookData = await ebook_model_1.default.findById(ebookId);
        const filePdf = data.filePdf;
        if (filePdf) {
            await cloudinary_1.default.v2.uploader.destroy(ebookData.linkDownload.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(filePdf, {
                folder: "ebooks",
                resource_type: 'raw'
            });
            data.linkDownload = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
            data.totalSizeMB = data.filePdfSize;
        }
        else {
            data.linkDownload = {
                public_id: ebookData.linkDownload.public_id,
                url: ebookData.linkDownload.secure_url,
            };
        }
        const fileImg = data.fileImg;
        if (fileImg) {
            await cloudinary_1.default.v2.uploader.destroy(ebookData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(fileImg, {
                folder: "ebooks",
            });
            console.log("🚀 ~ file: ebook.controller.ts:187 ~ myCloud:", myCloud);
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        else {
            data.thumbnail = {
                public_id: ebookData.thumbnail.public_id,
                url: ebookData.thumbnail.secure_url,
            };
        }
        console.log("🚀 ~ file: ebook.controller.ts:198 ~ data:", data);
        const ebook = await ebook_model_1.default.findByIdAndUpdate(ebookId, {
            $set: data,
        }, { new: true });
        res.status(201).json({
            success: true,
            ebook,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // get single course --- without purchasing
exports.downloadEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const ebookList = req.user?.ebooks;
        const ebookId = req.params.id;
        const ebookExists = ebookList?.find((ebook) => ebook._id.toString() === ebookId);
        if (!ebookExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this book", 404));
        }
        const isCacheExist = await redis_1.redis.get(ebookId);
        if (false) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const ebook = await ebook_model_1.default.findById(ebookId);
            console.log("🚀 ~ file: ebook.controller.ts:206 ~ ebook:", ebook);
            if (ebook) {
                const response = await (0, axios_1.default)({
                    method: "get",
                    url: ebook.linkDownload.url,
                    responseType: "stream", // This is important for handling binary data (e.g., PDF)
                });
                // Set the appropriate headers for a PDF response
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", 'inline; filename="example-file.pdf"');
                // Pipe the response directly to the client
                response.data.pipe(res);
            }
            else {
                throw new Error('not found ebook');
            }
            console.log("🚀 ~ file: ebook.controller.ts:206 ~ ebook:", ebook);
            // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // get single course --- without purchasing
exports.getSingleEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const ebookId = req.params.id;
        const isCacheExist = await redis_1.redis.get(ebookId);
        if (false) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const ebook = await ebook_model_1.default.findById(ebookId).select('-linkDownload');
            // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days
            res.status(200).json({
                success: true,
                ebook,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // get single course --- without purchasing
exports.getSingleEbookAdmin = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const ebookId = req.params.id;
        const isCacheExist = await redis_1.redis.get(ebookId);
        if (false) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const ebook = await ebook_model_1.default.findById(ebookId);
            // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days
            res.status(200).json({
                success: true,
                ebook,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // get all courses --- without purchasing
exports.getAllBoook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const ebooks = await ebook_model_1.default.find().select('-linkDownload');
        res.status(200).json({
            success: true,
            ebooks,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// // get course content -- only for valid user
// export const getCourseByUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userCourseList = req.user?.courses;
//       const courseId = req.params.id;
//       const courseExists = userCourseList?.find(
//         (course: any) => course._id.toString() === courseId
//       );
//       if (!courseExists) {
//         return next(
//           new ErrorHandler("You are not eligible to access this course", 404)
//         );
//       }
//       const course = await CourseModel.findById(courseId);
//       const content = course?.courseData;
//       res.status(200).json({
//         success: true,
//         content,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
// Delete Course --- only for admin
exports.deleteEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const ebook = await ebook_model_1.default.findById(id);
        if (!ebook) {
            return next(new ErrorHandler_1.default("Ebook not found", 404));
        }
        await ebook.deleteOne({ id });
        // await redis.del(id);
        res.status(200).json({
            success: true,
            message: "ebook deleted successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
