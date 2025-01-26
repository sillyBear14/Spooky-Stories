'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

const SOUNDS = [
  '/sounds/horror-scary-human-whisper-ghost-05-257014.mp3',
  '/sounds/sound-effect-halloween-wolf-howling-253243.mp3',
  '/sounds/creepy-halloween-bell-trap-melody-247720.mp3',
  '/sounds/creepy-singing-156362.mp3',
  '/sounds/scary-spooky-eerie-suspense-283845.mp3',
  '/sounds/raven-solo-call-horror-and-night-242219.mp3'
]

export function useSoundManager() {
  const [isMuted, setIsMuted] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const audioElements = useRef<HTMLAudioElement[]>([])
  const timers = useRef<NodeJS.Timeout[]>([])
  const [volume, setVolume] = useState(0.7)
  const silentAudio = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements and setup silent audio context
  useEffect(() => {
    try {
      // Create a silent audio context to enable audio without user interaction
      silentAudio.current = new Audio()
      silentAudio.current.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV'
      silentAudio.current.volume = 0
      silentAudio.current.loop = true
      silentAudio.current.play().catch(() => {
        console.log('Silent audio initialization prevented - waiting for user interaction')
      })

      // Initialize sound elements
      audioElements.current = SOUNDS.map(src => {
        const audio = new Audio(src)
        audio.volume = volume
        audio.preload = 'auto'
        return audio
      })
      setIsInitialized(true)
      console.log('Audio elements initialized:', audioElements.current.length)
    } catch (error) {
      console.error('Failed to initialize audio elements:', error)
      toast.error('Failed to initialize sounds')
    }

    return () => {
      silentAudio.current?.pause()
      audioElements.current.forEach(audio => {
        audio.pause()
        audio.remove()
      })
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const playRandomSound = useCallback(() => {
    if (isMuted || !audioElements.current.length) {
      console.log('Sound prevented:', isMuted ? 'muted' : 'no audio elements')
      return
    }

    const randomIndex = Math.floor(Math.random() * SOUNDS.length)
    const audio = audioElements.current[randomIndex]
    
    try {
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(error => {
        console.error('Audio playback error:', error)
        toast.error('Failed to play sound')
      })
      console.log('Playing sound:', SOUNDS[randomIndex])
    } catch (error) {
      console.error('Sound error:', error)
    }
  }, [isMuted, volume])

  const scheduleSound = useCallback((initial = false) => {
    const delay = initial ? 60000 : // 1 minute initial delay
      Math.floor(Math.random() * (180000 - 90000 + 1)) + 90000 // 90-180 seconds

    console.log(`Scheduling next sound in ${delay/1000} seconds`)
    
    const timer = setTimeout(() => {
      console.log('Timer triggered, playing random sound')
      playRandomSound()
      scheduleSound()
    }, delay)

    timers.current.push(timer)
  }, [playRandomSound])

  const restartSounds = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    scheduleSound(true)
    if (!isMuted) toast('🔊 Spooky sounds restarted!')
  }, [isMuted, scheduleSound])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        toast.success('Sounds muted')
        audioElements.current.forEach(audio => audio.pause())
      } else {
        toast.success('Sounds unmuted')
        restartSounds()
      }
      return !prev
    })
  }, [restartSounds])

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume)
    audioElements.current.forEach(audio => {
      audio.volume = newVolume
    })
  }, [])

  const playSpecificSound = useCallback((index: number) => {
    if (index < 0 || index >= audioElements.current.length) {
      console.error('Invalid sound index')
      return
    }

    const audio = audioElements.current[index]
    try {
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(error => {
        console.error('Audio playback error:', error)
        toast.error('Failed to play sound')
      })
      console.log('Playing specific sound:', SOUNDS[index])
    } catch (error) {
      console.error('Sound error:', error)
    }
  }, [volume])

  // Start initial schedule
  useEffect(() => {
    if (isInitialized && !isMuted) {
      console.log('Starting initial sound schedule')
      scheduleSound(true)
    }
  }, [isInitialized, isMuted, scheduleSound])

  return {
    isMuted,
    toggleMute,
    restartSounds,
    volume,
    updateVolume,
    isInitialized,
    playSpecificSound
  }
}