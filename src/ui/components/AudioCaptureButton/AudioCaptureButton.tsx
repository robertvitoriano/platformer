import { GameEmitEvents } from "@/enums/game-events";
import { useAuthStore } from "@/store/auth-store";
import { useWebsocketStore } from "@/store/websocket-store";
import React, { useState, useRef } from "react";
import { Mic, Pause } from "lucide-react";
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
        setIsCapturing(!isCapturing);
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

    setIsCapturing(!isCapturing);
  };

  const handleButtonClick = () => {
    if (isCapturing) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  };

  return (
    <div
      className={`w-12 h-12  bg-blue-500 text-white  absolute left-10  bottom-10 cursor-pointer rounded-full flex justify-center items-center ${
        isCapturing ? "bg-red-500" : ""
      }`}
      onClick={handleButtonClick}
    >
      {isCapturing ? <Pause /> : <Mic />}
    </div>
  );
}

export default AudioCaptureButton;
