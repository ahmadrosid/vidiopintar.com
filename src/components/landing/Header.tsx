"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player";
import { Link } from "lucide-react";
import { Lightbulb } from "lucide-react";
import { MessagesSquare } from "lucide-react";
import { FormStartLearning } from "./FormStartLearning";

export function Header() {
  const [isReady, setIsReady] = useState(false);

  const handlePlay = () => {
    // wait 2 seconds after the video starts
    setTimeout(() => setIsReady(true), 1500);
  };

  return (
    <header className="flex flex-col justify-between items-center pt-20 h-fit">
      <div className="flex w-full justify-between">
        <h1 className="text-5xl font-semibold tracking-tight max-w-lg leading-[3.75rem] text-primary mb-9">
          Stay Focused. Stay Ahead.{" "}
          <i className="hover:animate-[pulse_200ms_linear_infinite] cursor-default">
            Own Your Future
          </i>
          .
        </h1>
        <div className="hidden md:flex gap-2.5 justify-end w-fit mb-9">
          <div className="flex flex-col px-5 pb-2.5 min-w-[168px] max-w-[236px] border-dashed border-r-2">
            <div className="flex flex-col gap-1.5 pb-4">
              <div className="font-semibold text-lg text-primary">
                Paste URL
              </div>
              <div className="text-[#858D8F] leading-tight">
                Learn from your favorite youtube channels
              </div>
            </div>
            <div className="w-full mt-auto">
              <Link className="ml-auto" />
            </div>
          </div>
          <div className="flex flex-col px-5 pb-2.5 min-w-[168px] max-w-[236px] border-dashed border-r-2">
            <div className="flex flex-col gap-1.5 pb-4">
              <div className="font-semibold text-lg text-primary">
                Get Instant Insights
              </div>
              <div className="text-[#858D8F] leading-tight">
                Cut the watch time, summarize instantly
              </div>
            </div>
            <div className="w-full mt-auto">
              <Lightbulb className="ml-auto" />
            </div>
          </div>
          <div className="flex flex-col px-5 pb-2.5 min-w-[168px] max-w-[236px] border-dashed border-r-2">
            <div className="flex flex-col gap-1.5 pb-4">
              <div className="font-semibold text-lg text-primary">
                Chat with AI
              </div>
              <div className="text-[#858D8F] leading-tight">
                Dive deeper into videos with AI chat
              </div>
            </div>
            <div className="w-full mt-auto">
              <MessagesSquare className="ml-auto" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative isolate overflow-hidden rounded-[3px] w-full aspect-video min-h-[480px]">
        <ReactPlayer
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="https://res.cloudinary.com/dr15yjl8w/video/upload/My_ONE_Piece_of_Advice_for_Someone_in_Their_20s_WVaVUqtW0u4__224s_15sec_mds0pt.mp4"
          playing={true}
          loop={true}
          muted
          width="100%"
          height="100%"
          onStart={handlePlay}
        />
        <div
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 bg-card ${
            isReady ? "opacity-0" : "opacity-100"
          }`}
        />
        <FormStartLearning />
      </div>
    </header>
  );
}
