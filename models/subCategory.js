import mongoose from "mongoose";

const schema = new mongoose.Schema({
    subCategory: {
        type: String,
        required: [true, "Please enter sub-category"]
    }
});

export const SubCategory = mongoose.model("SubCategory", schema);
