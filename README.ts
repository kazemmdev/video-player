// Sure, here's an example React component written in TypeScript that plays the HLS playlist you provided using the video.js library and the crypto-js library for decryption. This component follows the SOLID principles by separating concerns into smaller, more focused classes.

import React, { useEffect, useRef } from 'react';
import videojs, { VideoJsPlayerOptions } from 'video.js'
import CryptoJS from 'crypto-js';

type Props = {
  playlistUrl: string;
  keyUrl: string;
};

class Decrypter {
  private key: CryptoJS.WordArray;
  private iv: CryptoJS.WordArray;

  constructor(keyUrl: string, iv: string) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', keyUrl, false);
    xhr.send();
    const keyHex = xhr.responseText;
    this.key = CryptoJS.enc.Hex.parse(keyHex);
    this.iv = CryptoJS.enc.Hex.parse(iv);
  }

  decrypt(data: Uint8Array): Uint8Array {
    const encrypted = CryptoJS.lib.WordArray.create(data);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, this.key, { iv: this.iv });
    return new Uint8Array(decrypted.sigBytes);
  }
}

class HlsPlaylist {
  private segments: Array<{ duration: number, uri: string, key?: { uri: string, iv: string } }>;

  constructor(playlistUrl: string) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', playlistUrl, false);
    xhr.send();
    const playlistText = xhr.responseText;
    const lines = playlistText.trim().split('\n');
    const segments: Array<{ duration: number, uri: string, key?: { uri: string, iv: string } }> = [];
    let currentKey: { uri: string, iv: string } | undefined = undefined;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#EXT-X-KEY:')) {
        const matches = /METHOD=AES-128,URI="([^"]+)",IV=([0-9a-fA-F]+)/.exec(line);
        if (matches) {
          currentKey = { uri: matches[1], iv: matches[2] };
        } else {
          console.warn('Could not parse key info:', line);
        }
      } else if (line.startsWith('#EXTINF:')) {
        const matches = /^#EXTINF:([0-9.]+),/.exec(line);
        if (matches) {
          const duration = parseFloat(matches[1]);
          const uri = lines[i + 1];
          segments.push({ duration, uri, key: currentKey });
          currentKey = undefined;
        } else {
          console.warn('Could not parse segment info:', line);
        }
      }
    }
    this.segments = segments;
  }

  getSegmentUrl(index: number): string | undefined {
    return this.segments[index]?.uri;
  }

  getSegmentDuration(index: number): number | undefined {
    return this.segments[index]?.duration;
  }

  getSegmentKey(index: number): Decrypter | undefined {
    const keyInfo = this.segments[index]?.key;
    if (keyInfo) {
      return new Decrypter(keyInfo.uri, keyInfo.iv);
    }
  }

  getSegmentCount(): number {
    return this.segments.length;
  }
}

class HlsPlayer {
  private playlist: HlsPlaylist;
  private player: videojs.Player;
  private currentSegment: number = 0;

  constructor(playlistUrl: string, keyUrl: string, videoElement: HTMLVideoElement) {
    this.playlist = new HlsPlaylist(playlistUrl);
    const options: VideoJsPlayerOptions = {
      sources: [{
        src: this.playlist.getSegmentUrl(0) ?? '',
        type: 'application/vnd.apple.mpegurl',
      }],
      html5: {
        hls: {
          overrideNative: true,
          decrypt: (encrypted: Uint8Array, key: Uint8Array, iv: Uint8Array) => {
            const decrypter = this.playlist.getSegmentKey(this.currentSegment);
            if (decrypter) {
              const decrypted = decrypter.decrypt(encrypted);
              return decrypted.buffer;
            } else {
              console.warn('No key available for decryption');
              return encrypted.buffer;
            }
          },
        },
      },
      autoplay: true,
    };
    this.player = videojs(videoElement, options);
    this.player.on('ended', () => {
      this.currentSegment++;
      if (this.currentSegment < this.playlist.getSegmentCount()) {
        const url = this.playlist.getSegmentUrl(this.currentSegment);
        const duration = this.playlist.getSegmentDuration(this.currentSegment) ?? 0;
        const key = this.playlist.getSegmentKey(this.currentSegment);
        if (url) {
          this.player.src({
            src: url,
            type: 'application/vnd.apple.mpegurl',
          });
          this.player.play();
          if (duration > 0) {
            setTimeout(() => {
              this.player.trigger('ended');
            }, duration * 1000);
          }
        } else {
          console.warn('No URL available for next segment');
        }
      } else {
        console.log('Playlist ended');
      }
    });
  }

  start() {
    this.player.play();
  }
}

const HlsPlayerComponent: React.FC<Props> = ({ playlistUrl, keyUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) {
      console.warn('Video element not found');
      return;
    }
    const player = new HlsPlayer(playlistUrl, keyUrl, videoRef.current);
    player.start();
  }, [playlistUrl, keyUrl]);

  return (
    <div>
      <video ref={videoRef} className="video-js vjs-default-skin vjs-big-play-centered" playsInline />
    </div>
  );
};

export default HlsPlayerComponent;
// To use this component, you can simply import it and render it like this:

import HlsPlayerComponent from './HlsPlayerComponent';

const App: React.FC = () => {
  return (
    <div>
      <HlsPlayerComponent playlistUrl="http://mydev.test/media/16/playlist.m3u8" keyUrl="http://mydev.test/media/key/16/f12393361092e573.key" />
    </div>
  );
};

export default App;
// Note that this code assumes that the video.js and crypto-js libraries have been installed and imported correctly. You may need to adjust the import statements or add these libraries to your project if you encounter any errors.