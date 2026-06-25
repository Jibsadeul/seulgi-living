import { useEffect, useMemo, useState } from 'react';
import {
  checkNickname,
  memberBasicInfoSchema,
  type MemberMe,
  type MemberProfileState,
  useMemberStore,
} from '@/entities/members';
import { getSidoList, getSigunguList, type Sido, type Sigungu } from '@/entities/regions';
import { submitMemberInfo } from '../api/useMemberInfoSubmit';
import type { MemberInfoFormValues, MemberInfoSubmitResult, NicknameCheckState } from './type';

const CURRENT_YEAR = new Date().getFullYear();

export const birthYears = Array.from({ length: CURRENT_YEAR - 1939 }, (_, index) =>
  String(CURRENT_YEAR - index),
);
export const birthMonths = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
);
export const birthDays = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
);

const toInitialValues = (initialMember: MemberMe | null): MemberInfoFormValues => {
  const [birthYear = '', birthMonth = '', birthDay = ''] =
    initialMember?.birthday?.split('-') ?? [];

  return {
    nickname: initialMember?.nickname ?? '',
    birthYear,
    birthMonth,
    birthDay,
    sidoId: initialMember?.sidoId ?? '',
    sigunguId: initialMember?.sigunguId ?? '',
  };
};

const normalizeProfileValue = (value: string | null) => value || null;

export function useMemberInfoForm(initialMember: MemberMe | null) {
  const storedNickname = useMemberStore((state) => state.nickname);
  const storedBirthday = useMemberStore((state) => state.birthday);
  const storedSidoId = useMemberStore((state) => state.sidoId);
  const storedSigunguId = useMemberStore((state) => state.sigunguId);
  const [values, setValues] = useState<MemberInfoFormValues>(() => toInitialValues(initialMember));
  const [sidoList, setSidoList] = useState<Sido[]>([]);
  const [sigunguList, setSigunguList] = useState<Sigungu[]>([]);
  const [nicknameState, setNicknameState] = useState<NicknameCheckState>(
    initialMember?.nickname ? 'available' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isRegionLoading, setIsRegionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(toInitialValues(initialMember));
    setNicknameState(initialMember?.nickname ? 'available' : 'idle');
    setMessage(null);
    setMessageType(null);
  }, [initialMember]);

  useEffect(() => {
    let isMounted = true;

    getSidoList().then((items) => {
      if (isMounted) {
        setSidoList(items);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!values.sidoId) {
      setSigunguList([]);
      return;
    }

    setIsRegionLoading(true);
    getSigunguList(values.sidoId)
      .then((items) => {
        if (isMounted) {
          setSigunguList(items);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRegionLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [values.sidoId]);

  const birthday = useMemo(() => {
    if (!values.birthYear || !values.birthMonth || !values.birthDay) {
      return '';
    }

    return `${values.birthYear}-${values.birthMonth}-${values.birthDay}`;
  }, [values.birthDay, values.birthMonth, values.birthYear]);

  const hasBlankRequiredField = useMemo(
    () =>
      !values.nickname.trim() ||
      !values.birthYear ||
      !values.birthMonth ||
      !values.birthDay ||
      !values.sidoId ||
      !values.sigunguId,
    [
      values.birthDay,
      values.birthMonth,
      values.birthYear,
      values.nickname,
      values.sidoId,
      values.sigunguId,
    ],
  );

  const currentProfile = useMemo<MemberProfileState>(
    () => ({
      nickname: normalizeProfileValue(values.nickname.trim()),
      birthday: normalizeProfileValue(birthday),
      sidoId: normalizeProfileValue(values.sidoId),
      sigunguId: normalizeProfileValue(values.sigunguId),
    }),
    [birthday, values.nickname, values.sidoId, values.sigunguId],
  );

  const baselineProfile = useMemo<MemberProfileState>(
    () => ({
      nickname: storedNickname ?? initialMember?.nickname ?? null,
      birthday: storedBirthday ?? initialMember?.birthday ?? null,
      sidoId: storedSidoId ?? initialMember?.sidoId ?? null,
      sigunguId: storedSigunguId ?? initialMember?.sigunguId ?? null,
    }),
    [
      initialMember?.birthday,
      initialMember?.nickname,
      initialMember?.sidoId,
      initialMember?.sigunguId,
      storedBirthday,
      storedNickname,
      storedSidoId,
      storedSigunguId,
    ],
  );

  const isDirtyFromStoredProfile = useMemo(
    () =>
      currentProfile.nickname !== baselineProfile.nickname ||
      currentProfile.birthday !== baselineProfile.birthday ||
      currentProfile.sidoId !== baselineProfile.sidoId ||
      currentProfile.sigunguId !== baselineProfile.sigunguId,
    [baselineProfile, currentProfile],
  );

  const parsedInfo = useMemo(
    () =>
      memberBasicInfoSchema.safeParse({
        nickname: values.nickname.trim(),
        birthday,
        sidoId: values.sidoId,
        sigunguId: values.sigunguId,
      }),
    [birthday, values.nickname, values.sidoId, values.sigunguId],
  );

  const canSubmit = parsedInfo.success && nicknameState === 'available' && !isSubmitting;

  const updateNickname = (nickname: string) => {
    setValues((current) => ({ ...current, nickname }));
    setMessage(null);
    setMessageType(null);
    setNicknameState(nickname.trim() === initialMember?.nickname ? 'available' : 'idle');
  };

  const updateField = (key: keyof MemberInfoFormValues, value: string) => {
    setValues((current) => {
      if (key === 'sidoId') {
        return { ...current, sidoId: value, sigunguId: '' };
      }

      return { ...current, [key]: value };
    });
    setMessage(null);
    setMessageType(null);
  };

  const confirmNickname = async () => {
    const nicknameParseResult = memberBasicInfoSchema.shape.nickname.safeParse(
      values.nickname.trim(),
    );

    if (!nicknameParseResult.success) {
      setMessage(nicknameParseResult.error.errors[0]?.message ?? '닉네임을 확인해주세요.');
      setMessageType('error');
      return;
    }

    setNicknameState('checking');
    const result = await checkNickname(values.nickname, initialMember?.nickname);
    setNicknameState(result.available ? 'available' : 'unavailable');
    setMessage(result.available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
    setMessageType(result.available ? 'success' : 'error');
  };

  const submit = async (): Promise<MemberInfoSubmitResult | null> => {
    if (!parsedInfo.success || nicknameState !== 'available') {
      setMessage('입력값과 닉네임 중복 확인을 완료해주세요.');
      setMessageType('error');
      return null;
    }

    setIsSubmitting(true);
    setMessage(null);
    setMessageType(null);

    try {
      const result = await submitMemberInfo(parsedInfo.data);
      return result;
    } catch {
      setMessage('저장에 실패했습니다. 다시 시도해주세요.');
      setMessageType('error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    sidoList,
    sigunguList,
    nicknameState,
    message,
    messageType,
    isRegionLoading,
    isSubmitting,
    canSubmit,
    currentProfile,
    hasBlankRequiredField,
    isDirtyFromStoredProfile,
    updateNickname,
    updateField,
    confirmNickname,
    submit,
  };
}
