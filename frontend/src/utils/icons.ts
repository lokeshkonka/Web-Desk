export const getFileIcon = (fileName: string, mimeType?: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType || '';
  
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '/icons/files/image.png';
  if (mime.startsWith('video/') || ['mp4', 'mkv', 'webm', 'mov'].includes(ext)) return '/icons/files/video.png';
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext)) return '/icons/files/music.png';
  if (ext === 'pdf') return '/icons/files/pdf.png';
  if (ext === 'json') return '/icons/files/json.png';
  if (ext === 'md') return '/icons/files/markdown.png';
  if (ext === 'zip' || ext === 'rar' || ext === 'tar' || ext === 'gz') return '/icons/files/zip.png';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'java', 'cpp', 'go'].includes(ext)) return '/icons/files/code.png';
  if (ext === 'txt') return '/icons/files/text.png';
  
  return '/icons/files/file.png';
};
