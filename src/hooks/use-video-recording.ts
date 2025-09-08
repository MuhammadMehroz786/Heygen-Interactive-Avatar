"use client";

import { useState, useRef, useCallback } from "react";

export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!videoElement.srcObject && !videoElement.src) {
      throw new Error("Video element has no source");
    }

    try {
      let stream: MediaStream;
      
      if (videoElement.srcObject instanceof MediaStream) {
        stream = videoElement.srcObject;
      } else {
        // Create a stream from the video element
        stream = (videoElement as any).captureStream ? (videoElement as any).captureStream() : (videoElement as any).mozCaptureStream();
        
        if (!stream) {
          // Fallback: capture the entire video element using getDisplayMedia
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      throw new Error("Failed to start recording. Make sure the video is playing.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
  }, []);

  return {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  };
}