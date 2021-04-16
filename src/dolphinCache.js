var Memcached = require('memcached');

const { getByteSizeDiffString } = require('./byteSize.js');
const { compressedBase64ToJson, stringToCompressedBase64 } = require('./textCompress.js');
const { createErrorType } = require('./global.js');

const CONFIG_FROM_ENV_VARS = {
  serverLocations: [
    process.env.DOLPHIN_MEMCACHED_URL,
  ],
  memcachedOptions: {
    timeout: 250,
    retries: 1
  }
}

function DolphinCache({serverLocations, memcachedOptions, shouldCompressValues = true} = CONFIG_FROM_ENV_VARS) {
  console.log(`🐬 DolpinCache init`);
  this.memcached = new Memcached(serverLocations, memcachedOptions);
  this.shouldCompressValues = shouldCompressValues;

  this.memcached.on('issue', function( details ){ console.error(details.server) });
  this.memcached.on('failure',  function( details ){ console.error(details.server) });
  this.memcached.on('reconnecting',  function( details ){ console.log(details.server) });
  this.memcached.on('reconnect',  function( details ){ console.log(details.server) });
  this.memcached.on('remove',  function( details ){ console.error(details.server) });

  this.get = get;
  this.set = set;
}


async function get({key, onCacheMiss, cacheTtlSeconds = 60}) {
  console.log(`🐬 Cache get: ${key}`);
  let response = await memcachePromise(this.memcached, 'get', key);

  if(!response) {
    console.log("⚓ Cache miss");
    
    const serverResponse = await onCacheMiss();
    console.log(`🐬 Caching response...`);
    await this.set({key, value: serverResponse, cacheTtlSeconds})
    return serverResponse;
  }

  console.log("🎯 Cache hit");
  return this.shouldCompressValues ? await compressedBase64ToJson(response) : response;
}


async function set({key, value, cacheTtlSeconds}) {
  console.log(`🐬 Cache set: ${key} ttl: ${cacheTtlSeconds}s`);

  value = JSON.stringify(value);

  let compressedValue;
  if(this.shouldCompressValues) compressedValue = await stringToCompressedBase64(value);

  console.log(getByteSizeDiffString(value, compressedValue));

  return await memcachePromise(this.memcached, 'set', [key, compressedValue || value, cacheTtlSeconds]);
}


async function memcachePromise(obj, method, args) {
  if(!Array.isArray(args)) args = [args];

  return new Promise((resolve, reject) => {
    obj[method].apply(obj, [...args, (err, data) => {
      if(err) reject( new DolphinConnectError({message: err}));
      resolve(data);
    }]);
  })
}


const DolphinConnectError =  createErrorType('DolphinConnectError');

exports.DolphinCache = DolphinCache;