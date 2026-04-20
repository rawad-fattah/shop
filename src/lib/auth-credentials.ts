import { connectToDatabase } from "@/lib/mongodb";
import AuthUser from "@/models/AuthUser";

import type { AuthCredentials } from "@/lib/auth";

async function getMongoCredentials(): Promise<AuthCredentials | null> {
  await connectToDatabase();

  const user = await AuthUser.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .select("username passwordHash")
    .lean();

  if (!user?.username || !user?.passwordHash) {
    return null;
  }

  return {
    username: user.username,
    passwordHash: user.passwordHash,
  };
}

export async function getConfiguredCredentials() {
  return getMongoCredentials();
}
