import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlog extends Document {
    title: string;
    description: string;
    slug: string;
    keyword: string;
    content: string;
    create_by: string;
    thumbnail: any;
}

const blogSchema = new Schema<IBlog>({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    keyword: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    create_by: {
        type: String,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
}, { timestamps: true });

const BlogModel: Model<IBlog> = mongoose.model('blog', blogSchema);

export default BlogModel;