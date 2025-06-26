"use client";

import React, { useEffect, useState } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useMotionValue,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

export type MobileImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  layoutId: string;
};

const MobileImage: React.FC<MobileImageProps> = ({
  layoutId,
  src,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0, 1, 0]);
  const onClickHandler = (value: null | string) => {
    if (value) {
      window.history.pushState({ modalOpen: true }, "");
    }
    setSelectedImage(value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };
    const handlePopState = (event: PopStateEvent) => {
      if (selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedImage]);
  return (
    <MotionConfig transition={{ duration: 0.3, type: "spring", bounce: 0 }}>
      <button onClick={() => onClickHandler(layoutId)}>
        <motion.img
          layoutId={layoutId}
          src={src}
          className={cn("size-full object-cover", className)}
        />
      </button>

      {selectedImage ? (
        <div className="fixed inset-0 isolate z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background/90 fixed inset-0 -z-10 backdrop-blur-sm"
            onClick={() => onClickHandler(null)}
            style={{ opacity }}
            transition={{ duration: 0.1 }}
          />
          <motion.img
            layoutId={layoutId}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={1}
            src={src}
            className="max-h-[70vh] w-auto object-contain"
            onDrag={(event, info) => y.set(info.offset.y)}
            onDragEnd={(event, info) => {
              animate(y, 1);
              if (info.offset.y > 200 || info.offset.y < -200) {
                setSelectedImage(null);
              }
            }}
          />
        </div>
      ) : null}
    </MotionConfig>
  );
};

export default MobileImage;
