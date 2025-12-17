import React, { useRef, useEffect, useState } from 'react'
import { Project, Scene } from '../core/types'
import { Renderer2D, GameLoop } from '../runtime/renderer'
import './gamePreview.css'

interface GamePreviewProps {
  project: Project
  scene: Scene
  isRunning: boolean
  onStop: () => void
}

export default function GamePreview({ project, scene, isRunning, onStop }: GamePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<GameLoop | null>(null)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef(0)
  const fpsTimerRef = useRef(0)

  // Initialize game loop
  useEffect(() => {
    if (!canvasRef.current) return

    gameLoopRef.current = new GameLoop(
      canvasRef.current,
      project.settings.targetFPS
    )

    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.stop()
      }
    }
  }, [project])

  // Start/stop game loop
  useEffect(() => {
    if (!gameLoopRef.current) return

    if (isRunning) {
      gameLoopRef.current.start(
        (deltaTime) => {
          // Update logic
          fpsCounterRef.current++
          fpsTimerRef.current += deltaTime

          if (fpsTimerRef.current >= 1) {
            setFps(fpsCounterRef.current)
            fpsCounterRef.current = 0
            fpsTimerRef.current = 0
          }
        },
        (renderer) => {
          // Render
          renderer.render(scene)
        }
      )
    } else {
      gameLoopRef.current.stop()
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.fillStyle = scene.backgroundColor || '#000000'
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }
  }, [isRunning, scene])

  const handleCanvasClick = () => {
    if (isRunning) {
      onStop()
    }
  }

  return (
    <div className="game-preview">
      <div className="preview-header">
        <span>Game Preview</span>
        <div className="preview-stats">
          <span>{fps} FPS</span>
          {isRunning && <span className="running-indicator">● Running</span>}
        </div>
      </div>
      <div className="preview-container">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
          width={project.settings.canvasWidth}
          height={project.settings.canvasHeight}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  )
}
