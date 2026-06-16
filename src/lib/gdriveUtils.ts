export function convertToLh3Url(url: string, width: number = 1920, height: number = 800, doCrop: boolean = true): string {
  if (!url) return url;

  // Mendeteksi apakah URL berisi ID Google Drive
  const regexId1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const regexId2 = /id=([a-zA-Z0-9_-]+)/;
  
  let fileId = null;
  
  if (url.match(regexId1)) {
    fileId = url.match(regexId1)![1];
  } else if (url.match(regexId2)) {
    fileId = url.match(regexId2)![1];
  } else if (url.includes('lh3.googleusercontent.com/d/')) {
    // Jika sudah lh3, kita ekstrak kembali ID-nya saja untuk memastikan parameter resolusi
    fileId = url.split('lh3.googleusercontent.com/d/')[1].split('=')[0]; 
  }

  if (fileId) {
    // -c berarti di-crop secara simetris / center proporsional FIFE Google
    const cropParam = doCrop ? '-c' : '';
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}-h${height}${cropParam}`;
  }

  // Jika bukan url Gdrive yang valid, biarkan apa adanya
  return url;
}
