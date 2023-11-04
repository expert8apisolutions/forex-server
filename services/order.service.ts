import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.Model";
import OrderEbookModel from "../models/orderEbook.model";


// create new order
export const newOrder = CatchAsyncError(async(data:any,res:Response) => {
    const order = await OrderModel.create(data);

    res.status(201).json({
        succcess:true,
        order,
    })

});

export const newOrderEbook = CatchAsyncError(async(data:any,res:Response) => {
    const order = await OrderEbookModel.create(data);

    res.status(201).json({
        succcess:true,
        order,
    })

});

// Get All Orders
export const getAllOrdersService = async (res: Response) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      orders,
    });
  };
  