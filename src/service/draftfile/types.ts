import * as googleApi from '@app/google'

export type FileDetails = googleApi.FileDetails

export type DraftFileDetails = FileDetails & {
  isNew: boolean
}
