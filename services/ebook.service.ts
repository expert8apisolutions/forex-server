import { Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ebookModel from "../models/ebook.model";

// create course
export const createEbook = CatchAsyncError(async(data:any,res:Response)=>{
    const ebook = await ebookModel.create(data);
    res.status(201).json({
        success:true,
        ebook
    });
})
