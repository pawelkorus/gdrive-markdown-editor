import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi, beforeEach } from 'vitest'
import SourceEditor from '@app/ui/source-editor/SourceEditor'

const insertText = vi.fn()
const uploadFile = vi.fn()

vi.mock('@app/service/file', () => ({
  useFile: () => [{ id: '1', folderId: 'folder-1' }],
}))

vi.mock('@app/service/files', () => ({
  useUploadFile: () => uploadFile,
}))

vi.mock('@app/ui/source-editor/textarea', () => ({
  TextArea: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({ insertText }))
    return <textarea data-testid="textarea" />
  }),
}))

beforeEach(() => {
  insertText.mockReset()
  uploadFile.mockReset()
})

test('uploads dropped file and inserts gdrive reference', async () => {
  uploadFile.mockResolvedValue({ id: 'new-id' })
  const { getByTestId } = render(<SourceEditor value="{}"/>)
  const file = new File(['x'], 'a.png', { type: 'image/png' })

  fireEvent.drop(getByTestId('textarea'), { dataTransfer: { files: [file] } })

  await waitFor(() => { expect(insertText).toHaveBeenCalledWith('::gdrive{src="new-id"}') })
  expect(uploadFile).toHaveBeenCalledWith(file, 'folder-1')
})

test('does not insert text when upload fails', async () => {
  uploadFile.mockRejectedValue(new Error('fail'))
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { getByTestId } = render(<SourceEditor value="{}" />)

  fireEvent.drop(getByTestId('textarea'), { dataTransfer: { files: [new File(['x'], 'a')] } })

  await waitFor(() => { expect(spy).toHaveBeenCalled() })
  expect(insertText).not.toHaveBeenCalled()
})
