import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useWebsocketStore } from "@/store/websocket-store";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const queueRef = useRef<Uint8Array[]>([]);
  const authStore = useAuthStore();
  const { socket } = useWebsocketStore();

  useEffect(() => {
    if (!socket) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    const audio = new Audio();
    audioRef.current = audio;
    audio.src = URL.createObjectURL(mediaSource);
    audio.autoplay = true;
    audio.play().catch(() => {});

    mediaSource.addEventListener("sourceopen", () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
      sourceBufferRef.current = sourceBuffer;

      sourceBuffer.addEventListener("updateend", processQueue);
    });

    const handleAudioChunkReceived = (data: any) => {
      if (!data.chunk || authStore.player?.id === data.senderId) return;

      const uint8Array = new Uint8Array(data.chunk);
      queueRef.current.push(uint8Array);
      processQueue();
    };

    const processQueue = () => {
      const sourceBuffer = sourceBufferRef.current;
      if (!sourceBuffer || sourceBuffer.updating || queueRef.current.length === 0) return;

      const chunk = queueRef.current.shift();
      if (chunk) {
        try {
          sourceBuffer.appendBuffer(chunk);
        } catch (e) {
          console.error("appendBuffer error:", e);
        }
      }
    };

    useWebsocketStore.getState().addListener("audio_chunk_received", handleAudioChunkReceived);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (mediaSourceRef.current) {
        mediaSourceRef.current = null;
      }
      if (sourceBufferRef.current) {
        sourceBufferRef.current = null;
      }
      useWebsocketStore.getState().removeListener("audio_chunk_received");
    };
  }, [socket]);
};
