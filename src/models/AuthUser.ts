import { Schema, model, models, type InferSchemaType } from "mongoose";

const authUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    singletonKey: {
      type: String,
      default: "primary",
      unique: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

export type AuthUserDocument = InferSchemaType<typeof authUserSchema> & {
  _id: string;
};

const AuthUser = models.AuthUser || model("AuthUser", authUserSchema);

export default AuthUser;
