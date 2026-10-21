import type { FileDetails } from '@app/storage'

export type DraftFileDetails = FileDetails & {
  isNew: boolean
}
