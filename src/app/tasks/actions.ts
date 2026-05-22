"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { tasks } from "@/lib/db/schema";
import { withClerkSupabaseRls } from "@/lib/db/rls";

export async function createTask(formData: FormData) {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const title = formData.get("title");

  if (typeof title !== "string" || !title.trim()) {
    return;
  }

  await withClerkSupabaseRls(getToken, async (db) => {
    await db.insert(tasks).values({
      title: title.trim(),
      userId,
    });
  });

  revalidatePath("/tasks");
}
