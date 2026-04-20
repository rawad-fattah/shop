import { Schema, model, models, type InferSchemaType } from "mongoose";

const categories = ["Dresses", "Bags", "Perfumes"] as const;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: categories,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: string;
};

const Product = models.Product || model("Product", productSchema);

export { categories };
export default Product;
