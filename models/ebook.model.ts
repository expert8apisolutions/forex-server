import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

// "_id": "6529609a9a33d7255eb4824a",
// "thumbnail": {
//   "public_id": "courses/eta6o7otuh54o8qfc5ie",
//   "url": "https://res.cloudinary.com/doqbge8fv/image/upload/v1697210521/courses/eta6o7otuh54o8qfc5ie.png"
// },
// "name": "เทคนิคเทรดข่าว forex ครบทุกประเภท",
// "description": "เจ้าเห็ดน้อย คือผลงานจากนักเขียนที่ได้รับรางวัลจากสมาคมวรรณกรรมไซไฟจีน (Silver Award of 2021 Chinese Science Fiction Nebula Awards) เรื่องราวของเจ้าเห็ดน้อยนี้จะพาทุกคนอึ้งและลุ้นไปพร้อมกับสิ่งมหัศจรรย์มากมาย พร้อมเสิร์ฟความแฟนตาซีล้ำยุคถึงมือคุณแล้ววันนี้ “อย่าไปเลย…เจ้าเห็ดน้อย” คำเว้าวอนของอานเจ๋อ มนุษย์เพียงคนเดียวที่เจ้าเห็ดน้อย ‘อันเจ๋อ’ รู้จัก ดังขึ้นก่อนที่อีกฝ่ายจะจากโลกนี้ไปอย่างสงบ",
// "price": 10,
// "totalPage": 10,
// "totalSizeMB": 227,
// "fileType": 'PDF',
// "estimatedPrice": 15900,

 export interface IEbook extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  linkDownload: object;
  totalPage?: number;
  totalSizeMB: number;
  fileType: string;
  purchased: number;
  filename: string;
}


const EbookSchema = new Schema<IEbook>({
  name: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  totalPage: {
    type: Number,
  },
  fileType: {
    type: String,
  },
  totalSizeMB: {
    type: Number,
  },
  thumbnail: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  linkDownload: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  purchased:{
    type: Number,
    default: 0,
   },
},{timestamps: true});


const ebookModel: Model<IEbook> = mongoose.model("Ebook", EbookSchema);

export default ebookModel;
