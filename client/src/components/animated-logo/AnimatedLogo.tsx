import React, { type CSSProperties, useEffect, useRef } from "react";

import Blade1 from "../../assets/Animated Logo/path_01.svg?react";
import Blade2 from "../../assets/Animated Logo/path_02.svg?react";
import Blade3 from "../../assets/Animated Logo/path_03.svg?react";
import Blade4 from "../../assets/Animated Logo/path_04.svg?react";
import Blade5 from "../../assets/Animated Logo/path_05.svg?react";
import Blade6 from "../../assets/Animated Logo/path_06.svg?react";

import "./AnimatedLogo.css";

type AnimatedLogoProps = {
  size?: number;
  closeDegrees?: number;
  duration?: number;
  openPause?: number;
  closedPause?: number;
};

const blades = [Blade1, Blade2, Blade3, Blade4, Blade5, Blade6];

export default function AnimatedLogo({
  size = 256,
  closeDegrees = 22,
  duration = 1200,
  openPause = 0.28,
  closedPause = 0.22,
}: AnimatedLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--close-deg", `${closeDegrees}deg`);
    el.style.setProperty("--dur", `${duration}ms`);
    el.style.setProperty("--openPause", String(openPause));
    el.style.setProperty("--closedPause", String(closedPause));

    void el.offsetWidth;
    el.classList.add("play-once");
  }, [size, closeDegrees, duration, openPause, closedPause]);

  return (
    <div
      className="shutter-root"
      ref={rootRef}
      aria-label="Shutter intro animation"
    >
      <div className="shutter-stage">
        {blades.map((Blade, index) => {
          const bladeStyle = { "--i": String(index) } as CSSProperties;

          return (
            <div className="blade-wrap" key={index} style={bladeStyle}>
              <Blade className="blade-svg" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
