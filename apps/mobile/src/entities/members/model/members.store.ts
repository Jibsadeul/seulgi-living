import { create } from 'zustand';
import type { MemberMe } from './type';

export type MemberProfileState = Pick<MemberMe, 'nickname' | 'birthday' | 'sidoId' | 'sigunguId'>;

interface MemberStoreState extends MemberProfileState {
  setMemberProfile: (profile: MemberProfileState) => void;
  setMemberProfileFromMe: (member: MemberMe) => void;
  clearMemberProfile: () => void;
}

const emptyMemberProfile: MemberProfileState = {
  nickname: null,
  birthday: null,
  sidoId: null,
  sigunguId: null,
};

export const useMemberStore = create<MemberStoreState>((set) => ({
  ...emptyMemberProfile,

  setMemberProfile: (profile) => set(profile),

  setMemberProfileFromMe: ({ nickname, birthday, sidoId, sigunguId }) =>
    set({
      nickname,
      birthday,
      sidoId,
      sigunguId,
    }),

  clearMemberProfile: () => set(emptyMemberProfile),
}));
