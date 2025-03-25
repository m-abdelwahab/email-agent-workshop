import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "~/lib/db";
import { messages } from "~/lib/db/schema";
import type { Route } from "./+types/email-webhook";

const emailSchema = z.object({
  MessageID: z.string(),
  Subject: z.string(),
  From: z.string(),
  To: z.string(),
  Date: z.string(),
  TextBody: z.string(),
  Attachments: z.array(
    z.object({
      ContentLength: z.number().optional(),
      Name: z.string().optional(),
      ContentType: z.string().optional(),
      ContentID: z.string().optional(),
      Content: z.string().optional(),
    }),
  ),
});

export async function action({ request }: Route.ActionArgs) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return Response.json(
        { error: "Missing signature header" },
        { status: 401 },
      );
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8",
    );
    const [username, password] = credentials.split(":");

    if (
      username !== process.env.WEBHOOK_USERNAME ||
      password !== process.env.WEBHOOK_PASSWORD
    ) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validatedData = emailSchema.parse(body);

    const prompt = `Generate a summary and labels for the following email: ${JSON.stringify(
      validatedData,
    )}. The summary should be a 1-2 sentences and only generate 1-2 labels that are relevant to the email.`;

    const schema = z.object({
      summary: z.string(),
      labels: z.array(z.string()),
    });

    const result = await generateObject({
      model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
      schema,
      prompt,
    });

    await db
      .insert(messages)
      .values({
        id: validatedData.MessageID,
        subject: validatedData.Subject,
        from: validatedData.From,
        to: validatedData.To,
        body: validatedData.TextBody,
        attachments: JSON.stringify(validatedData.Attachments),
        summary: result.object.summary,
        labels: result.object.labels,
        date: validatedData.Date,
      })
      .onConflictDoNothing({ target: messages.id });

    return Response.json(
      {
        data: {
          email: validatedData,
          summary: result.object.summary,
          labels: result.object.labels,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
