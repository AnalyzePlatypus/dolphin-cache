const { promisify } = require('util');
const { deflate, unzip} = require('zlib');

const gzip = promisify(deflate);
const gunzip = promisify(unzip);

async function stringToCompressedBase64(string) {
  const compressedBuffer = await gzip(string);
  return compressedBuffer.toString('base64');
}

async function compressedBase64ToJson(base64String) {
  const compressedBuffer = Buffer.from(base64String, 'base64')
  const str = await gunzip(compressedBuffer);
  return JSON.parse(str);
}

exports.stringToCompressedBase64 = stringToCompressedBase64;
exports.compressedBase64ToJson = compressedBase64ToJson;