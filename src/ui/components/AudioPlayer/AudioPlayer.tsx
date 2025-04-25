import { useAuthStore } from "@/store/auth-store";
import { useWebsocketStore } from "@/store/websocket-store";
import React, { useEffect, useRef } from "react";

export const AudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Blob[]>([]); // Queue to store audio chunks
  const isPlayingRef = useRef(false);
  const authStore = useAuthStore();
  const { socket } = useWebsocketStore();
  useEffect(() => {
    if (!socket) return;

    audioContextRef.current = new AudioContext();

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (
        data.event === "audio_chunk_received" &&
        data.chunk &&
        authStore.player?.id !== data.senderId
      ) {
        convertAudioChunkToBlob(data);
      }
    };

    const convertAudioChunkToBlob = (chunk: ArrayBuffer) => {
      const blob = new Blob([chunk], { type: "audio/webm" });
      audioQueueRef.current.push(blob);

      if (!isPlayingRef.current) {
        playAudioChunks();
      }
    };

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [socket]);

  const playAudioChunks = async () => {
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const audioBlob = audioQueueRef.current.shift();
      if (!audioBlob) continue;

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      await new Promise((resolve) => {
        source.onended = resolve;
      });
    }

    isPlayingRef.current = false;
  };

  return <div>Listening to audio stream...</div>;
};

export default AudioPlayer;
