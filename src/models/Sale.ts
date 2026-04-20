import { Schema, model, models, type InferSchemaType } from "mongoose";

const saleSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: 1,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasePriceAtSale: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
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
