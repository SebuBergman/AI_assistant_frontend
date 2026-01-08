export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes < MB) {
    return `${(bytes / KB).toFixed(1)} KB`;
  }

  if (bytes < GB) {
    return `${(bytes / MB).toFixed(1)} MB`;
  }

  return `${(bytes / GB).toFixed(1)} GB`;
}
