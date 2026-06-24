import HouseIcon from '@assets/icons/policy-scrap/house.svg';
import JobIcon from '@assets/icons/policy-scrap/job.svg';
import FinanceIcon from '@assets/icons/policy-scrap/fiance.svg';
import WelfareIcon from '@assets/icons/policy-scrap/welfare.svg';
import EducationIcon from '@assets/icons/policy-scrap/edu.svg';
import CultureIcon from '@assets/icons/policy-scrap/culture.svg';
import ParticipationIcon from '@assets/icons/policy-scrap/participation.svg';

type CategoryStyle = {
  Icon: React.ComponentType<{ width: number; height: number }> | null;
  bg: string;
  accent: string;
};

// largeCategory는 복합 문자열("금융·복지·문화")일 수 있어, 우선순위 순서로 첫 매칭되는 카테고리 하나를 대표로 고른다.
const CATEGORY_STYLES: { keyword: string; style: CategoryStyle }[] = [
  { keyword: '주거', style: { Icon: HouseIcon, bg: '#E9EFFF', accent: '#3B309E' } },
  { keyword: '일자리', style: { Icon: JobIcon, bg: '#E1F5EE', accent: '#355E3B' } },
  { keyword: '금융', style: { Icon: FinanceIcon, bg: '#FAEEDA', accent: '#9C4400' } },
  { keyword: '복지', style: { Icon: WelfareIcon, bg: '#FFE2E5', accent: '#ED3241' } },
  { keyword: '교육', style: { Icon: EducationIcon, bg: '#FFF4D9', accent: '#FFAB00' } },
  { keyword: '문화', style: { Icon: CultureIcon, bg: '#F3E8FF', accent: '#7C3AED' } },
  { keyword: '참여', style: { Icon: ParticipationIcon, bg: '#E0F7FA', accent: '#0E7490' } },
];

const DEFAULT_CATEGORY_STYLE: CategoryStyle = { Icon: null, bg: '#F0F0F0', accent: '#757575' };

export function getCategoryStyle(largeCategory: string | null | undefined): CategoryStyle {
  if (!largeCategory) return DEFAULT_CATEGORY_STYLE;

  const matched = CATEGORY_STYLES.find(({ keyword }) => largeCategory.includes(keyword));
  return matched?.style ?? DEFAULT_CATEGORY_STYLE;
}
