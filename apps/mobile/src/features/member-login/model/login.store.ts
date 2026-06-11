import { create } from 'zustand';

interface LoginState {
  // TODO: 로그인 플로우 중 클라이언트 전용 상태
}

export const useLoginStore = create<LoginState>(() => ({}));
