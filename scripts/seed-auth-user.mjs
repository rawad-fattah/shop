import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const username = (process.env.AUTH_SEED_USERNAME || "").trim().toLowerCase();
const password = process.env.AUTH_SEED_PASSWORD || "";

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

if (!username) {
  throw new Error("AUTH_SEED_USERNAME is required");
}

if (password.length < 8) {
  throw new Error("AUTH_SEED_PASSWORD must be at least 8 characters");
}

const authUserSchema = new mongoose.Schema(
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

const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", authUserSchema);

async function run() {
  await mongoose.connect(uri, { bufferCommands: false });

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AuthUser.findOne({}).sort({ createdAt: 1 });

  if (existing) {
    existing.username = username;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    existing.singletonKey = "primary";
    await existing.save();

    await AuthUser.deleteMany({ _id: { $ne: existing._id } });

    console.log("Updated existing auth user and removed extra users.");
  } else {
    await AuthUser.create({
      username,
      passwordHash,
      isActive: true,
      singletonKey: "primary",
    });

    console.log("Created auth user.");
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
