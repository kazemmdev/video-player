import CryptoJS from "crypto-js";

// const decryptSegment = (
//   encryptedData: Uint8Array,
//   key: Uint8Array,
//   iv: string
// ) => {
//   // Convert the key and data to CryptoJS format
//   const cryptoJsKey = CryptoJS.enc.Utf8.parse(key);
//   const cryptoJsIv = CryptoJS.enc.Hex.parse(iv);
//   const cryptoJsData = CryptoJS.lib.WordArray.create(encryptedData);

//   // Decrypt the segment using AES-128 CBC mode with the given key and IV
//   const decryptedData = CryptoJS.AES.decrypt({
//     ciphertext: cryptoJsData,
//     key: cryptoJsKey,
//     iv: cryptoJsIv,
//     padding: CryptoJS.pad.Pkcs7,
//     mode: CryptoJS.mode.CBC,
//   });

//   return new Uint8Array(decryptedData.words);
// };

// const decrypt = async (segmentUrl: string, key: string, iv: string) => {
//   const keyResponse = await fetch(key);
//   const keyBuffer = await keyResponse.arrayBuffer();
//   const keyUint8 = new Uint8Array(keyBuffer);

//   const segmentResponse = await fetch(segmentUrl);
//   const segmentBuffer = await segmentResponse.arrayBuffer();
//   const segmentUint8 = new Uint8Array(segmentBuffer);

//   const decryptedSegmentUint8 = decryptSegment(segmentUint8, keyUint8, iv);
//   const decryptedSegmentBuffer = decryptedSegmentUint8.buffer;

//   return decryptedSegmentBuffer;
// };

// export default decrypt;
