import React, { useEffect, useState } from 'react';
import { getUserRecentlyModifiedFiles } from '../google';
import { useGdriveFile } from '../service/gdrivefile';

type Props = {}

const InstalledView = (props: Props): React.ReactElement => {
  const [, loadFile] = useGdriveFile()
  const [files, setFiles] = useState<{ id: string; name: string; mimeType: string, viewedByMeTime: string }[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await getUserRecentlyModifiedFiles();
      setFiles(files);
    };

    fetchFiles();
  }, []);

  const handleFileClick = (fileId: string) => {
    loadFile(fileId);
  };

  return (
    <div className="container-lg mt-4">
        <div className="row content">
          <h1>Recently accessed files</h1>
          <div className="list-group">
            {files.map(file => (
            <div key={file.id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between" onClick={(e) => handleFileClick(file.id)}>
                <h5 className="mb-1">{file.name}</h5>
                <small>{file.viewedByMeTime}</small>
              </div>
            </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default InstalledView;
