
function byteLength(str) {
  // From https://gist.github.com/lovasoa/11357947
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--;
  }
  return s;
}

function bytesToHumanReadableString(bytes, si=true, dp=1) {
  // From https://stackoverflow.com/a/14919494/6068782
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}


function getByteSizeDiffString(a, b) {
  const noCompression = a;
  const withCompression = b;

  const noCompressionBytes = byteLength(noCompression);
  const withCompressionBytes = byteLength(withCompression);
  const differenceBytes = noCompressionBytes - withCompressionBytes;
  const onePercent = noCompressionBytes / 100;
  const savedPercentage = (differenceBytes / onePercent).toFixed(2);

  console.log(`Deflated ${savedPercentage}% (${bytesToHumanReadableString(differenceBytes)})`);
}

exports.getByteSizeDiffString = getByteSizeDiffString
exports.bytesToHumanReadableString = bytesToHumanReadableString;
exports.byteLength = byteLength;