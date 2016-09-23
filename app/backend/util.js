'use strict';

const {parse: urlParse, format: urlFormat} = require('url');

module.exports.getBasicAuthHeader = (username, password) => {
  const name = 'Authorization';
  const header = `${username || ''}:${password || ''}`;
  const authString = new Buffer(header, 'utf8').toString('base64');
  const value = `Basic ${authString}`;
  return {name, value};
};

module.exports.filterHeaders = (headers, name) => {
  if (!Array.isArray(headers) || !name) {
    return [];
  }

  return headers.filter(
    h => h.name.toLowerCase() === name.toLowerCase()
  );
};

module.exports.hasAuthHeader = headers => {
  return module.exports.filterHeaders(headers, 'authorization').length > 0;
};

module.exports.getSetCookieHeaders = headers => {
  return module.exports.filterHeaders(headers, 'set-cookie');
};

module.exports.setDefaultProtocol = (url, defaultProto = 'http:') => {
  // Default the proto if it doesn't exist
  if (url.indexOf('://') === -1) {
    url = `${defaultProto}//${url}`;
  }

  return url;
};

/**
 * Generate an ID of the format "<MODEL_NAME>_<TIMESTAMP><RANDOM>"
 * @param prefix
 * @returns {string}
 */
module.exports.generateId = prefix => {
  const CHARS = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ'.split('');
  const dateString = Date.now().toString(36);
  let randString = '';

  for (let i = 0; i < 16; i++) {
    randString += CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  if (prefix) {
    return `${prefix}_${dateString}${randString}`;
  } else {
    return `${dateString}${randString}`;
  }
};

module.exports.flexibleEncode = str => {
  // Sometimes spaces screw things up because of url.parse
  str = str.replace(/%20/g, ' ');

  let decodedPathname;
  try {
    decodedPathname = decodeURI(str);
  } catch (e) {
    // Malformed (probably not encoded) so assume it's decoded already
    decodedPathname = str;
  }

  return encodeURI(decodedPathname);
};

module.exports.prepareUrlForSending = url => {
  const urlWithProto = module.exports.setDefaultProtocol(url);

  // Parse the URL into components
  const parsedUrl = urlParse(urlWithProto, true);

  // ~~~~~~~~~~~ //
  // 1. Pathname //
  // ~~~~~~~~~~~ //

  parsedUrl.pathname = module.exports.flexibleEncode(
    parsedUrl.pathname || ''
  );

  // ~~~~~~~~~~~~~~ //
  // 2. Querystring //
  // ~~~~~~~~~~~~~~ //

  // Deleting search key will force url.format to encode parsedURL.query
  delete parsedUrl.search;

  return urlFormat(parsedUrl);
};