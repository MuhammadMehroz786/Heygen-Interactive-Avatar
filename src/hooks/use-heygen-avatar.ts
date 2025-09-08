"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import StreamingAvatar, { StreamingEvents, VoiceEmotion, AvatarQuality } from "@heygen/streaming-avatar";
import type { TranscriptEntry } from "@/store/atoms";

interface HeyGenAvatarProps {
  apiKey: string;
  avatarId: string;
  voiceId: string;
  voiceRate: number;
  voiceEmotion: string;
}

export function useHeyGenAvatar({
  apiKey,
  avatarId,
  voiceId,
  voiceRate,
  voiceEmotion,
}: HeyGenAvatarProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamingAvatarRef = useRef<StreamingAvatar | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // SDK loading state (always loaded with NPM package)
  const [sdkLoaded] = useState(true);
  const [sdkError] = useState<string | null>(null);
  const [sdkLoading] = useState(false);

  const validateApiKey = useCallback((key: string) => {
    if (!key) return { isValid: false, message: 'API key is required' };
    if (key.length < 20) return { isValid: false, message: 'API key appears to be too short' };
    return { isValid: true, message: 'API key format looks correct' };
  }, []);


  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      
      console.log("🎟️ Creating session token via API route...");
      
      // Create a session token using our secure API route
      const tokenResponse = await fetch('/api/get-access-token', {
        method: 'POST'
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("❌ Token creation failed:", {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          response: errorText
        });
        throw new Error(`Failed to create session token: ${tokenResponse.status} - ${errorText}`);
      }
      
      const sessionToken = await tokenResponse.text();
      console.log("✅ Session token received successfully");
      console.log("🔑 Using session token for StreamingAvatar");

      // Create streaming avatar instance with the session token
      const avatar = new StreamingAvatar({ 
        token: sessionToken 
      });

      console.log("✅ Created StreamingAvatar instance successfully");

      // Set up event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log("🗣️ Avatar started talking");
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log("🤐 Avatar stopped talking");
      });

      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log("🎥 Stream ready event received:", event);
        
        if (videoRef.current && event.detail) {
          const mediaStream = event.detail;
          console.log("📺 MediaStream details:", {
            id: mediaStream.id,
            active: mediaStream.active,
            videoTracks: mediaStream.getVideoTracks(),
            audioTracks: mediaStream.getAudioTracks()
          });
          
          // Set the media stream to video element
          videoRef.current.srcObject = mediaStream;
          
          // Store the media stream reference
          mediaStreamRef.current = mediaStream;
          
          // Ensure video is not muted initially for avatar
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          
          // Play the video
          videoRef.current.play()
            .then(() => {
              console.log("✅ Video is now playing successfully");
              console.log("Video element state:", {
                paused: videoRef.current?.paused,
                ended: videoRef.current?.ended,
                readyState: videoRef.current?.readyState,
                videoWidth: videoRef.current?.videoWidth,
                videoHeight: videoRef.current?.videoHeight
              });
            })
            .catch((error) => {
              console.error("❌ Video play error, trying with muted:", error);
              if (videoRef.current) {
                videoRef.current.muted = true;
                return videoRef.current.play();
              }
            })
            .catch((error) => {
              console.error("❌ Failed to play video even with muted:", error);
            });
        } else {
          console.error("❌ Stream ready failed - missing videoRef or event.detail", {
            hasVideoRef: !!videoRef.current,
            hasEventDetail: !!event.detail
          });
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        setIsConnected(false);
      });

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log("Avatar started talking");
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log("Avatar stopped talking");
      });

      // Create and start avatar session
      console.log("🚀 Starting avatar session with config:", {
        avatarName: avatarId,
        quality: 'medium',
        voiceRate,
        voiceEmotion
      });

      console.log("🚀 Testing with avatar ID:", avatarId);
      
      const response = await avatar.createStartAvatar({
        avatarName: avatarId,
      });

      console.log("✅ Avatar session created successfully:", response);
      
      streamingAvatarRef.current = avatar;
      setIsConnected(true);
    } catch (err: any) {
      console.error("❌ Connection error details:", {
        message: err?.message,
        status: err?.status,
        statusText: err?.statusText,
        response: err?.response,
        data: err?.response?.data,
        name: err?.name,
        stack: err?.stack,
        fullError: err
      });
      
      console.error("❌ Raw error object:", err);
      
      let errorMessage = "Failed to connect to avatar";
      
      if (err?.status === 400) {
        errorMessage = `Invalid request (400): ${err?.message || 'Please check avatar ID and parameters'}. Try switching to "Santa - Fireplace (Fallback)" avatar.`;
      } else if (err?.status === 401) {
        errorMessage = "Authentication failed (401). Please check your API key.";
      } else if (err?.status === 403) {
        errorMessage = "Access denied (403). Your API key may not have permission for Interactive Avatar.";
      } else if (err?.status === 404) {
        errorMessage = "Avatar not found (404). The selected avatar may not be available. Try the Santa fallback avatar.";
      } else if (err?.message) {
        errorMessage = `Connection error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [avatarId, voiceRate, voiceEmotion]);

  const disconnect = useCallback(async () => {
    if (streamingAvatarRef.current) {
      try {
        await streamingAvatarRef.current.stopAvatar();
      } catch (err) {
        console.error("Disconnect error:", err);
      }
      streamingAvatarRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
    setError(null);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      // Add user message to transcript
      setTranscript(prev => [...prev, {
        type: 'user',
        text: text,
        timestamp: new Date()
      }]);

      if (!streamingAvatarRef.current) return;
      
      await streamingAvatarRef.current.speak({ text: text });

      // Add avatar response to transcript
      setTranscript(prev => [...prev, {
        type: 'avatar',
        text: `Speaking: ${text}`,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("Speak error:", err);
      throw err;
    }
  }, []);

  const interrupt = useCallback(async () => {
    if (!streamingAvatarRef.current) return;

    try {
      await streamingAvatarRef.current.interrupt();
    } catch (err) {
      console.error("Interrupt error:", err);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      if (result.trim()) {
        speak(result);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speak]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  const updateVoiceSettings = useCallback(async (newVoiceId: string, newRate: number, newEmotion: string) => {
    // Voice settings will be applied to the next speak call
    console.log("Voice settings updated:", { newVoiceId, newRate, newEmotion });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingAvatarRef.current) {
        streamingAvatarRef.current.stopAvatar().catch(console.error);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isConnected,
    isLoading,
    error: error || sdkError,
    isListening,
    transcript,
    videoRef,
    sdkLoaded,
    sdkLoading,
    connect,
    disconnect,
    speak,
    interrupt,
    startListening,
    stopListening,
    clearTranscript,
    updateVoiceSettings,
    validateApiKey,
  };
}