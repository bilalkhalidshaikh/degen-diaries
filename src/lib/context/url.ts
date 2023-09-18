// utils/url.ts
export function getValidUrl(address: string | null): string {
  if (address) {
    return `https://source.boringavatars.com/${address}`;
  }
  return 'https://source.boringavatars.com/default'; // replace 'default' with a valid endpoint if available
}
