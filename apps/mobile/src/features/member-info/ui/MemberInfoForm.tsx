import { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { MemberMe } from '@/entities/members';
import { birthDays, birthMonths, birthYears, useMemberInfoForm } from '../model/useMemberInfoForm';
import type { MemberInfoMode } from '../model/type';
import { SelectField } from './SelectField';

type Props = {
  mode: MemberInfoMode;
  initialMember: MemberMe | null;
  onCanCloseChange: (canClose: boolean) => void;
  onSubmitSuccess: (member: MemberMe) => void;
};

const toOptions = (items: string[]) => items.map((item) => ({ label: item, value: item }));

export function MemberInfoForm({ mode, initialMember, onCanCloseChange, onSubmitSuccess }: Props) {
  const form = useMemberInfoForm(initialMember);

  useEffect(() => {
    onCanCloseChange(mode === 'edit' ? form.canClose : false);
  }, [form.canClose, mode, onCanCloseChange]);

  const nicknameButtonDisabled =
    form.nicknameState === 'checking' ||
    form.values.nickname.trim().length < 2 ||
    form.values.nickname.trim().length >= 100;

  const nicknameButtonLabel = form.nicknameState === 'checking' ? '확인 중' : '중복 확인';

  return (
    <View className="gap-5">
      <View>
        <Text className="mb-2 text-xs font-semibold text-gray-70">닉네임</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="h-12 flex-1 rounded-lg border border-gray-30 bg-white px-3 text-sm text-gray-90"
            maxLength={99}
            placeholder="닉네임 입력"
            placeholderTextColor="#9CA3AF"
            value={form.values.nickname}
            onChangeText={form.updateNickname}
          />
          <Pressable
            className={`h-12 min-w-[86px] items-center justify-center rounded-lg px-3 ${
              nicknameButtonDisabled ? 'bg-gray-20' : 'bg-main-100'
            }`}
            disabled={nicknameButtonDisabled}
            onPress={form.confirmNickname}
          >
            <Text
              className={`text-xs font-bold ${nicknameButtonDisabled ? 'text-gray-50' : 'text-white'}`}
            >
              {nicknameButtonLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text className="mb-3 text-sm font-bold text-gray-90">생년월일</Text>
        <View className="flex-row gap-2">
          <SelectField
            label="년"
            placeholder="년"
            value={form.values.birthYear}
            options={toOptions(birthYears)}
            onChange={(value) => form.updateField('birthYear', value)}
          />
          <SelectField
            label="월"
            placeholder="월"
            value={form.values.birthMonth}
            options={toOptions(birthMonths)}
            onChange={(value) => form.updateField('birthMonth', value)}
          />
          <SelectField
            label="일"
            placeholder="일"
            value={form.values.birthDay}
            options={toOptions(birthDays)}
            onChange={(value) => form.updateField('birthDay', value)}
          />
        </View>
      </View>

      <View>
        <Text className="mb-3 text-sm font-bold text-gray-90">거주지</Text>
        <View className="flex-row gap-2">
          <SelectField
            label="시/도"
            placeholder="시/도"
            value={form.values.sidoId}
            options={form.sidoList.map((sido) => ({ label: sido.name, value: sido.id }))}
            onChange={(value) => form.updateField('sidoId', value)}
          />
          <SelectField
            label="시/군/구"
            placeholder={form.isRegionLoading ? '조회 중' : '시/군/구'}
            value={form.values.sigunguId}
            disabled={!form.values.sidoId || form.isRegionLoading}
            options={form.sigunguList.map((sigungu) => ({
              label: sigungu.name,
              value: sigungu.id,
            }))}
            onChange={(value) => form.updateField('sigunguId', value)}
          />
        </View>
      </View>

      {form.message ? (
        <Text className="text-xs font-medium text-main-100">{form.message}</Text>
      ) : null}

      <Pressable
        className={`h-13 items-center justify-center rounded-lg ${
          form.canSubmit ? 'bg-main-100' : 'bg-gray-20'
        }`}
        disabled={!form.canSubmit}
        onPress={async () => {
          const result = await form.submit();
          if (result) {
            onSubmitSuccess(result);
          }
        }}
      >
        <Text className={`text-sm font-bold ${form.canSubmit ? 'text-white' : 'text-gray-50'}`}>
          {form.isSubmitting ? '저장 중' : '저장'}
        </Text>
      </Pressable>
    </View>
  );
}
