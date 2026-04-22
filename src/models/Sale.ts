import { Schema, model, models, type InferSchemaType } from "mongoose";

const saleItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new Schema(
  {
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
        message: "يجب أن تحتوي الفاتورة على صنف واحد على الأقل",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export type SaleDocument = InferSchemaType<typeof saleSchema> & {
  _id: string;
};

const Sale = models.Sale || model("Sale", saleSchema);

export default Sale;
