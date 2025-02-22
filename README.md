# Email Agent Workshop

Build a personal AI Email Agent that automatically processes, labels, and drafts responses to incoming messages. You'll create the agent with Next.js, TypeScript, the Vercel AI SDK, and Neon Postgres.

By the end of the workshop, you'll have a fully working email assistant and gain practical experience building AI features you can include in future projects.

## Prerequisites

When it comes to assumptions & prerequisites, workshop attendees should have:

- Knowledge of git, building APIs, and writing server-side code with JavaScript/TypeScript
- Familiarity with command-line tools and installing Node.js packages

The workshop focuses exclusively on backend development and AI integration, so no frontend experience is required

## Workshop Structure

The workshop combines two types of activities:

- Conceptual overview: Explanations of key ideas you'll need to understand.
- Hands-on exercises: Guided activities where you'll apply what you've learned, with helpful code snippets provided.

## Introduction

If you've used AI apps like ChatGPT, Claude, Le Chat, Google Gemini, or others, you'll notice that they all offer a similar user experience where you:

1. Initiate a conversation
2. Only do one task at a time

AI Agents are the next evolution of AI apps. Since they will allow you to delegate tasks to an AI and have them done in the background.

Some example use cases of AI Agents are:

- Coding
- Support
- Deep Research

There's also a lot of potential for personal AI agents. This workshop will show you how to build a personal AI Email Agent that automatically processes, labels, and summarizes incoming emails.

The goal of this workshop is to give you a solid foundation to build your own AI Agents. The concepts you'll learn can be applied to other AI Agent projects.

## How the email agent will work

The email agent will work as follows:

- [Google Apps Script](https://script.google.com) will check for new emails and forward them to an API endpoint
- Incoming emails will be processed using the Vercel AI SDK and the result will be stored in a database on Neon

<- Diagram of the email agent workflow ->

## Exercise: Set up your development environment

To follow along:

1. Switch to the "start" branch and click on the "Code" button to open the repository in GitHub Codespaces.
2. Rename the `.env.example` file to `.env` and set a random value for the `WEBHOOK_SECRET` variable.
3. Install the dependencies by running `npm install`
4. start the development server by running `npm run dev`

You should see the Next.js app running on [`http://localhost:3000`](http://localhost:3000).

### Project Overview

The project is a Next.js app that uses the Vercel AI SDK, Neon Postgres, and Drizzle ORM to build an AI workflow that processes incoming emails.

The `/src/app/page.tsx` file contains the main page component that displays the email data. The page fetches the email data from the database and renders it.

The webhook route handler implemented in `/src/app/api/webhooks/agent/route.ts` functions as the primary endpoint for email data processing.

## Conceptual Overview: What are webhooks?

Webhooks are a way for one application to send real-time data to another application. They are commonly used in APIs to notify other systems about events or updates.

- Stripe: When a payment is made, Stripe sends a webhook to your server to update the payment status.
- GitHub: When you push code to a repository, GitHub sends a webhook to your CI/CD system to trigger a build.

When you're developing locally, you can use a service like [smee.io](https://smee.io) to proxy your local webhooks to the internet. This allows you to receive webhooks from external services on your local machine.

## Exercise: Set up webhooks for testing

1. Go to [smee.io](https://smee.io)
1. Create a new channel
1. Update the `dev:webhook` script in your package.json with your URL
1. Run the following two commands:

- `npm run dev` to start the Next.js server
- `npm run dev:webhook` to start proxying localhost

## Conceptual Overview: Building an AI Workflow

The initial configuration establishes a strict schema definition that enforces the expected email data structure.

Upon receiving a request, the system extracts the X-Webhook-Secret header and performs a comparison against the environment-configured secret. Any requests failing this validation trigger an immediate 401 unauthorized response.

Next, the AI SDK will be used to generate an object that contains the label and summary. We then store the email data in the database using Drizzle ORM and return a 200 OK response.

## Exercise: Create an AI workflow with the AI SDK by Vercel

1. Go to platform.openai.com and generate an API Key

- New account -> generate an API key during onboarding
- Existing account -> Settings > API Keys > create new secret key

2. Go to the route handler in `/src/app/api/webhooks/agent/route.ts` and use the `generateObject` function to generate a structured output which will be stored in the database.

https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-object

<details>

<summary>Click to see the solution</summary>

```ts
// code above unchanged

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

// rest of the code
```

## Conceptual Overview: Google Apps Scripts

Google Apps Script is a cloud-based scripting language that allows you to automate tasks across Google products and third-party services. It's based on JavaScript and can be used to create custom functions, automate workflows, and interact with external APIs.

In this workshop, we'll use Google Apps Script to create a script that checks for new emails in your Gmail account and forwards them to a webhook endpoint. There will then be a trigger that runs the script at regular intervals to check for new emails and forward them.

## Exercise: Automated email forwarding using Google Apps Script

1. Go to script.google.com and create a new project
2. Copy the following snippet and update the `WEBHOOK_URL` and `WEBHOOK_SECRET` values. Make sure that they match the values you're using in your project.

```js
function processRecentEmails() {
  const secondsSinceEpoch = (date) => Math.floor(date.getTime() / 1000);

  const before = new Date(); // current time
  const after = new Date();
  after.setMinutes(before.getMinutes() - 2); // 2 minutes before current time

  const searchQuery = `after:${secondsSinceEpoch(after)} before:${secondsSinceEpoch(before)}`;

  const threads = GmailApp.search(searchQuery);

  // Return if no new emails
  if (threads.length === 0) {
    console.log("No new emails in the last 2 minutes");
    return;
  }

  // Your webhook configuration
  const WEBHOOK_URL = "<YOUR_WEBHOOK_URL>";
  const WEBHOOK_SECRET = "<YOUR_WEBHOOK_SECRET>";

  // Process each thread
  threads.forEach((thread) => {
    const messages = thread.getMessages();

    messages.forEach((message) => {
      // Create email payload
      const emailData = {
        id: message.getId(),
        subject: message.getSubject(),
        from: message.getFrom(),
        to: message.getTo(),
        date: message.getDate(),
        body: message.getPlainBody(),
        attachments: message.getAttachments().map((attachment) => ({
          name: attachment.getName(),
          type: attachment.getContentType(),
          size: attachment.getSize(),
        })),
      };

      // Prepare webhook request
      const options = {
        method: "POST",
        contentType: "application/json",
        headers: {
          "X-Webhook-Secret": `${WEBHOOK_SECRET}`,
        },
        payload: JSON.stringify(emailData),
        muteHttpExceptions: true,
      };

      try {
        // Send to webhook
        const response = UrlFetchApp.fetch(WEBHOOK_URL, options);

        if (response.getResponseCode() === 200) {
          console.log(`Successfully forwarded email: ${message.getSubject()}`);
        } else {
          console.error(
            `Failed to forward email: ${message.getSubject()}. Status: ${response.getResponseCode()}`,
          );
        }
      } catch (error) {
        console.error(
          `Error forwarding email: ${message.getSubject()}. Error: ${error.toString()}`,
        );
      }
    });
  });
}
```

3. Deployment

- Click Deploy > New Deployment
- Select the deployment type to be `Web app`
- Click Deploy
- Click `Authorize access`, You'll see a warning saying the app isn't verified, so choose the "advanced" option and click Go to <your project name> (unsafe) and then Allow.

4. Create a trigger

- Go back to the Google apps script console and choose "Triggers" from the sidebar
- Click “Add Trigger”
- Choose the `processRecentEmails` function
- Select type of time based trigger to be “Minutes Timer” and have it run every minute


and that's it! Your Google Apps Script is now set up to forward emails to your webhook endpoint.
