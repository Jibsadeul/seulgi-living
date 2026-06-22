import type { SvgProps } from 'react-native-svg';
import type { IngredientCategory } from '../api/fridge.schema';

import DefaultIcon from '../../../../assets/foods/default.svg';
import EggIcon from '../../../../assets/foods/food-prepared/egg.svg';
import MilkIcon from '../../../../assets/foods/drink/milk.svg';
import RiceIcon from '../../../../assets/foods/food-asian/rice.svg';
import MeatIcon from '../../../../assets/foods/food-prepared/meat.svg';
import BaconIcon from '../../../../assets/foods/food-prepared/bacon.svg';
import CheeseIcon from '../../../../assets/foods/food-prepared/cheese.svg';
import BreadIcon from '../../../../assets/foods/food-prepared/bread.svg';
import OnionIcon from '../../../../assets/foods/food-vegetable/onion.svg';
import GarlicIcon from '../../../../assets/foods/food-vegetable/garlic.svg';
import CarrotIcon from '../../../../assets/foods/food-vegetable/carrot.svg';
import PotatoIcon from '../../../../assets/foods/food-vegetable/potato.svg';
import LettuceIcon from '../../../../assets/foods/food-vegetable/lettuce.svg';
import MushroomIcon from '../../../../assets/foods/food-vegetable/mushroom.svg';
import PepperIcon from '../../../../assets/foods/food-vegetable/pepper.svg';
import BroccoliIcon from '../../../../assets/foods/food-vegetable/broccoli.svg';
import CucumberIcon from '../../../../assets/foods/food-vegetable/cucumber.svg';
import CornIcon from '../../../../assets/foods/food-vegetable/corn.svg';
import TomatoIcon from '../../../../assets/foods/food-fruit/tomato.svg';
import AppleIcon from '../../../../assets/foods/food-fruit/apple.svg';
import BananaIcon from '../../../../assets/foods/food-fruit/banana.svg';
import StrawberryIcon from '../../../../assets/foods/food-fruit/strawberry.svg';
import GrapeIcon from '../../../../assets/foods/food-fruit/grape.svg';
import OrangeIcon from '../../../../assets/foods/food-fruit/orange.svg';
import WatermelonIcon from '../../../../assets/foods/food-fruit/watermelon.svg';
import LemonIcon from '../../../../assets/foods/food-fruit/lemon.svg';
import ShrimpIcon from '../../../../assets/foods/food-asian/shrimptenpura.svg';
import FishcakeIcon from '../../../../assets/foods/food-asian/fishcake.svg';
import SushiIcon from '../../../../assets/foods/food-asian/sushi.svg';
import RamenIcon from '../../../../assets/foods/food-asian/ramen.svg';
import PastaIcon from '../../../../assets/foods/food-asian/pasta.svg';
import DumplingIcon from '../../../../assets/foods/food-asian/dumpling.svg';
import SweetpotatoIcon from '../../../../assets/foods/food-asian/sweetpotato.svg';
import TomatoSauceIcon from '../../../../assets/foods/food-prepared/tomato-sauce.svg';
import HoneyIcon from '../../../../assets/foods/food-sweet/honey.svg';
import AvocadoIcon from '../../../../assets/foods/food-vegetable/avocado.svg';
import BeanIcon from '../../../../assets/foods/food-vegetable/bean.svg';
import RadishIcon from '../../../../assets/foods/food-vegetable/radish.svg';
import GingerIcon from '../../../../assets/foods/food-vegetable/ginger.svg';
import SaladIcon from '../../../../assets/foods/food-prepared/salad.svg';

type CategoryFilter = {
  label: string;
  values: IngredientCategory[];
};

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { label: '전체', values: [] },
  { label: '정육/계란', values: ['MEAT', 'EGG_DAIRY'] },
  { label: '채소', values: ['VEGETABLE'] },
  { label: '유제품', values: ['EGG_DAIRY'] },
  { label: '수산물', values: ['SEAFOOD'] },
  { label: '과일', values: ['FRUIT'] },
  { label: '곡물/면', values: ['GRAIN_NOODLE'] },
  { label: '가공식품', values: ['PROCESSED'] },
  { label: '양념/소스', values: ['SAUCE_SEASONING'] },
  { label: '기타', values: ['OTHER'] },
];

const CATEGORY_LABEL_MAP: Record<IngredientCategory, string> = {
  VEGETABLE: '채소',
  FRUIT: '과일',
  MEAT: '정육',
  SEAFOOD: '수산물',
  EGG_DAIRY: '계란/유제품',
  GRAIN_NOODLE: '곡물/면',
  PROCESSED: '가공식품',
  SAUCE_SEASONING: '양념/소스',
  OTHER: '기타',
};

export function getCategoryLabel(category: IngredientCategory): string {
  return CATEGORY_LABEL_MAP[category];
}

// --- SVG 매핑 ---

type SvgComponent = React.FC<SvgProps>;

const FOOD_ICON_MAP: Record<string, SvgComponent> = {
  egg: EggIcon,
  milk: MilkIcon,
  rice: RiceIcon,
  meat: MeatIcon,
  bacon: BaconIcon,
  cheese: CheeseIcon,
  bread: BreadIcon,
  onion: OnionIcon,
  garlic: GarlicIcon,
  carrot: CarrotIcon,
  potato: PotatoIcon,
  lettuce: LettuceIcon,
  mushroom: MushroomIcon,
  pepper: PepperIcon,
  broccoli: BroccoliIcon,
  cucumber: CucumberIcon,
  corn: CornIcon,
  tomato: TomatoIcon,
  apple: AppleIcon,
  banana: BananaIcon,
  strawberry: StrawberryIcon,
  grape: GrapeIcon,
  orange: OrangeIcon,
  watermelon: WatermelonIcon,
  lemon: LemonIcon,
  shrimp: ShrimpIcon,
  fishcake: FishcakeIcon,
  sushi: SushiIcon,
  ramen: RamenIcon,
  pasta: PastaIcon,
  dumpling: DumplingIcon,
  sweetpotato: SweetpotatoIcon,
  'tomato-sauce': TomatoSauceIcon,
  honey: HoneyIcon,
  avocado: AvocadoIcon,
  bean: BeanIcon,
  radish: RadishIcon,
  ginger: GingerIcon,
  salad: SaladIcon,
  DEFAULT: DefaultIcon,
};

export function getFoodIcon(imageKey: string): SvgComponent {
  return FOOD_ICON_MAP[imageKey] ?? FOOD_ICON_MAP['DEFAULT'];
}

// --- 프리셋 재료 ---

export type PresetIngredient = {
  id: string;
  name: string;
  imageKey: string;
  category: IngredientCategory;
  unit: string;
};

export const PRESET_INGREDIENTS: PresetIngredient[] = [
  // 정육/계란
  { id: 'preset-egg', name: '계란', imageKey: 'egg', category: 'EGG_DAIRY', unit: '개' },
  { id: 'preset-meat', name: '돼지고기', imageKey: 'meat', category: 'MEAT', unit: 'g' },
  { id: 'preset-bacon', name: '베이컨', imageKey: 'bacon', category: 'MEAT', unit: 'g' },
  { id: 'preset-chicken', name: '닭고기', imageKey: 'meat', category: 'MEAT', unit: 'g' },

  // 유제품
  { id: 'preset-milk', name: '우유', imageKey: 'milk', category: 'EGG_DAIRY', unit: 'mL' },
  { id: 'preset-cheese', name: '치즈', imageKey: 'cheese', category: 'EGG_DAIRY', unit: '장' },

  // 채소
  { id: 'preset-onion', name: '양파', imageKey: 'onion', category: 'VEGETABLE', unit: '개' },
  { id: 'preset-garlic', name: '마늘', imageKey: 'garlic', category: 'VEGETABLE', unit: '쪽' },
  { id: 'preset-carrot', name: '당근', imageKey: 'carrot', category: 'VEGETABLE', unit: '개' },
  { id: 'preset-potato', name: '감자', imageKey: 'potato', category: 'VEGETABLE', unit: '개' },
  {
    id: 'preset-sweetpotato',
    name: '고구마',
    imageKey: 'sweetpotato',
    category: 'VEGETABLE',
    unit: '개',
  },
  { id: 'preset-lettuce', name: '상추', imageKey: 'lettuce', category: 'VEGETABLE', unit: '장' },
  { id: 'preset-mushroom', name: '버섯', imageKey: 'mushroom', category: 'VEGETABLE', unit: 'g' },
  { id: 'preset-pepper', name: '고추', imageKey: 'pepper', category: 'VEGETABLE', unit: '개' },
  {
    id: 'preset-broccoli',
    name: '브로콜리',
    imageKey: 'broccoli',
    category: 'VEGETABLE',
    unit: '개',
  },
  { id: 'preset-cucumber', name: '오이', imageKey: 'cucumber', category: 'VEGETABLE', unit: '개' },
  { id: 'preset-corn', name: '옥수수', imageKey: 'corn', category: 'VEGETABLE', unit: '개' },
  { id: 'preset-tomato', name: '토마토', imageKey: 'tomato', category: 'VEGETABLE', unit: '개' },
  {
    id: 'preset-avocado',
    name: '아보카도',
    imageKey: 'avocado',
    category: 'VEGETABLE',
    unit: '개',
  },
  { id: 'preset-bean', name: '콩', imageKey: 'bean', category: 'VEGETABLE', unit: 'g' },
  { id: 'preset-radish', name: '무', imageKey: 'radish', category: 'VEGETABLE', unit: '개' },
  { id: 'preset-ginger', name: '생강', imageKey: 'ginger', category: 'VEGETABLE', unit: 'g' },

  // 과일
  { id: 'preset-apple', name: '사과', imageKey: 'apple', category: 'FRUIT', unit: '개' },
  { id: 'preset-banana', name: '바나나', imageKey: 'banana', category: 'FRUIT', unit: '개' },
  { id: 'preset-strawberry', name: '딸기', imageKey: 'strawberry', category: 'FRUIT', unit: '개' },
  { id: 'preset-grape', name: '포도', imageKey: 'grape', category: 'FRUIT', unit: '송이' },
  { id: 'preset-orange', name: '오렌지', imageKey: 'orange', category: 'FRUIT', unit: '개' },
  { id: 'preset-watermelon', name: '수박', imageKey: 'watermelon', category: 'FRUIT', unit: '개' },
  { id: 'preset-lemon', name: '레몬', imageKey: 'lemon', category: 'FRUIT', unit: '개' },

  // 수산물
  { id: 'preset-shrimp', name: '새우', imageKey: 'shrimp', category: 'SEAFOOD', unit: 'g' },
  { id: 'preset-fishcake', name: '어묵', imageKey: 'fishcake', category: 'SEAFOOD', unit: 'g' },
  { id: 'preset-sushi', name: '회/생선', imageKey: 'sushi', category: 'SEAFOOD', unit: 'g' },

  // 곡물/면
  { id: 'preset-rice', name: '쌀', imageKey: 'rice', category: 'GRAIN_NOODLE', unit: 'g' },
  { id: 'preset-ramen', name: '라면', imageKey: 'ramen', category: 'GRAIN_NOODLE', unit: '개' },
  { id: 'preset-pasta', name: '파스타면', imageKey: 'pasta', category: 'GRAIN_NOODLE', unit: 'g' },
  { id: 'preset-bread', name: '식빵', imageKey: 'bread', category: 'GRAIN_NOODLE', unit: '장' },

  // 가공식품
  { id: 'preset-dumpling', name: '만두', imageKey: 'dumpling', category: 'PROCESSED', unit: '개' },

  // 양념/소스
  {
    id: 'preset-tomato-sauce',
    name: '토마토소스',
    imageKey: 'tomato-sauce',
    category: 'SAUCE_SEASONING',
    unit: 'mL',
  },
  { id: 'preset-honey', name: '꿀', imageKey: 'honey', category: 'SAUCE_SEASONING', unit: 'mL' },
];
