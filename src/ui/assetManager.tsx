import React, { useRef } from 'react'
import { Project } from '../core/types'
import { AssetManager as AssetManagerClass } from '../assets/manager'
import './assetManager.css'

interface AssetManagerProps {
  project: Project
  setProject: (project: Project) => void
}

export default function AssetManager({ project, setProject }: AssetManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of files) {
      const assetManager = new AssetManagerClass()

      try {
        const asset = await assetManager.createImageAsset(file.name.replace(/\.[^.]+$/, ''), file)
        setProject({
          ...project,
          assets: [...project.assets, asset]
        })
      } catch (error) {
        console.error('Failed to import asset:', error)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAsset = (assetId: string) => {
    setProject({
      ...project,
      assets: project.assets.filter(a => a.id !== assetId)
    })
  }

  return (
    <div className="asset-manager">
      <div className="manager-header">
        <div>Assets</div>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import asset"
          className="import-button"
        >
          +
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      <div className="asset-list">
        {project.assets.map((asset) => (
          <div key={asset.id} className="asset-item">
            {asset.thumbnail ? (
              <img src={asset.thumbnail} alt={asset.name} className="asset-thumbnail" />
            ) : (
              <div className="asset-placeholder">📦</div>
            )}
            <div className="asset-info">
              <div className="asset-name">{asset.name}</div>
              <div className="asset-type">{asset.type}</div>
            </div>
            <button
              onClick={() => handleDeleteAsset(asset.id)}
              className="delete-button"
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}

        {project.assets.length === 0 && (
          <div className="empty-state">
            No assets. Click + to import.
          </div>
        )}
      </div>
    </div>
  )
}
