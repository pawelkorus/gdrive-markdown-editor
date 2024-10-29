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
  source?: boolean
}

type NavigateToNewFileParams = {
  folderId: string
}

export function useFileViewParams(): NavigateToFileParams {
  const [searchParams] = useSearchParams()
  return getFileViewParams(searchParams)
}

function getFileViewParams(searchParams: URLSearchParams): NavigateToFileParams {
  const fileId = searchParams.get('fileId')
  if (!fileId) {
    throw new Error('fileId is required')
  }
  const userId = searchParams.get('userId')
  const resourceKey = searchParams.get('resourceKey')

  return { fileId, userId, resourceKey }
}

export function useFileEditParams(): NavigateToEditFileParams {
  const [searchParams] = useSearchParams()
  return getFileEditParams(searchParams)
}

function getFileEditParams(searchParams: URLSearchParams): NavigateToEditFileParams {
  const fileId = searchParams.get('fileId')
  if (!fileId) {
    throw new Error('fileId is required')
  }
  const userId = searchParams.get('userId')
  const resourceKey = searchParams.get('resourceKey')
  const draftId = searchParams.get('draftId')
  const source = searchParams.get('source') === 'true'

  return { fileId, userId, resourceKey, draftId, source }
}

export function useNavigateTo(): UseNavigateAPI {
  const navigate = useReactRouterNavigate()
  const [searchParams] = useSearchParams()

  const navigateToHome = () => {
    navigate('/')
  }

  const navigateToFileView = (params: NavigateToFileParams | undefined) => {
    if (!params) params = getFileViewParams(searchParams)

    const { fileId, userId, resourceKey } = params
    const newSearchParams = new URLSearchParams()
    newSearchParams.set('fileId', fileId)

    if (userId) {
      newSearchParams.set('userId', userId)
    }
    if (resourceKey) {
      newSearchParams.set('resourceKey', resourceKey)
    }

    navigate(`/file?${newSearchParams.toString()}`)
  }

  const navigateToFileEdit = (params: NavigateToEditFileParams | undefined) => {
    if (!params) params = getFileEditParams(searchParams)

    const { fileId, userId, resourceKey, draftId } = params
    const newSearchParams = new URLSearchParams()
    newSearchParams.set('fileId', fileId)

    if (userId) {
      newSearchParams.set('userId', userId)
    }
    if (resourceKey) {
      newSearchParams.set('resourceKey', resourceKey)
    }
    if (draftId) {
      newSearchParams.set('draftId', draftId)
    }
    if (params.source) {
      newSearchParams.set('source', 'true')
    }

    navigate(`/file/edit?${newSearchParams.toString()}`)
  }

  const navigateToFileSource = (params: NavigateToEditFileParams | undefined) => {
    navigateToFileEdit({ ...params, source: true })
  }

  const navigateToFileDrafts = (params: NavigateToFileParams | undefined) => {
    if (!params) params = getFileViewParams(searchParams)

    const { fileId, userId, resourceKey } = params
    const newSearchParams = new URLSearchParams()
    newSearchParams.set('fileId', fileId)

    if (userId) {
      newSearchParams.set('userId', userId)
    }
    if (resourceKey) {
      newSearchParams.set('resourceKey', resourceKey)
    }

    navigate(`/file/drafts?${newSearchParams.toString()}`)
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
