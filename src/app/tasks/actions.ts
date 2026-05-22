"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { createClerkSupabaseServerClient } from "@/lib/supabase";

export async function createTask(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const title = formData.get("title");

  if (typeof title !== "string" || !title.trim()) {
    return;
  }

  const supabase = await createClerkSupabaseServerClient();
  const { error } = await supabase.from("tasks").insert({
    title: title.trim(),
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}
