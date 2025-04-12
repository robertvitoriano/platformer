import { PaperPlaneIcon, ChatBubbleIcon, Cross2Icon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { useWebsocketStore } from "@/store/websocket-store";
import { useAuthStore } from "@/store/auth-store";
import { GameEmitEvents } from "@/enums/game-events";

export const Chat = () => {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const { socket } = useWebsocketStore();
  const { token } = useAuthStore();

  const sendMessage = () => {
    socket?.send(
      JSON.stringify({
        event: GameEmitEvents.MESSAGE_SENT,
        message,
        token,
      })
    );
  };

  return (
    <div className="flex items-center w-full absolute bottom-0 gap-8  p-4">
      {showMessageInput && (
        <div className="flex items-center flex-col">
          <div
            className="bg-white w-fit rounded-full p-1"
            onClick={() => setShowMessageInput(!showMessageInput)}
          >
            <Cross2Icon width={55} height={55} />
          </div>
          <div className="w-full flex gap-8 items-center">
            <Input
              className="bg-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <PaperPlaneIcon width={55} height={55} onClick={sendMessage} />
          </div>
        </div>
      )}
      {!showMessageInput && (
        <div
          className=" absolute bottom-8 right-8 bg-white w-fit p-4 rounded-full"
          onClick={() => setShowMessageInput(!showMessageInput)}
        >
          <ChatBubbleIcon width={55} height={55} />
        </div>
      )}
    </div>
  );
};
