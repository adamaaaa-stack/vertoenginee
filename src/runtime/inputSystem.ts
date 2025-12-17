import { Vector2 } from '../utils/math'

export interface InputEvent {
  type: 'pointerDown' | 'pointerUp' | 'keyDown' | 'keyUp' | 'update'
  pointerPosition?: Vector2
  key?: string
  deltaTime?: number
}

export type InputListener = (event: InputEvent) => void

export class InputSystem {
  private listeners: Set<InputListener> = new Set()
  private keysPressed: Set<string> = new Set()
  private pointerPosition: Vector2 = { x: 0, y: 0 }
  private canvas: HTMLCanvasElement | null = null

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || null
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e))
      this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e))
      this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e))
    }

    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
    document.addEventListener('keyup', (e) => this.handleKeyUp(e))
  }

  private handlePointerDown(e: PointerEvent): void {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.pointerPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    this.emit({
      type: 'pointerDown',
      pointerPosition: { ...this.pointerPosition },
    })
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.pointerPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    this.emit({
      type: 'pointerUp',
      pointerPosition: { ...this.pointerPosition },
    })
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.pointerPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    if (!this.keysPressed.has(key)) {
      this.keysPressed.add(key)
      this.emit({
        type: 'keyDown',
        key,
      })
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    this.keysPressed.delete(key)
    this.emit({
      type: 'keyUp',
      key,
    })
  }

  subscribe(listener: InputListener): void {
    this.listeners.add(listener)
  }

  unsubscribe(listener: InputListener): void {
    this.listeners.delete(listener)
  }

  private emit(event: InputEvent): void {
    for (const listener of this.listeners) {
      listener(event)
    }
  }

  update(deltaTime: number): void {
    this.emit({
      type: 'update',
      deltaTime,
      pointerPosition: { ...this.pointerPosition },
    })
  }

  getPointerPosition(): Vector2 {
    return { ...this.pointerPosition }
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase())
  }

  getAllKeysPressed(): string[] {
    return Array.from(this.keysPressed)
  }

  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', (e) => this.handlePointerDown(e))
      this.canvas.removeEventListener('pointerup', (e) => this.handlePointerUp(e))
      this.canvas.removeEventListener('pointermove', (e) => this.handlePointerMove(e))
    }
    document.removeEventListener('keydown', (e) => this.handleKeyDown(e))
    document.removeEventListener('keyup', (e) => this.handleKeyUp(e))
    this.listeners.clear()
  }
}
