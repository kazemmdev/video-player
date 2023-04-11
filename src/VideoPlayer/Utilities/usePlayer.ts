import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import { getMimetype } from "./mimetype";

const options = {
  fill: true,
  fluid: true,
  preload: "meta",
  contentData: {},
};

const usePlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const vjsPlayer = videojs(videoRef.current!, {
      ...options,
      sources: [
        {
          src,
          type: getMimetype(src),
          withCredentials: false,
        },
      ],
    });
    // @ts-ignore
    setPlayer(vjsPlayer);

    return () => {
      if (player !== null) {
        // @ts-ignore
        player.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (player !== null) {
      // @ts-ignore
      player.src({ src });
    }
  }, [src]);

  return videoRef;
};

export default usePlayer;
