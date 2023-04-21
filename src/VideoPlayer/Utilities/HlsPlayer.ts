import { useEffect, useRef, useState } from "react";
import { HlsStream } from "./HlsStream";

interface props {
  src: string;
  options?: any;
}

const HlsPlayer = ({ src, options }: props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsStream, setHlsStream] = useState<HlsStream>();

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);
    
    setHlsStream(new HlsStream(src, mediaSource));

    return () => {
      hlsStream!.dispose();
      mediaSource.endOfStream();
    };
  }, [src]);

  return videoRef;
};

export default HlsPlayer;
