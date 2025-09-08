"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Mic, MicOff, Video, VideoOff, Download, Settings, AlertCircle, Square, Circle, Maximize, Minimize } from "lucide-react";
import { useHeyGenAvatar } from "@/hooks/use-heygen-avatar";
import { useVideoRecording } from "@/hooks/use-video-recording";
import { useBackgroundEffects } from "@/hooks/use-background-effects";

export function InteractiveAvatarPlayground() {
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay compliance
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("Anthony_Black_Suit_public");
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_HEYGEN_API_KEY || "");
  const [voice, setVoice] = useState("default");
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voiceEmotion, setVoiceEmotion] = useState("FRIENDLY");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const {
    isConnected,
    isLoading,
    error,
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
  } = useHeyGenAvatar({
    apiKey,
    avatarId: selectedAvatar,
    voiceId: voice,
    voiceRate: voiceRate,
    voiceEmotion: voiceEmotion,
  });

  const {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  } = useVideoRecording();

  const {
    backgroundType,
    setBackgroundType,
    selectedPreset,
    selectPresetBackground,
    processVideoFrame,
    isProcessing,
    processingFps,
    setProcessingFps,
    presetBackgrounds,
  } = useBackgroundEffects();


  const handleConnect = useCallback(async () => {
    if (!apiKey) {
      alert("Please enter your HeyGen API key");
      return;
    }
    await connect();
  }, [apiKey, connect]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !isConnected) return;
    
    try {
      await speak(message);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message to avatar");
    }
  }, [message, isConnected, speak]);

  const handleToggleRecording = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording(videoRef.current);
      }
    } catch (err) {
      console.error("Recording error:", err);
      alert("Failed to start recording");
    }
  }, [isRecording, startRecording, stopRecording, videoRef]);

  const enableAudio = useCallback(() => {
    if (videoRef.current) {
      console.log("🔊 Enabling audio for avatar...");
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      // Ensure it's still playing after unmuting
      videoRef.current.play().catch(console.error);
      setIsMuted(false);
      console.log("✅ Audio enabled - you should now hear the avatar!");
    }
  }, [videoRef]);

  // Process video frames for background effects
  useEffect(() => {
    let frameId: number;
    
    const processFrames = () => {
      try {
        if (videoRef.current && overlayCanvasRef.current && isConnected && backgroundType === "preset") {
          const video = videoRef.current;
          const canvas = overlayCanvasRef.current;
          
          if (video.videoWidth > 0 && video.videoHeight > 0 && canvas.width > 0 && canvas.height > 0) {
            processVideoFrame(video, canvas);
          }
        }
      } catch (error) {
        console.error('Frame processing error:', error);
      }
      
      if (isConnected && backgroundType === "preset") {
        frameId = requestAnimationFrame(processFrames);
      }
    };
    
    if (isConnected && backgroundType === "preset") {
      processFrames();
    }
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isConnected, backgroundType, processVideoFrame]);


  // Debug video element state
  useEffect(() => {
    if (isConnected && videoRef.current) {
      const video = videoRef.current;
      console.log("🗺 Video element state change:", {
        hasStream: !!video.srcObject,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        paused: video.paused,
        muted: video.muted
      });
      
      const handleLoadedMetadata = () => {
        console.log("🎥 Video metadata loaded:", {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          duration: video.duration
        });
      };
      
      const handleLoadedData = () => {
        console.log("📁 Video data loaded");
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadeddata', handleLoadedData);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [isConnected, videoRef.current?.srcObject]);

  const handleScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `avatar-screenshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  }, [videoRef]);

  const handleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!isFullscreen) {
        const element = videoContainerRef.current as HTMLDivElement & {
          webkitRequestFullscreen?: () => Promise<void>;
          mozRequestFullScreen?: () => Promise<void>;
        };
        
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        }
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void>;
          mozCancelFullScreen?: () => Promise<void>;
        };
        
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
      };
      
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
    };
  }, []);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar Display */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Avatar Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={videoContainerRef} 
              className="relative aspect-video bg-black rounded-lg overflow-hidden"
              style={{
                backgroundColor: backgroundType === "preset" && presetBackgrounds.find(bg => bg.id === selectedPreset)?.type === "color" 
                  ? presetBackgrounds.find(bg => bg.id === selectedPreset)?.value 
                  : undefined,
                background: backgroundType === "preset" && presetBackgrounds.find(bg => bg.id === selectedPreset)?.type === "gradient"
                  ? presetBackgrounds.find(bg => bg.id === selectedPreset)?.value
                  : backgroundType === "preset" && presetBackgrounds.find(bg => bg.id === selectedPreset)?.type === "image"
                  ? `url(${presetBackgrounds.find(bg => bg.id === selectedPreset)?.value}) center/cover`
                  : undefined
              }}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={false}
                style={{ 
                  display: isVideoEnabled ? "block" : "none",
                  objectFit: 'contain'
                }}
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  display: isVideoEnabled && backgroundType === "preset" ? "block" : "none"
                }}
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Connect to start avatar session</p>
                  </div>
                </div>
              )}
              
              {isConnected && !videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading avatar stream...</p>
                    <p className="text-sm opacity-70">Waiting for video stream</p>
                  </div>
                </div>
              )}
              
              {isConnected && isMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center text-white">
                    <div className="bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-lg">
                      <div className="text-xl mb-3">🔇 Audio Muted</div>
                      <p className="mb-4 text-sm">Click to enable audio and hear your avatar</p>
                      <Button
                        onClick={enableAudio}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
                      >
                        🔊 Enable Audio
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="absolute top-4 right-4 bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                  Processing... ({processingFps} FPS)
                </div>
              )}
              
              {isConnected && (videoRef.current?.muted || isMuted) && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-yellow-500/90 text-black px-3 py-2 rounded-lg text-sm flex items-center justify-between">
                    <span>🔇 Audio is muted - Click to enable audio and hear avatar</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={enableAudio}
                      className="text-black hover:bg-yellow-400"
                    >
                      Enable Audio
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "secondary"}
                    onClick={() => {
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (videoRef.current) {
                        videoRef.current.muted = newMuted;
                      }
                    }}
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isVideoEnabled ? "secondary" : "destructive"}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "secondary"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={!isConnected}
                    title={isListening ? "Stop Voice Input" : "Start Voice Input"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleScreenshot}
                    disabled={!isConnected}
                    title="Take Screenshot"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                  {recordedBlob && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={downloadRecording}
                      title="Download Recording"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        {/* Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">HeyGen API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              {apiKey && (
                <div className="mt-1">
                  {(() => {
                    const validation = validateApiKey(apiKey);
                    return (
                      <div className={`text-xs flex items-center gap-1 ${
                        validation.isValid ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {validation.isValid ? '✓' : '⚠'}
                        <span>{validation.message}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Avatar</label>
              <Select value={selectedAvatar} onValueChange={(newAvatar) => {
                setSelectedAvatar(newAvatar);
                // Reset background to none for sitting avatar
                if (newAvatar === "Anthony_Chair_Sitting_public") {
                  setBackgroundType("none");
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an avatar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anthony_Black_Suit_public">Anthony - Black Suit</SelectItem>
                  <SelectItem value="Anthony_White_Suit_public">Anthony - White Suit</SelectItem>
                  <SelectItem value="Anthony_Chair_Sitting_public">Anthony - Chair Sitting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sdkLoading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading HeyGen SDK...</span>
              </div>
            )}
            {error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
                {(error.includes("HeyGen SDK") || error.includes("Script loading failed")) && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="text-orange-600 font-medium">HeyGen SDK is currently unavailable.</div>
                    <div>This may be due to server maintenance or network issues.</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isLoading || !apiKey}
              className="w-full"
              variant={isConnected ? "destructive" : "default"}
            >
              {isLoading ? (sdkLoading ? "Loading SDK..." : "Connecting...") : isConnected ? "Disconnect" : "Connect"}
            </Button>
          </CardContent>
        </Card>


        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!isConnected}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !message.trim()}
                className="flex-1"
              >
                Send Message
              </Button>
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!isConnected}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                title={isListening ? "Stop Voice Input" : "Start Voice Input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Press Enter to send message or use voice input
              {isListening && (
                <span className="text-green-600 ml-2">🎤 Listening...</span>
              )}
              <br />
              <span className="text-blue-600">Voice settings apply to next message</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAvatar !== "Anthony_Chair_Sitting_public" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <Select value={backgroundType} onValueChange={setBackgroundType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Original Background</SelectItem>
                      <SelectItem value="blur">Blur Background</SelectItem>
                      <SelectItem value="preset">Custom Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {backgroundType === "preset" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Choose Background</label>
                    <Select value={selectedPreset} onValueChange={selectPresetBackground}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a background" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetBackgrounds.map((bg) => (
                          <SelectItem key={bg.id} value={bg.id}>
                            {bg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            {selectedAvatar === "Anthony_Chair_Sitting_public" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Background</label>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <p>🪑 Background customization is disabled for the sitting avatar to maintain the natural chair scene.</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Voice Type</label>
              <Select value={voice} onValueChange={(newVoice) => {
                setVoice(newVoice);
                if (isConnected) {
                  updateVoiceSettings(newVoice, voiceRate, voiceEmotion);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Anthony&apos;s Default Voice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Voice Emotion</label>
              <Select value={voiceEmotion} onValueChange={(newEmotion) => {
                setVoiceEmotion(newEmotion);
                if (isConnected) {
                  updateVoiceSettings(voice, voiceRate, newEmotion);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRIENDLY">Friendly</SelectItem>
                  <SelectItem value="SERIOUS">Serious</SelectItem>
                  <SelectItem value="SOOTHING">Soothing</SelectItem>
                  <SelectItem value="EXCITED">Excited</SelectItem>
                  <SelectItem value="BROADCAST">Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Speech Rate: {voiceRate}x</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  setVoiceRate(newRate);
                  if (isConnected) {
                    updateVoiceSettings(voice, newRate, voiceEmotion);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slow (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Fast (2.0x)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}