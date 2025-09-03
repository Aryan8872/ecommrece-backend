import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  category: { type: String },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String }, // /uploads/<filename>
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
