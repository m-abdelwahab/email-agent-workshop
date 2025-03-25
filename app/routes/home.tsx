import { db } from "~/lib/db";
import { messages } from "~/lib/db/schema";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/home";

export async function loader() {
  try {
    // TODO: query the messages table using Drizzle ORM. Use either the SQL-like syntax or the Relational API.
    // SQL-like syntax docs: https://orm.drizzle.team/docs/select
    // Relational API docs: https://orm.drizzle.team/docs/rqb#querying

    const allMessages = []; // Replace empty array with a Drizzle ORM query

    return {
      messages: [], // TODO: replace with `allMessages`
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Error fetching messages");
  }
}

export default async function Home({ loaderData }: Route.ComponentProps) {
  const { messages } = loaderData;

  return (
    <div className="mx-auto mt-10 max-w-screen-lg">
      {messages.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center py-10 text-center">
          <h2 className="mb-2 text-xl font-semibold">No messages found</h2>
          <p className="text-muted-foreground">
            Once you receive an email, the summary will appear here.
          </p>
        </div>
      ) : (
        <div className="border-border space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <details
              key={message.id}
              className={cn(
                "border-border group rounded-lg border p-4 shadow-md",
              )}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <h3 className="mb-2 font-medium">{message.subject}</h3>
                    <p className="text-muted-foreground mb-2 text-sm">
                      {message.summary || "No summary available"}
                    </p>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {message.labels?.map((label, index) => (
                        <span
                          key={index}
                          className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm">
                      Original email
                      <svg
                        className="h-4 w-4 transition-transform group-open:rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </p>
                  </div>
                  <div className="text-muted-foreground"></div>
                </div>
              </summary>
              <div className="mt-4 border-t pt-4">
                <div className="prose prose-sm max-w-none">{message.body}</div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
