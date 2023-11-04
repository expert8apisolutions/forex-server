import mongoose, {Document,Model,Schema} from "mongoose";


export interface IOrderEbook extends Document{
    ebookId: string;
    userId?:string;
    payment_info: object;
}

const orderSchema = new Schema<IOrderEbook>({
    ebookId: {
     type: String,
     required: true
    },
    userId:{
        type: String,
        required: true
    },
    payment_info:{
        type: Object,
        // required: true
    },
},{timestamps: true});

const OrderEbookModel: Model<IOrderEbook> = mongoose.model('order_ebook',orderSchema);

export default OrderEbookModel;