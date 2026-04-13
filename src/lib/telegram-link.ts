
/**
 * @fileOverview Telegram Deep Link Utility.
 * Standardizes links that open the Mini App at a specific product.
 */

export function getProductDeepLink(productId: string): string {
  const botUsername = 'jamastore_aibot';
  const appShortName = 'auralook';
  // Use the verified Telegram URL scheme for Mini Apps
  return `https://t.me/${botUsername}/${appShortName}?startapp=product_${productId}`;
}
