/**
 * @fileOverview Telegram Deep Link Utility.
 * Generates links that open the Mini App at a specific product.
 */

export function getProductDeepLink(productId: string): string {
  const botUsername = 'jamastore_aibot'; // Verified from Home page
  const appShortName = 'app'; // Standard Mini App short name
  return `https://t.me/${botUsername}/${appShortName}?startapp=product_${productId}`;
}
