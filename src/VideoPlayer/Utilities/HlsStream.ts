import CryptoJS from "crypto-js";

import {
  ISegmentParser,
  playlistParser,
  segmentParser,
} from "./Parsers";

export class HlsStream {
  private src: string;
  private mediaSource: MediaSource;
  private sourceBuffer: SourceBuffer | null = null;

  constructor(src: string, mediaSource: MediaSource) {
    this.src = src;
    this.mediaSource = mediaSource;
    this.initialize();
  }

  // Implement the logic to fetch the .m3u8 file, parse it, and initialize the SourceBuffer
  private async initialize() {
    // Fetch the m3u8 file
    const m3u8 = await playlistParser(this.src);

    // Parse the m3u8 file and Get the segments and initialize the SourceBuffer
    const segments = await segmentParser(m3u8[0].url);

    if (segments && segments.length > 0) {
      this.mediaSource.addEventListener("sourceopen", () => {
        this.sourceBuffer = this.mediaSource.addSourceBuffer(
          `video/mp4; codecs="${m3u8[0].codecs}"`
        );
      });
      await this.loadSegments(segments);
    }
  }

  // Implement the logic to fetch and decrypt the segments, and append them to the SourceBuffer
  private async loadSegments(segments: ISegmentParser[]) {
    // Fetch and decrypt the segments
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const response = await fetch(segment.url);
      const encryptedData = await response.arrayBuffer();

      // Decrypt the segment
      const keyResponse = await fetch(segment.keyUri);
      const key = await keyResponse.arrayBuffer();

      const decryptedData = await this.decrypt(encryptedData, key, segment.iv);

      if (this.sourceBuffer) {
        this.sourceBuffer.appendBuffer(decryptedData);
      }
    }
  }

  private async decrypt(
    data: ArrayBuffer,
    key: ArrayBuffer,
    ivKey: string
  ): Promise<ArrayBuffer> {

    const iv = new Uint8Array(16);

    if (ivKey)
      for (let j = 0; j < 16; j++) {
      // @ts-ignore
        iv[j] = j < 8 ? 0 : ivKey[j - 8];
      }

    // @ts-ignore
    const decryptedData = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.lib.WordArray.create(data) }, CryptoJS.lib.WordArray.create(key),{ iv: CryptoJS.lib.WordArray.create(iv) }).toString(CryptoJS.enc.Latin1);

    return new Uint8Array(decryptedData.length).map((_, i) =>
   decryptedData.charCodeAt(i)
    );
  }

  dispose() {
    // Implement cleanup logic
    if (this.sourceBuffer && this.mediaSource.readyState === "open") {
      this.sourceBuffer.abort();
    }
  }
}
