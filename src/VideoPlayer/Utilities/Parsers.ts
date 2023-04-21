export interface IPlaylistParser {
  bandwidth: string;
  resolution: string;
  codecs: string;
  frameRate: string;
  url: string;
}

export const playlistParser = async (url: string, api?: any) => {
  const playlistText: string = await fetchFile(url, api);
  const lines = playlistText.trim().split("\n");
  const regex =
    /BANDWIDTH=(\d+).*?,RESOLUTION=(\d+x\d+).*?,CODECS="([^"]+)".*?FRAME-RATE=(\d+.\d+)/;

  let info: IPlaylistParser[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
      const matches = lines[i].match(regex);
      const [, bandwidth, resolution, codecs, frameRate] = matches!;
      const url = lines[i + 1];
      info.push({ bandwidth, resolution, codecs, frameRate, url });
    }
  }

  return info;
};

export interface ISegmentParser {
  method: string;
  keyUri: string;
  iv: string;
  url: string;
}

export const segmentParser = async (url: string, api?: any) => {
  const playlistText: string = await fetchFile(url, api);
  const lines = playlistText.trim().split("\n");
  const regex = /METHOD=(\w+-\w+).*?,URI="([^"]+)".*?IV=(.*)/;

  let info: ISegmentParser[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXT-X-KEY")) {
      const matches = lines[i].match(regex);

      const [, method, keyUri, iv] = matches!;
      const url = lines[i + 2];
      info.push({ method, keyUri, iv, url });
    }
  }

  return info;
};

export const fetchFile = async (url: string, api?: any): Promise<string> => {
  const response = await (api ? api.get(url) : fetch(url));
  return await response.text();
};

export const stringToUnitArray = (val: string): Uint8Array => {
  // @ts-ignore
  return Uint8Array.from(val.split("").map((x) => x.charCodeAt()));
};
