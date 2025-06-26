"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface VoiceVisualizerProps {
  mediaRecorder: MediaRecorder | null
  isRecording: boolean
}

export function VoiceVisualizer({
  mediaRecorder,
  isRecording,
}: VoiceVisualizerProps) {
  const [audioData, setAudioData] = useState<number[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!mediaRecorder || !isRecording) {
      setAudioData([])
      return
    }

    // Create audio context and analyser
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 128 // This will create 64 data points

    // Get the audio stream from mediaRecorder
    const stream = mediaRecorder.stream
    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)

    // Start visualization
    const visualize = () => {
      if (!analyserRef.current) return

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)

      setAudioData(Array.from(dataArray))
      animationFrameRef.current = requestAnimationFrame(visualize)
    }

    visualize()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [mediaRecorder, isRecording])

  return (
    <div className="flex h-8 items-center justify-center gap-[2px] px-2">
      {audioData.map((value, i) => {
        const height = Math.max((value / 255) * 32, 2) // Min height of 2px, max 32px
        return (
          <div
            key={i}
            className="bg-primary/80 w-[2px]"
            style={{
              height: `${height}px`,
              transform: `scaleY(${i % 2 === 0 ? 1 : -1})`, // Alternate up and down
              opacity: Math.max(value / 255, 0.2), // Minimum opacity of 0.2
            }}
          />
        )
      })}
    </div>
  )
}
