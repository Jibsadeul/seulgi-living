// 임시 호스팅(Netlify Drop). main 머지 후 GitHub Pages로 전환 예정 (SHARE-005, local/decisions/share.md)
const SHARE_LANDING_BASE_URL = 'https://quiet-chebakia-77abfa.netlify.app/';

type ShareDomain = 'policies';

export function buildShareLandingUrl(domain: ShareDomain, id: string): string {
  return `${SHARE_LANDING_BASE_URL}?domain=${domain}&id=${id}`;
}
