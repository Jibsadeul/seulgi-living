import type { MemberMe } from '@/entities/members';

export type MemberInfoMode = 'onboarding' | 'edit';

export type MemberInfoFormValues = {
  nickname: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  sidoId: string;
  sigunguId: string;
};

export type NicknameCheckState = 'idle' | 'checking' | 'available' | 'unavailable';

export type MemberInfoSubmitResult = MemberMe;
