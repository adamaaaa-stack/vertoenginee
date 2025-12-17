import { Asset } from '../core/types';

export class AssetManager {
  private assets: Map<string, Asset> = new Map();
  private nextId = 0;

  createAsset(
    name: string,
    type: Asset['type'],
    data?: string,
    url?: string,
    metadata?: Record<string, unknown>
  ): Asset {
    const asset: Asset = {
      id: `asset_${this.nextId++}`,
      name,
      type,
      url,
      data,
      tags: [],
      metadata: metadata || {},
    };
    this.assets.set(asset.id, asset);
    return asset;
  }

  getAsset(assetId: string): Asset | undefined {
    return this.assets.get(assetId);
  }

  deleteAsset(assetId: string): void {
    this.assets.delete(assetId);
  }

  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  getAssetsByType(type: Asset['type']): Asset[] {
    return Array.from(this.assets.values()).filter(a => a.type === type);
  }

  getAssetsByTag(tag: string): Asset[] {
    return Array.from(this.assets.values()).filter(a => a.tags.includes(tag));
  }

  searchAssets(query: string): Asset[] {
    const q = query.toLowerCase();
    return Array.from(this.assets.values()).filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  addTagToAsset(assetId: string, tag: string): void {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);
    if (!asset.tags.includes(tag)) {
      asset.tags.push(tag);
    }
  }

  removeTagFromAsset(assetId: string, tag: string): void {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);
    asset.tags = asset.tags.filter(t => t !== tag);
  }

  updateAssetMetadata(assetId: string, metadata: Partial<Record<string, unknown>>): void {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);
    asset.metadata = { ...asset.metadata, ...metadata };
  }

  // Load image as base64 and create thumbnail
  async createImageAsset(
    name: string,
    file: File,
    tags?: string[]
  ): Promise<Asset> {
    const base64 = await this.fileToBase64(file);
    const thumbnail = await this.createThumbnail(base64);

    const asset: Asset = {
      id: `asset_${this.nextId++}`,
      name,
      type: 'sprite',
      data: base64 as string,
      tags: tags || [],
      metadata: {
        width: 0,
        height: 0,
        mimeType: file.type,
      },
      thumbnail,
    };

    this.assets.set(asset.id, asset);
    return asset;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async createThumbnail(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;

        // Draw scaled image
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }
}
