import { GameEmitEvents } from "@/enums/game-events";
import { useAuthStore } from "@/store/auth-store";
import { useWebsocketStore } from "@/store/websocket-store";
import React, { useState, useRef } from "react";

function AudioCaptureButton() {
  const [isCapturing, setIsCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketStore = useWebsocketStore();
  const { token } = useAuthStore();

  const startAudioCapture = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && webSocketStore.socket?.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            webSocketStore.socket.send(
              JSON.stringify({
                event: GameEmitEvents.AUDIO_CHUNK_SENT,
                chunk: Array.from(new Uint8Array(arrayBuffer)),
                token,
              })
            );
          }
        };

        mediaRecorder.start(100);
        setIsCapturing(true);
      })
      .catch((err) => {
        console.error("Error capturing audio:", err);
      });
  };

  const stopAudioCapture = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setIsCapturing(false);
  };

  const handleButtonClick = () => {
    if (isCapturing) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-40 h-12 flex justify-center items-center rounded bg-blue-500 text-white cursor-pointer ${
          isCapturing ? "bg-red-500" : ""
        }`}
        onClick={handleButtonClick}
      >
        {isCapturing ? "Stop Broadcasting" : "Start Broadcasting"}
      </div>
    </div>
  );
}

export default AudioCaptureButton;
