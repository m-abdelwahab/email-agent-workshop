import { db } from "~/lib/db";
import { messages } from "~/lib/db/schema";
import Link from "next/link";
import { cn } from "~/lib/utils";

const getMessages = async () => {
  try {
    const allMessages = await db
      .select()
      .from(messages)
      .orderBy(messages.createdAt);

    return allMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const Messages = async ({
  searchParams,
}: {
  searchParams: { id?: string };
}) => {
  const messageList = await getMessages();
  const selectedMessage =
    messageList.find((msg) => msg.id === searchParams.id) ?? messageList[0];

  return (
    <div className="grid h-screen grid-cols-[350px,1fr]">
      {/* Left Panel - Message List */}
      <div className="border-border overflow-y-auto border-r">
        {messageList.map((message) => (
          <Link
            key={message.id}
            href={`/?id=${message.id}`}
            className={cn(
              "border-border hover:bg-secondary/50 block border-b p-4",
              message.id === selectedMessage?.id && "bg-secondary",
            )}
          >
            <h3 className="mb-2 font-medium">{message.subject}</h3>
            <div className="flex flex-wrap gap-2">
              {message.labels.map((label, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Right Panel - Message Content */}
      <div className="overflow-y-auto p-6">
        {selectedMessage ? (
          <div>
            <div className="mb-6">
              <h2 className="mb-4 text-2xl font-bold">
                {selectedMessage.subject}
              </h2>
              <div className="bg-secondary/50 mb-6 rounded-lg p-4">
                <h3 className="mb-2 font-medium">Summary</h3>
                <p>{selectedMessage.summary}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Original Content</h3>
              <div className="whitespace-pre-wrap">{selectedMessage.body}</div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            No messages available
          </div>
        )}
      </div>
    </div>
  );
};
