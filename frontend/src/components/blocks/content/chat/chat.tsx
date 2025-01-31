import React, { useState } from "react";
import { Separator } from "../../../ui/separator";
import { Button } from "../../../ui/button";
import {
  Bot,
  LucideCuboid,
  LucideSettings2,
  Search,
  Send,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSendMessage, useMessageStore } from "@/store/chatStore";
import { useTabsState } from "../../../../store/layoutStore";

const chat = () => {
  const { messages, addMessage } = useMessageStore();
  const { createTab } = useTabsState();
  const [inputValue, setInputValue] = useState("");
  const sendMessage = useSendMessage();
  return (
    <div
      className="flex flex-col px-4 gap-1 py-4 justify-between"
      style={{
        height: "calc(100vh - 42px)",
      }}
    >
      <div className="h-[90%]">
        <div>
          <div className="flex justify-between">
            <p className="text-xl font-bold">Chat</p>
            <Button size={"iconSm"} variant={"outline"}>
              <LucideSettings2 size={14} />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">Using LM Studio...</p>
        </div>
        <Separator />
        <div className="h-full overflow-x-clip overflow-y-scroll ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col mb-4 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium">
                  {message.role === "user"
                    ? "You"
                    : message.role === "ai"
                    ? "AI"
                    : "Reference"}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {message.timestamp}
                </span>
              </div>
              <div
                className={`rounded-lg p-2 max-w-[80%] allow-select ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "ai"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted"
                } text-ellipsis overflow-x-clip text-wrap`}
              >
                {message.content}
                {message.reference && (
                  <div className="flex flex-col mt-2 p-2 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <Button
                      className="flex justify-start gap-2 mt-2 text-left"
                      variant={"secondary"}
                      onClick={() => {
                        if (message.reference) {
                          createTab(message.reference.id, "object");
                        }
                      }}
                    >
                      <LucideCuboid size={18} />
                      <p className="text-sm">{message.reference.title}</p>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 h-fit">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessage({
                id: messages.length + 1,
                role: "user",
                content: inputValue,
                timestamp: "Just now",
              });
              setInputValue("");
            }
          }}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button
          onClick={() => {
            sendMessage({
              id: messages.length + 1,
              role: "user",
              content: inputValue,
              timestamp: "Just now",
            });
            setInputValue("");
          }}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default chat;
