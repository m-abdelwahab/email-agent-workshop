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

    /** EXERCISE: Build an AI workflow

    1. Go to [platform.openai.com](https://platform.openai.com) and generate an API Key

    - New account -> generate an API key during onboarding
    - Existing account -> Settings > API Keys > create new secret key

    2. Update the `.env` file with the API key. The AI SDK by Vercel uses the `OPENAI_API_KEY` environment variable to authenticate with OpenAI.

    ```bash
    # .env
    OPENAI_API_KEY=your-api-key
    ```

    3. Go to the API endpoint in `/app/routes/api/email-webhook.tsx` and use the `generateObject` function to generate a structured output. Use console.log to see the output.
    `generateObject` docs: https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-object

    4. Send a test email to your Postmark inbound address. You should see the output in your terminal.
     */

    const result = {}; // TODO: replace with the generateObject function. Pass the prompt and schema to the generateObject function

    console.log(result);

    /** EXERCISE: Insert the email into the database

    - Use Drizzle ORM to insert the email into the `messages` table
    - SQL Insert docs: https://orm.drizzle.team/docs/insert
    */

    return Response.json(
      {
        data: {
          email: validatedData,
          summary: null, // TODO: replace with the summary from the `result` object
          labels: null, // TODO: replace with the labels from the `result` object
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
