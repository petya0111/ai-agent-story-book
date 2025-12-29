import React, { useEffect, useState } from "react";
import { Viseme } from "../types/avatar";
import emotionsManifest from "../../public/manifest/emotions.json";
import layeringManifest from "../../public/manifest/layering.json";

interface Props {
  viseme: Viseme;
  emotion: string;
  size?: number;
}

const browsMap: Record<string,string> = {
  brows_neutral: "/assets/face/brows/brows_neutral.png",
  brows_raise: "/assets/face/brows/brows_raise.png",
  brows_furrow: "/assets/face/brows/brows_furrow.png",
  brows_surprise: "/assets/face/brows/brows_surprise.png",
  brows_soft: "/assets/face/brows/brows_soft.png"
};

const eyesMap: Record<string,string> = {
  eye_open: "/assets/face/eyes/eye_open.png",
  eye_half: "/assets/face/eyes/eye_half.png",
  eye_closed: "/assets/face/eyes/eye_closed.png",
  eye_smile: "/assets/face/eyes/eye_smile.png",
  eye_focus: "/assets/face/eyes/eye_focus.png"
};

const mouthMap: Record<Viseme,string> = {
  REST: "/assets/face/mouth/mouth_REST.png",
  A: "/assets/face/mouth/mouth_A.png",
  E: "/assets/face/mouth/mouth_E.png",
  O: "/assets/face/mouth/mouth_O.png",
  FV: "/assets/face/mouth/mouth_FV.png",
  MBP: "/assets/face/mouth/mouth_MBP.png",
  L: "/assets/face/mouth/mouth_L.png",
  WQ: "/assets/face/mouth/mouth_WQ.png",
  SCDG: "/assets/face/mouth/mouth_SCDG.png"
};

type EmotionManifest = typeof emotionsManifest;

export const Avatar: React.FC<Props> = ({ viseme, emotion, size = 400 }) => {
  const [browsSrc, setBrowsSrc] = useState(browsMap["brows_neutral"]);
  const [eyesSrc, setEyesSrc] = useState(eyesMap["eye_open"]);
  const [mouthSrc, setMouthSrc] = useState(mouthMap["REST"]);

  useEffect(() => {
    const eConf = (emotionsManifest as EmotionManifest).emotions[emotion] || (emotionsManifest as EmotionManifest).emotions["neutral"];
    if (eConf) {
      setBrowsSrc(browsMap[eConf.brows] || browsMap["brows_neutral"]);
      setEyesSrc(eyesMap[eConf.eyes] || eyesMap["eye_open"]);
    }
  }, [emotion]);

  useEffect(() => {
    setMouthSrc(mouthMap[viseme]);
  }, [viseme]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    overflow: "hidden"
  };

  // We'll draw static layers below dynamic ones.
  const staticLayers = layeringManifest.renderOrder.filter(
    l => !l.startsWith("face/brows") && !l.startsWith("face/eyes") && !l.startsWith("face/mouth")
  );

  return (
    <div style={containerStyle} className={`emotion-${emotion}`}>
      {staticLayers.map((path, i) => (
        <img
          key={i}
          src={`/` + path}
          alt={path}
          style={{ position:"absolute", left:0, top:0, width:"100%", height:"100%" }}
        />
      ))}
      <img src={browsSrc} alt="brows" style={layerStyle}/>
      <img src={eyesSrc} alt="eyes" style={layerStyle}/>
      <img src={mouthSrc} alt="mouth" style={layerStyle}/>
    </div>
  );
};

const layerStyle: React.CSSProperties = {
  position:"absolute",
  left:0,
  top:0,
  width:"100%",
  height:"100%"
};