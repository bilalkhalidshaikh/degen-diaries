// utils/url.ts
export function getValidUrl(address: string | null): string {
  if (address) {
    // Convert the address to a hash (e.g., using MD5) if needed
    return `https://www.gravatar.com/avatar/${address}?d=identicon`;
  }
  return 'https://www.gravatar.com/avatar/?d=mp'; // 'mp' stands for Mystery Person, a default Gravatar image
}
