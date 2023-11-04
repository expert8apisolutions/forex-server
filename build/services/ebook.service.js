"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEbook = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ebook_model_1 = __importDefault(require("../models/ebook.model"));
// create course
exports.createEbook = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const ebook = await ebook_model_1.default.create(data);
    res.status(201).json({
        success: true,
        ebook
    });
});
