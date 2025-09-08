"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image';
  value: string;
  preview?: string;
}

export const defaultBackgroundPresets: BackgroundPreset[] = [
  { id: 'office', name: 'Modern Office', type: 'image', value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' },
  { id: 'home', name: 'Living Room', type: 'image', value: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop' },
  { id: 'nature', name: 'Nature Scene', type: 'image', value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop' },
  { id: 'blue', name: 'Blue Gradient', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'purple', name: 'Purple Gradient', type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'green', name: 'Green Gradient', type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'white', name: 'Clean White', type: 'color', value: '#ffffff' },
  { id: 'dark', name: 'Dark Theme', type: 'color', value: '#1a1a1a' },
  { id: 'corporate', name: 'Corporate Blue', type: 'color', value: '#2563eb' }
];

export function useBackgroundEffects() {
  const [backgroundType, setBackgroundType] = useState<'none' | 'blur' | 'preset' | 'greenscreen'>('none');
  const [selectedPreset, setSelectedPreset] = useState<string>('office');
  const [presetBackgrounds] = useState<BackgroundPreset[]>(defaultBackgroundPresets);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFps, setProcessingFps] = useState(10); // Balanced for quality and performance

  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  // Green screen removal parameters
  const greenScreenThreshold = 0.4;

  const loadBackgroundImage = useCallback(async (preset: BackgroundPreset) => {
    if (preset.type !== 'image') return;
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        backgroundImageRef.current = img;
        resolve();
      };
      img.onerror = () => {
        // Fallback to a solid color if image fails to load
        backgroundImageRef.current = null;
        resolve();
      };
      img.src = preset.value;
    });
  }, []);

  const selectPresetBackground = useCallback(async (presetId: string) => {
    const preset = presetBackgrounds.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    
    if (preset.type === 'image') {
      await loadBackgroundImage(preset);
    }
  }, [presetBackgrounds, loadBackgroundImage]);

  const isGreenPixel = useCallback((r: number, g: number, b: number): boolean => {
    // Normalize RGB values
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    // Check if green is significantly higher than red and blue
    return (
      gNorm > (rNorm + bNorm) * 0.6 &&
      gNorm > greenScreenThreshold &&
      Math.abs(rNorm - bNorm) < 0.3
    );
  }, []);

  const processVideoFrame = useCallback((
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => {
    if (backgroundType !== 'preset') return;
    
    const now = Date.now();
    const frameInterval = 1000 / processingFps;
    
    if (now - lastProcessTimeRef.current < frameInterval) return;
    lastProcessTimeRef.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = Math.floor(video.getBoundingClientRect().width);
    const containerHeight = Math.floor(video.getBoundingClientRect().height);
    
    if (containerWidth <= 0 || containerHeight <= 0) return;
    
    const videoWidth = video.videoWidth || containerWidth;
    const videoHeight = video.videoHeight || containerHeight;
    
    if (videoWidth <= 0 || videoHeight <= 0) return;
    
    if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    }

    setIsProcessing(true);

    try {
      const selectedBg = presetBackgrounds.find(p => p.id === selectedPreset);
      if (!selectedBg) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background first
      if (selectedBg.type === 'color') {
        ctx.fillStyle = selectedBg.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBg.type === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (selectedBg.value.includes('667eea')) {
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
        } else if (selectedBg.value.includes('f093fb')) {
          gradient.addColorStop(0, '#f093fb');
          gradient.addColorStop(1, '#f5576c');
        } else if (selectedBg.value.includes('4facfe')) {
          gradient.addColorStop(0, '#4facfe');
          gradient.addColorStop(1, '#00f2fe');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBg.type === 'image' && backgroundImageRef.current) {
        ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Draw video on a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Optimized processing - every 2nd pixel with interpolation
      for (let i = 0; i < data.length; i += 8) { // Process every 2nd pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Fast green detection
        const greenStrength = g - Math.max(r, b);
        const isGreen = g > 80 && greenStrength > 40;
        
        if (isGreen) {
          // Apply to current pixel and next pixel for smooth coverage
          const transparency = Math.min(1, greenStrength / 100);
          data[i + 3] = Math.max(0, data[i + 3] * (1 - transparency));
          if (i + 7 < data.length) {
            data[i + 7] = Math.max(0, data[i + 7] * (1 - transparency));
          }
        }
        // Edge smoothing for partial green
        else if (g > 60 && greenStrength > 20) {
          data[i + 3] = Math.max(0, data[i + 3] * 0.3);
          if (i + 7 < data.length) {
            data[i + 7] = Math.max(0, data[i + 7] * 0.5);
          }
        }
      }

      // Apply processed image with transparency
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
      
    } catch (error) {
      console.error('Background processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [backgroundType, selectedPreset, presetBackgrounds, processingFps]);

  // Initialize with default background
  useEffect(() => {
    if (backgroundType === 'preset') {
      selectPresetBackground(selectedPreset);
    }
  }, [backgroundType, selectPresetBackground, selectedPreset]);

  return {
    backgroundType,
    setBackgroundType,
    selectedPreset,
    selectPresetBackground,
    processVideoFrame,
    isProcessing,
    processingFps,
    setProcessingFps,
    presetBackgrounds,
  };
}