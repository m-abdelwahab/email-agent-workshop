# Email Agent Workshop

## Introduction

If you've used AI apps like ChatGPT, Claude, Le Chat, Google Gemini, or others, you'll notice that they all offer a similar user experience where you:

1. Initiate a conversation
2. Only do one task at a time

AI Agents are the next evolution of AI apps. They are systems that independently accomplish tasks in the background on behalf of users.

Some example use cases of AI Agents are:

- Coding
- Support
- Deep Research

There's also a lot of potential for _personal_ AI agents. This workshop will show you how to build one that automatically labels and summarizes incoming messages. The goal of this workshop is to give you a solid foundation to build your own AI Agents. The concepts you'll learn can be applied to other AI Agent projects.

You'll create the app with React router, TypeScript, Postmark, the Vercel AI SDK, and Neon Postgres. By the end of the workshop, you'll have a fully working email assistant and gain practical experience building AI features you can include in future projects.

## Prerequisites

When it comes to assumptions & prerequisites, workshop attendees should have:

- Knowledge of git, building APIs, and writing server-side code with JavaScript/TypeScript
- Familiarity with command-line tools and installing Node.js packages

The workshop focuses exclusively on backend development and AI integration, so no frontend experience is required

## Workshop Structure

The workshop combines two types of activities:

- Conceptual overview: Explanations of key ideas you'll need to understand.
- Hands-on exercises: Guided activities where you'll apply what you've learned, with helpful code snippets provided.

## How the email agent will work

The email agent will work as follows:

1. Postmark can automatically parse inbound messages and post the full details to a webhook endpoint you specify. They give you a pre-made inbound address (or you can set one up with your own domain)
2. Incoming emails will be processed using the Vercel AI SDK, and the result will be stored in a database on Neon

<- Diagram of the email agent workflow ->

## Exercise: Set up your development environment

To follow along:

1. Switch to the "start" branch and click on the "Code" button to open the repository in GitHub Codespaces.
2. Rename the `.env.example` file to `.env`.
3. Install the dependencies by running `npm install`
4. start the development server by running `npm run dev`

You should see the app running on [`http://localhost:3000`](http://localhost:3000).

### Project Overview

The project is a fullstack React Router app that uses the Vercel AI SDK, Neon Postgres, and Drizzle ORM to build an AI workflow that processes incoming emails.

The `/app/routes/home.tsx` file contains the main page component that displays the email data. The page fetches the email data from the database on the server and renders it.

The webhook endpoint implemented in `/app/routes/api/email-webhook.tsx` functions as the primary endpoint for email data processing.

## Conceptual Overview: What are webhooks?

Webhooks are a way for one application to send real-time data to another application. They are commonly used in APIs to notify other systems about events or updates.

- Stripe: When a payment is made, Stripe sends a webhook to your server to update the payment status.
- GitHub: When you push code to a repository, GitHub sends a webhook to your CI/CD system to trigger a build.

Webhooks require a public URL that can receive incoming requests. To test webhooks locally, you can use a service like [smee.io](https://smee.io) to proxy requests to your local machine. This allows you to receive webhooks from external services on your local machine.

Since the webhook URL is public, it's essential to secure it. One common way to secure webhooks is to use a secret key. The secret key is sent with the webhook request, and the receiving server validates it before processing the request. Postmark, the email service we'll use, supports basic auth for securing webhooks. You can set a username and password to secure the webhook endpoint and in your code , here's an example:

```bash
https://username:password@your-webhook-url.com/api/webhook
```

## Exercise: Set up email webhooks with Postmark

1. Update the `.env` file you set up in the previous step with a username and password
1. Go to [smee.io](https://smee.io)
1. Create a new channel
1. Update the `dev:webhook` script in your package.json with your URL
1. Run the following two commands in separate terminals:

- `npm run dev` to start the app server
- `npm run dev:webhook` to start proxying localhost

1. Go to Postmark, you can sign up for free using a work email
1. Create a new server
1. In your newly created server, go to the Default inbound stream
1. Go to settings tab and in the "Webhook" section, add your smee.io URL while including the username and password you set in your `.env` file for basic auth.
1. In the settings tab under the "Inbound" section, you'll find you inbound email addres.
1. Send a test email to the inbound address Postmark provides. You should see the output in your terminal.

## Conceptual Overview: Building an AI Workflow

Companies such as OpenAI and Anthropic (providers) offer access to a range of large language models (LLMs) with differing strengths and capabilities through their own APIs.

Each provider typically has its own unique method for interfacing with their models, complicating the process of switching providers and increasing the risk of vendor lock-in.

To solve these challenges, you can leverage the AI SDK by Vercel. It offers a standardized approach to interacting with LLMs through a language model specification that abstracts differences between providers. This unified interface allows you to switch between providers with ease while using the same API for all providers.

Many language models are capable of generating structured data, often defined as using "JSON modes" or "tools". However, you need to manually provide schemas and then validate the generated data as LLMs can produce incorrect or incomplete structured data.

The AI SDK standardises structured object generation across model providers with the `generateObject` function. You can use Zod schemas, Valibot, or JSON schemas to specify the shape of the data that you want, and the AI model will generate data that conforms to that structure. You can also specify different output strategies, e.g. array, object, or no-schema

Here's an example:

```typescript
import { openai } from "@ai-sdk/openai"; // access OpenAI's language models
import { generateObject } from "ai"; // create structured data from AI responses
import { z } from "zod"; // schema definition and validation

// Define a schema for a recipe
const schema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(z.string()),
    steps: z.array(z.string()),
  }),
});

const result = await generateObject({
  model: openai("gpt-4-turbo"),
  schema,
  prompt: "Generate a lasagna recipe.",
});

console.log(JSON.stringify(result.object, null, 2));
```

In the webhook endpoint, we'll process incoming emails using the Vercel AI SDK. The SDK will generate structured data from the email content, which we'll then store in a database on Neon.

## Exercise: Create an AI workflow with the AI SDK by Vercel

1. Go to [platform.openai.com](https://platform.openai.com) and generate an API Key

- New account -> generate an API key during onboarding
- Existing account -> Settings > API Keys > create new secret key

2. Update the `.env` file with the API key. The AI SDK by Vercel uses the `OPENAI_API_KEY` environment variable to authenticate with OpenAI.

```bash
# .env
OPENAI_API_KEY=your-api-key
```

3. Go to the API endpoint in `/app/routes/api/email-webhook.tsx` and use the `generateObject` function to generate a structured output. Use console.log to see the output.

- [`generateObject` API reference](https://vercel.com/docs/api-reference/ai/generate-object)

4. Send a test email to your Postmark inbound address. You should see the output in your terminal.

<details>
  <summary>Solution</summary>
    ```typescript
      const result = await generateObject({
      model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
      schema,
      prompt,
    });

    console.log(JSON.stringify(result.object, null, 2));
    ```

</details>

# Conceptual overview: Neon Postgres

Neon is a Postgres platform designed to help you build reliable and scalable applications faster. It offers modern developer features such as autoscaling, branching, point-in-time restore, and more. You can sign up for free and get started in minutes.

We'll use Postgres Neon to store the structured data generated by the AI SDK.

# Exercise: Create a Postgres database on Neon

1. Sign up for Neon https://console.neon.tech/signup
1. Create a Project
1. Click on the "connect" button to get the database URL
1. Update the `.env` file with the database URL

```bash
# .env
DATABASE_URL=your-database-url
```

# Drizzle ORM

Drizzle ORM is a TypeScript ORM for SQL databases. It has three components:

- drizzle-orm: typescript query builder. It supports both a relational and SQL-like query APIs
- drizzle-kit: you define a schema in TypeScript, which serves as the source of truth for future modifications in queries and migrations
- drizzle-studio: data browser and schema editor

# Exercise: Defininig schema, storing results in the database and fetching them

```

```
