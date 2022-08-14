const _sodium = require("libsodium-wrappers");

let sodium;

const onCache = (async () => {
  await _sodium.ready;
  sodium = _sodium;
})();

const initKey = async (passphrase, length) => {
  if (!sodium) await onCache;

  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const key = sodium.crypto_pwhash(
    length,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
  return {
    salt,
    key,
  };
};

const genKey = async (salt, passphrase, length) => {
  if (!sodium) await onCache;

  const key = sodium.crypto_pwhash(
    length,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  return key;
};

exports.genSignKeyPair = async (passphrase) => {
  if (!sodium) await onCache;

  const keyWithSalt = await initKey(passphrase, sodium.crypto_sign_SEEDBYTES);

  let [salt, key] = [keyWithSalt.salt, keyWithSalt.key];

  const keyPair = await sodium.crypto_sign_seed_keypair(key);

  let [pk, sk] = [keyPair.publicKey, keyPair.privateKey];

  pk = Buffer.from(pk).toString("base64");
  salt = Buffer.from(salt).toString("base64");

  return {
    PublicKey: pk,
    salt,
  };
};

exports.shareEncrptStream=async (data, passphrase,sha256) => {
  if (!sodium) await onCache;

  const keyWithSalt = await initKey(
    passphrase,
    sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
  );

  let  key =  keyWithSalt.key;

  let res = await sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
  let [state_out, header] = [res.state, res.header];

  let encryptedData = await sodium.crypto_secretstream_xchacha20poly1305_push(
    state_out,
    data,
    null,
    sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
  );

  let storageData = new Uint8Array(
    encryptedData.length + sha256.length + header.length
  );

  storageData.set(sha256);

  storageData.set(header, sha256.length);

  storageData.set(encryptedData, sha256.length + header.length);
  
  return storageData;
};

exports.encryptStream = async (data, passphrase) => {
  if (!sodium) await onCache;

  const keyWithSalt = await initKey(
    passphrase,
    sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
  );

  let [salt, key] = [keyWithSalt.salt, keyWithSalt.key];

  let res = await sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
  let [state_out, header] = [res.state, res.header];

  let encryptedData = await sodium.crypto_secretstream_xchacha20poly1305_push(
    state_out,
    data,
    null,
    sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
  );

  let storageData = new Uint8Array(
    encryptedData.length + salt.length + header.length
  );

  storageData.set(salt);

  storageData.set(header, salt.length);

  storageData.set(encryptedData, salt.length + header.length);
  
  return storageData;
};

exports.decryptStream = async (data, passphrase) => {
  if (!sodium) await onCache;

  let offset = 0;

  const stream = new Uint8Array(data);

  const salt = stream.slice(offset, offset + sodium.crypto_pwhash_SALTBYTES);

  offset += sodium.crypto_pwhash_SALTBYTES;

  const header = stream.slice(
    offset,
    offset + sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES
  );

  offset += sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES;

  const encryptedStream = stream.slice(offset);

  const key = await genKey(
    salt,
    passphrase,
    sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
  );

  let state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
    header,
    key
  );

  let decryptedStream = sodium.crypto_secretstream_xchacha20poly1305_pull(
    state_in,
    encryptedStream
  );

  return decryptedStream.message;
};

exports.signStream = async (data, salt, passphrase) => {
  if (!sodium) await onCache;
  const saltBuffer = Buffer.from(salt, 'base64'); 
  const seed = await genKey(saltBuffer, passphrase, sodium.crypto_sign_SEEDBYTES);

  const keyPair = await sodium.crypto_sign_seed_keypair(seed);

  const [pk, sk] = [keyPair.publicKey, keyPair.privateKey];
  let sign = await sodium.crypto_sign(data, sk);

  return sign;

};

exports.openSignStream = async (sign, pk) => {
  if (!sodium) await onCache;
  const publicKey = Buffer.from(pk, 'base64'); 
  const raw = sodium.crypto_sign_open(sign, publicKey)

  return raw;
}

exports.sha256 = async (message) => {
  if (!sodium) await onCache;
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(message);
  const sha = hash.digest('hex');
  return sha;
}