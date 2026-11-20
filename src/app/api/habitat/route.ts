import { habitatClient } from "@/lib/api/habitatClient";
import { withSession } from "@/lib/api/withSession";
import { NextResponse } from "next/server";

export const GET = withSession("fetching habitats", async ({ token }) => {
  // Call NestJS habitat endpoint with the user's token
  const habitats = await habitatClient.list(token);
  return NextResponse.json(habitats);
});
