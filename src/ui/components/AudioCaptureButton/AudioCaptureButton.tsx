import { GameEmitEvents, GameReceiveEvents } from "@/enums/game-events";
import { useAuthStore } from "@/store/auth-store";
import { useWebsocketStore } from "@/store/websocket-store";
import React, { useState, useRef, useEffect } from "react";
import { Mic, Pause } from "lucide-react";
function AudioCaptureButton() {
  const [isCapturing, setIsCapturing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { socket } = useWebsocketStore();
  const { token } = useAuthStore();
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!peer) {
      setPeer(new RTCPeerConnection());
    }
  }, []);

  useEffect(() => {
    if (peer) {
      registerPeerEvents();
    }
    registerSocketEvents();
  }, [peer]);

  const registerPeerEvents = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      stream.getTracks().forEach((track) => peer!.addTrack(track, stream));
    });

    peer?.addEventListener("track", (event) => {
      const remoteAudio = document.getElementById("remoteAudio") as HTMLMediaElement;
      remoteAudio.srcObject = event.streams[0];
    });

    peer?.addEventListener("icecandidate", ({ candidate }) => {
      if (candidate) {
        socket!.emit({ event: GameEmitEvents.WEBRTC_CANDIDATE_SENT, candidate, token });
      }
    });
  };

  const registerSocketEvents = () => {
    socket?.on(GameReceiveEvents.WEBRTC_OFFER_RECEIVED, async (message) => {
      if (message.offer && peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket!.emit({ event: GameEmitEvents.WEBRTC_ANSWER_SENT, answer, token });
      }
    });
    socket?.on(GameReceiveEvents.WEBRTC_ANSWER_RECEIVED, async (message) => {
      if (message.answer && peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(message.answer));
      }
    });
    socket?.on(GameReceiveEvents.WEBRTC_CANDIDATE_RECEIVED, async (message) => {
      if (message.candidate && peer) {
        await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    });
  };

  const startAudioCapture = async () => {
    setIsCapturing(!isCapturing);

    if (peer) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket!.emit({
        event: GameEmitEvents.WEBRTC_OFFER_SENT,
        token,
        offer,
      });
    }
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
