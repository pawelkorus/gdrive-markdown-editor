export interface StateFromGoogle {
  action: StateFromGoogleAction
  fileId: string | undefined
  userId: string
  folderId: string | undefined
  folderResourceKey: string | undefined
}

export enum StateFromGoogleAction {
  New,
  Open,
  Install,
  Unsupported,
}

export function parseGoogleState(): StateFromGoogle {
  const searchParams = new URLSearchParams(window.location.search)
  const searchParamsState = searchParams.get('state')

  // https://developers.google.com/drive/api/guides/integrate-open
  const state = searchParamsState ? JSON.parse(searchParamsState) : null
  if (state == null) {
    return {
      action: StateFromGoogleAction.Install,
      fileId: '',
      userId: '',
      folderId: undefined,
      folderResourceKey: undefined,
    }
  }

  let action = StateFromGoogleAction.Unsupported
  if (state['action'] == 'open') action = StateFromGoogleAction.Open
  if (state['action'] == 'new') action = StateFromGoogleAction.New
  if (state['action'] == 'create') action = StateFromGoogleAction.New

  const userId = state['userId']

  switch (action) {
    case StateFromGoogleAction.Open: {
      const fileIds = state['ids'] as Array<string>
      if (action == StateFromGoogleAction.Open && fileIds.length != 1) throw Error('Invalid state parameter: to many file ids')

      return {
        action: action,
        fileId: fileIds ? fileIds[0] : undefined,
        userId: userId,
        folderId: undefined,
        folderResourceKey: undefined,
      }
    }
    case StateFromGoogleAction.New: {
      const folderId = state['folderId'] as string
      if (!folderId) throw Error('Can\'t create new file. Destination folder not specified')

      const folderResourceKey = state['folderResourceKey'] as string

      return {
        action: action,
        fileId: undefined,
        userId: userId,
        folderId: folderId,
        folderResourceKey: folderResourceKey,
      }
    }
    default: {
      return {
        action: action,
        fileId: undefined,
        userId: userId,
        folderId: undefined,
        folderResourceKey: undefined,
      }
    }
  }
}
