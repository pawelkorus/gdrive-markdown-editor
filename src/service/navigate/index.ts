import { useNavigate as useReactRouterNavigate, useSearchParams } from 'react-router-dom'

type UseNavigateAPI = {
  navigateToHome: () => void
  navigateToFileView: (params?: NavigateToFileParams) => void
  navigateToFileEdit: (params?: NavigateToEditFileParams) => void
  navigateToFileSource: (params?: NavigateToFileParams) => void
  navigateToFileDrafts: (params?: NavigateToFileParams) => void
  navigateToNewFile: (params: NavigateToNewFileParams) => void
}

type NavigateToFileParams = {
  fileId: string
  userId?: string
  resourceKey?: string
}

type NavigateToEditFileParams = NavigateToFileParams & {
  draftId?: string
}

type NavigateToNewFileParams = {
  folderId: string
}

type ParamsFromURL = {
  paramsFileView: () => NavigateToFileParams
  paramsFileEdit: () => NavigateToEditFileParams
}

export function useFileParams(): NavigateToFileParams | undefined {
  const [searchParams] = useSearchParams()
  const fileId = searchParams.get('fileId')
  const userId = searchParams.get('userId')
  const resourceKey = searchParams.get('resourceKey')

  if (fileId) {
    return { fileId, userId, resourceKey }
  }
}

export function useParamsFromURL(): ParamsFromURL {
  const [searchParams] = useSearchParams()

  const paramsFileView = (): NavigateToFileParams | undefined => {
    const fileId = searchParams.get('fileId')
    const userId = searchParams.get('userId')
    const resourceKey = searchParams.get('resourceKey')

    if (fileId) {
      return { fileId, userId, resourceKey }
    }
  }

  const paramsFileEdit = (): NavigateToEditFileParams => {
    const fileId = searchParams.get('fileId')
    if (!fileId) {
      throw new Error('fileId is required')
    }
    const userId = searchParams.get('userId')
    const resourceKey = searchParams.get('resourceKey')
    const draftId = searchParams.get('draftId')

    return { fileId, userId, resourceKey, draftId }
  }

  return {
    paramsFileView,
    paramsFileEdit,
  }
}

export function useNavigateTo(): UseNavigateAPI {
  const navigate = useReactRouterNavigate()
  const {
    paramsFileEdit,
    paramsFileView,
  } = useParamsFromURL()

  const navigateToHome = () => {
    navigate('/')
  }

  const navigateToFileView = (params: NavigateToFileParams | undefined) => {
    if (!params) params = paramsFileView()

    const { fileId, userId, resourceKey } = params
    const searchParams = new URLSearchParams()
    searchParams.set('fileId', fileId)

    if (userId) {
      searchParams.set('userId', userId)
    }
    if (resourceKey) {
      searchParams.set('resourceKey', resourceKey)
    }

    navigate(`/file?${searchParams.toString()}`)
  }

  const navigateToFileEdit = (params: NavigateToEditFileParams | undefined) => {
    if (!params) params = paramsFileEdit()

    const { fileId, userId, resourceKey, draftId } = params
    const searchParams = new URLSearchParams()
    searchParams.set('fileId', fileId)

    if (userId) {
      searchParams.set('userId', userId)
    }
    if (resourceKey) {
      searchParams.set('resourceKey', resourceKey)
    }
    if (draftId) {
      searchParams.set('draftId', draftId)
    }

    navigate(`/file/edit?${searchParams.toString()}`)
  }

  const navigateToFileSource = (params: NavigateToFileParams | undefined) => {
    if (!params) params = paramsFileView()

    const { fileId, userId, resourceKey } = params
    const searchParams = new URLSearchParams()
    searchParams.set('fileId', fileId)

    if (userId) {
      searchParams.set('userId', userId)
    }
    if (resourceKey) {
      searchParams.set('resourceKey', resourceKey)
    }

    navigate(`/file/source?${searchParams.toString()}`)
  }

  const navigateToFileDrafts = (params: NavigateToFileParams | undefined) => {
    if (!params) params = paramsFileView()

    const { fileId, userId, resourceKey } = params
    const searchParams = new URLSearchParams()
    searchParams.set('fileId', fileId)

    if (userId) {
      searchParams.set('userId', userId)
    }
    if (resourceKey) {
      searchParams.set('resourceKey', resourceKey)
    }

    navigate(`/file/drafts?${searchParams.toString()}`)
  }

  const navigateToNewFile = ({ folderId }: NavigateToNewFileParams) => {
    const searchParams = new URLSearchParams()
    searchParams.set('folderId', folderId)
    const path = `/file/new?${searchParams.toString()}`
    navigate(path)
  }

  return {
    navigateToHome,
    navigateToFileView,
    navigateToFileEdit,
    navigateToFileSource,
    navigateToFileDrafts,
    navigateToNewFile,
  }
}
