import fs from 'fs';
import path from 'path';

/**
 * Simple file-based registry to store charity images
 * Maps charityId/walletAddress to image URLs
 */

interface ImageRegistry {
  [key: string]: string[]; // key can be charityId or walletAddress
}

const REGISTRY_FILE = path.join(__dirname, '../../charity-images.json');

class CharityImageRegistry {
  private registry: ImageRegistry = {};

  constructor() {
    this.loadRegistry();
  }

  /**
   * Load registry from file
   */
  private loadRegistry() {
    try {
      if (fs.existsSync(REGISTRY_FILE)) {
        const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
        this.registry = JSON.parse(data);
        console.log(`📂 Loaded ${Object.keys(this.registry).length} charity image records`);
      }
    } catch (error) {
      console.error('Error loading image registry:', error);
      this.registry = {};
    }
  }

  /**
   * Save registry to file
   */
  private saveRegistry() {
    try {
      fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.registry, null, 2));
    } catch (error) {
      console.error('Error saving image registry:', error);
    }
  }

  /**
   * Store images for a wallet address (before charity is registered)
   */
  storeImagesByWallet(walletAddress: string, imageUrls: string[]) {
    const key = `wallet_${walletAddress.toLowerCase()}`;
    this.registry[key] = imageUrls;
    this.saveRegistry();
    console.log(`✅ Stored ${imageUrls.length} images for wallet ${walletAddress}`);
  }

  /**
   * Get images by wallet address
   */
  getImagesByWallet(walletAddress: string): string[] | null {
    const key = `wallet_${walletAddress.toLowerCase()}`;
    return this.registry[key] || null;
  }

  /**
   * Move images from wallet to charityId (after registration)
   */
  moveToCharityId(walletAddress: string, charityId: number, imageUrls: string[]) {
    const walletKey = `wallet_${walletAddress.toLowerCase()}`;
    const charityKey = `charity_${charityId}`;

    // Store under charity ID
    this.registry[charityKey] = imageUrls;

    // Remove wallet entry
    delete this.registry[walletKey];

    this.saveRegistry();
    console.log(`✅ Moved ${imageUrls.length} images from wallet to charity ID ${charityId}`);
  }

  /**
   * Get images by charity ID
   */
  getImagesByCharityId(charityId: number): string[] | null {
    const key = `charity_${charityId}`;
    return this.registry[key] || null;
  }

  /**
   * Store images directly by charity ID
   */
  storeImagesByCharityId(charityId: number, imageUrls: string[]) {
    const key = `charity_${charityId}`;
    this.registry[key] = imageUrls;
    this.saveRegistry();
    console.log(`✅ Stored ${imageUrls.length} images for charity ID ${charityId}`);
  }
}

// Export singleton instance
export const charityImageRegistry = new CharityImageRegistry();
