import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "~/lib/db";
import { messages } from "~/lib/db/schema";

const emailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  from: z.string(),
  to: z.string(),
  date: z.string(),
  body: z.string(),
  attachments: z.array(
    z.object({ name: z.string(), type: z.string(), size: z.number() }),
  ),
});

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("X-Webhook-Secret");

    if (!secret) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 },
      );
    }

    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validatedData = emailSchema.parse(body);

    const result = await generateObject({
      model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
      schemaName: "email",
      schemaDescription: "An email summary.",
      schema: z.object({ summary: z.string(), labels: z.array(z.string()) }),
      prompt: `Generate a summary and labels for the following email: ${JSON.stringify(
        validatedData,
      )}. The summary should be a 1-2 sentences and only generate 1-2 labels that are relevant to the email.`,
    });

    await db
      .insert(messages)
      .values({
        id: validatedData.id,
        subject: validatedData.subject,
        from: validatedData.from,
        to: validatedData.to,
        body: validatedData.body,
        attachments: JSON.stringify(validatedData.attachments),
        summary: result.object.summary,
        labels: result.object.labels,
        date: validatedData.date,
      })
      .onConflictDoNothing({ target: messages.id });

    return NextResponse.json({
      status: "success",
      data: {
        email: validatedData,
        summary: result.object.summary,
        labels: result.object.labels,
      },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
