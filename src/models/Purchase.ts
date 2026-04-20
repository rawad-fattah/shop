import { Schema, model, models, type InferSchemaType } from "mongoose";

const purchaseSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    costPerItem: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export type PurchaseDocument = InferSchemaType<typeof purchaseSchema> & {
  _id: string;
};

const Purchase = models.Purchase || model("Purchase", purchaseSchema);

export default Purchase;
