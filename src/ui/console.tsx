import React, { useEffect, useRef } from 'react'
import './console.css'

interface ConsoleProps {
  messages: Array<{ type: string; message: string }>
}

export default function Console({ messages }: ConsoleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="console">
      <div className="console-header">
        Console
        <button
          onClick={() => {
            // Clear console
          }}
          className="console-clear"
          title="Clear"
        >
          🗑️
        </button>
      </div>
      <div className="console-output">
        {messages.map((msg, i) => (
          <div key={i} className={`console-line ${msg.type}`}>
            <span className="console-prefix">[{msg.type.toUpperCase()}]</span>
            <span className="console-text">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
