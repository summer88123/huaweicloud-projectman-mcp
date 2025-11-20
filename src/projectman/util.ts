import { IssueUser } from '@huaweicloud/huaweicloud-sdk-projectman'

export function convertUser(user?: IssueUser): { id: number; name: string } | undefined {
  return user
    ? {
        id: user.id!,
        // @ts-ignore
        name: user.nick_name || user.first_name || user.last_name,
      }
    : undefined
}
