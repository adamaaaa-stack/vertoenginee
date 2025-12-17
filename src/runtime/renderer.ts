import { Scene, Entity, Component } from '../core/types'
import { Vector2 } from '../utils/math'

interface RenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  deltaTime: number
  frameCount: number
}

export class Renderer2D {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private renderContext: RenderContext

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.setupCanvas()
    this.renderContext = {
      canvas,
      ctx: this.ctx,
      deltaTime: 0,
      frameCount: 0,
    }
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
  }

  render(scene: Scene, deltaTime: number = 0): void {
    this.renderContext.deltaTime = deltaTime
    this.renderContext.frameCount++

    // Clear canvas
    this.ctx.fillStyle = scene.backgroundColor || '#000000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw all entities
    for (const entity of scene.entities) {
      if (entity.active) {
        this.renderEntity(entity)
      }
    }
  }

  private renderEntity(entity: Entity): void {
    const transformComponent = entity.components.find(c => c.type === 'Transform')
    if (!transformComponent) return

    const x = (transformComponent.properties.x as number) || 0
    const y = (transformComponent.properties.y as number) || 0
    const scaleX = (transformComponent.properties.scaleX as number) || 1
    const scaleY = (transformComponent.properties.scaleY as number) || 1
    const rotation = (transformComponent.properties.rotation as number) || 0

    // Save context state
    this.ctx.save()

    // Apply transforms
    this.ctx.translate(x, y)
    if (rotation !== 0) {
      this.ctx.rotate((rotation * Math.PI) / 180)
    }
    this.ctx.scale(scaleX, scaleY)

    // Render sprite
    const spriteComponent = entity.components.find(c => c.type === 'SpriteRenderer')
    if (spriteComponent) {
      this.renderSprite(spriteComponent)
    }

    // Render UI
    const uiComponent = entity.components.find(c => c.type === 'UIElement')
    if (uiComponent) {
      this.renderUI(uiComponent)
    }

    // Restore context
    this.ctx.restore()

    // Render collider for debug
    const colliderComponent = entity.components.find(c => c.type === 'Collider')
    if (colliderComponent && (colliderComponent.properties.debug as boolean)) {
      this.renderCollider(x, y, colliderComponent)
    }
  }

  private renderSprite(component: Component): void {
    const width = (component.properties.width as number) || 32
    const height = (component.properties.height as number) || 32
    const color = (component.properties.color as string) || '#FFFFFF'
    const assetData = component.properties.assetData

    if (assetData && typeof assetData === 'string') {
      // Draw image
      const img = new Image()
      img.onload = () => {
        this.ctx.drawImage(img, -width / 2, -height / 2, width, height)
      }
      img.src = assetData
    } else {
      // Draw placeholder rectangle
      this.ctx.fillStyle = color
      this.ctx.fillRect(-width / 2, -height / 2, width, height)
      this.ctx.strokeStyle = '#CCCCCC'
      this.ctx.lineWidth = 1
      this.ctx.strokeRect(-width / 2, -height / 2, width, height)
    }
  }

  private renderUI(component: Component): void {
    const text = (component.properties.text as string) || ''
    const fontSize = (component.properties.fontSize as number) || 16
    const color = (component.properties.color as string) || '#FFFFFF'

    if (text) {
      this.ctx.fillStyle = color
      this.ctx.font = `${fontSize}px Arial`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(text, 0, 0)
    }
  }

  private renderCollider(x: number, y: number, component: Component): void {
    const width = (component.properties.width as number) || 32
    const height = (component.properties.height as number) || 32

    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x - width / 2, y - height / 2, width, height)
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  clear(): void {
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

export class GameLoop {
  private renderer: Renderer2D
  private isRunning: boolean = false
  private frameCount: number = 0
  private deltaTime: number = 0
  private lastFrameTime: number = 0
  private targetFPS: number = 60
  private frameTime: number = 1000 / 60

  constructor(canvas: HTMLCanvasElement, targetFPS?: number) {
    this.renderer = new Renderer2D(canvas)
    if (targetFPS) {
      this.targetFPS = targetFPS
      this.frameTime = 1000 / targetFPS
    }
  }

  start(updateFn: (deltaTime: number) => void, renderFn: (renderer: Renderer2D) => void): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastFrameTime = performance.now()

    const loop = (currentTime: number) => {
      if (!this.isRunning) return

      // Calculate delta time
      this.deltaTime = (currentTime - this.lastFrameTime) / 1000
      this.lastFrameTime = currentTime
      this.frameCount++

      // Update
      updateFn(this.deltaTime)

      // Render
      renderFn(this.renderer)

      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }

  stop(): void {
    this.isRunning = false
  }

  getFrameCount(): number {
    return this.frameCount
  }

  getDeltaTime(): number {
    return this.deltaTime
  }

  getRenderer(): Renderer2D {
    return this.renderer
  }
}
