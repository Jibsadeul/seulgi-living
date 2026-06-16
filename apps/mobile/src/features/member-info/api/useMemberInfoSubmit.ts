import { updateMemberBasicInfo } from '@/entities/members';
import type { MemberBasicInfo, MemberMe } from '@/entities/members';

export async function submitMemberInfo(values: MemberBasicInfo): Promise<MemberMe> {
  return updateMemberBasicInfo(values);
}
