import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel, { IComment, ICourse } from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import axios from "axios";
import userModel from "../models/user.model";
import { newOrder, newOrderEbook } from "../services/order.service";
import ebookModel, { IEbook } from "../models/ebook.model";
import { createEbook } from "../services/ebook.service";


export const addEbookToUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { user_id, ebook_id } = req.body

      const user = await userModel.findById(user_id);

      const ebookExistInUser = user?.ebooks.some(
        (ebook: any) => ebook._id.toString() === ebook_id
      );

      if (ebookExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this Ebook", 400)
        );
      }

      const ebook: IEbook | null = await ebookModel.findById(ebook_id);

      if (!ebook) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
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

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.ebooks.push(ebook?._id);

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${ebook?.name}`,
      });


      await ebookModel.findOneAndUpdate({ _id: ebook?._id }, { purchased: ebook.purchased + 1 })

      newOrderEbook(data, res, next);

    } catch (error: any) {
      console.log("🚀 ~ file: ebook.controller.ts:100 ~ error:", error)
      return next(new ErrorHandler(error.message, 500));
    }
  }
)


// upload course
export const uploadEbook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const data = req.body;
      const filePdf = data.filePdf;
      if (filePdf) {
        const myCloud = await cloudinary.v2.uploader.upload(filePdf, {
          folder: "ebooks",
          resource_type: 'raw'
        });

        data.linkDownload = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        data.totalSizeMB = data.filePdfSize
      }

      const fileImg = data.fileImg;
      if (fileImg) {
        const myCloud = await cloudinary.v2.uploader.upload(fileImg, {
          folder: "ebooks",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }


      createEbook(data, res, next);
    } catch (error: any) {
      console.log("🚀 ~ file: ebook.controller.ts:120 ~ error:", error)
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// // edit course

// edit course
export const editEbook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const ebookId = req.params.id;

      const ebookData = await ebookModel.findById(ebookId) as any;

      const filePdf = data.filePdf;
      if (filePdf) {

        await cloudinary.v2.uploader.destroy(ebookData.linkDownload.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(filePdf, {
          folder: "ebooks",
          resource_type: 'raw'
        });

        data.linkDownload = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        data.totalSizeMB = data.filePdfSize
      } else {
        data.linkDownload = {
          public_id: ebookData.linkDownload.public_id,
          url: ebookData.linkDownload.secure_url,
        }
      }

      const fileImg = data.fileImg;
      if (fileImg) {

        await cloudinary.v2.uploader.destroy(ebookData.thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(fileImg, {
          folder: "ebooks",
        });

        console.log("🚀 ~ file: ebook.controller.ts:187 ~ myCloud:", myCloud)

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

      } else {
        data.thumbnail = {
          public_id: ebookData.thumbnail.public_id,
          url: ebookData.thumbnail.secure_url,
        };
      }

      console.log("🚀 ~ file: ebook.controller.ts:198 ~ data:", data)

      const ebook = await ebookModel.findByIdAndUpdate(
        ebookId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        ebook,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// // get single course --- without purchasing
export const downloadEbook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const ebookList = req.user?.ebooks;
      const ebookId = req.params.id;


      const ebookExists = ebookList?.find(
        (ebook: any) => ebook._id.toString() === ebookId
      );

      if (!ebookExists) {
        return next(
          new ErrorHandler("You are not eligible to access this book", 404)
        );
      }




      const isCacheExist: any = await redis.get(ebookId);

      if (false) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const ebook = await ebookModel.findById(ebookId) as any
        console.log("🚀 ~ file: ebook.controller.ts:206 ~ ebook:", ebook)

        if (ebook) {

          const response = await axios({
            method: "get",
            url: ebook.linkDownload.url,
            responseType: "stream", // This is important for handling binary data (e.g., PDF)
          });

          // Set the appropriate headers for a PDF response
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="example-file.pdf"');

          // Pipe the response directly to the client
          response.data.pipe(res);
        } else {
          throw new Error('not found ebook')
        }
        console.log("🚀 ~ file: ebook.controller.ts:206 ~ ebook:", ebook)

        // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days

      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// // get single course --- without purchasing
export const getSingleEbook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {


      const ebookId = req.params.id;

      const isCacheExist: any = await redis.get(ebookId);

      if (false) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const ebook = await ebookModel.findById(ebookId).select('-linkDownload')

        // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days

        res.status(200).json({
          success: true,
          ebook,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


// // get single course --- without purchasing
export const getSingleEbookAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {


      const ebookId = req.params.id;

      const isCacheExist: any = await redis.get(ebookId);

      if (false) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const ebook = await ebookModel.findById(ebookId)

        // await redis.set(ebookId, JSON.stringify(course), "EX", 604800); // 7days

        res.status(200).json({
          success: true,
          ebook,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// // get all courses --- without purchasing
export const getAllBoook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ebooks = await ebookModel.find().select('-linkDownload')
      res.status(200).json({
        success: true,
        ebooks,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

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
export const deleteEbook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const ebook = await ebookModel.findById(id);

      if (!ebook) {
        return next(new ErrorHandler("Ebook not found", 404));
      }

      await ebook.deleteOne({ id });

      // await redis.del(id);

      res.status(200).json({
        success: true,
        message: "ebook deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
