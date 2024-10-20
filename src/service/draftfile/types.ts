import * as googleApi from '../../google'

export type FileDetails = googleApi.FileDetails

export type DraftFileDetails = FileDetails & {
  isNew: boolean
}
