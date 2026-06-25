import HouseIcon from '@assets/icons/policy-banner/house.svg';
import JobIcon from '@assets/icons/policy-banner/job.svg';
import FinanceIcon from '@assets/icons/policy-banner/fiance.svg';
import WelfareIcon from '@assets/icons/policy-banner/welfare.svg';
import EducationIcon from '@assets/icons/policy-banner/edu.svg';
import CultureIcon from '@assets/icons/policy-banner/culture.svg';
import ParticipationIcon from '@assets/icons/policy-banner/participation.svg';

type BannerIcon = React.ComponentType<{ width: number; height: number }>;

// largeCategory는 복합 문자열("금융·복지·문화")일 수 있어, 우선순위 순서로 첫 매칭되는 카테고리 하나를 대표로 고른다.
// policyCategoryStyle.ts와 동일한 우선순위 — 배너 일러스트는 색상 없이 FFEBDC로 통일한 버전만 사용한다.
const BANNER_ICONS: { keyword: string; Icon: BannerIcon }[] = [
  { keyword: '주거', Icon: HouseIcon },
  { keyword: '일자리', Icon: JobIcon },
  { keyword: '금융', Icon: FinanceIcon },
  { keyword: '복지', Icon: WelfareIcon },
  { keyword: '교육', Icon: EducationIcon },
  { keyword: '문화', Icon: CultureIcon },
  { keyword: '참여', Icon: ParticipationIcon },
];

const DEFAULT_BANNER_ICON: BannerIcon = HouseIcon;

export function getBannerIllustration(largeCategory: string | null | undefined): BannerIcon {
  if (!largeCategory) return DEFAULT_BANNER_ICON;

  const matched = BANNER_ICONS.find(({ keyword }) => largeCategory.includes(keyword));
  return matched?.Icon ?? DEFAULT_BANNER_ICON;
}
