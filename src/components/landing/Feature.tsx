"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/landing/tabs";
import {
  FileText,
  List,
  LucideLightbulb,
  MessagesSquare,
  SquareLibrary,
} from "lucide-react";

const libraryVideo = [
  {
    id: 1,
    title: "My ONE Piece of Advice for Someone in Their 20s",
    author: "Ali Abdaal",
    number: 12,
    thumbnail: "https://img.youtube.com/vi/WVaVUqtW0u4/maxresdefault.jpg",
    url: "https://youtu.be/WVaVUqtW0u4",
  },
  {
    id: 2,
    title: "How to start a one-person business (starting with 0$)",
    author: "Ruri Ohama",
    number: 5,
    thumbnail: "https://img.youtube.com/vi/SaZttbQUjLI/maxresdefault.jpg",
    url: "https://youtu.be/SaZttbQUjLI",
  },
  {
    id: 3,
    title: "How To Be So Productive That It Feels ILLEGAL",
    author: "Justin Sung",
    number: 7,
    thumbnail: "https://img.youtube.com/vi/4FXScrmYKQ0/maxresdefault.jpg",
    url: "https://youtu.be/4FXScrmYKQ0?si=yImI36ax8Gh7-k2P",
  },
  {
    id: 4,
    title: "Become an Academic Weapon THIS school year",
    author: "Amy Wang",
    number: 2,
    thumbnail: "https://img.youtube.com/vi/vbITrczdX5Q/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=vbITrczdX5Q",
  },
  {
    id: 5,
    title: "I was wrong about Claude Code (UPDATED AI workflow tutorial)",
    author: "Chris Raroque",
    number: 4,
    thumbnail: "https://img.youtube.com/vi/gNR3XI5Eb0k/maxresdefault.jpg",
    url: "https://youtu.be/gNR3XI5Eb0k",
  },
  {
    id: 6,
    title: "Context Engineering Clearly Explained",
    author: "Tina Huang",
    number: 4,
    thumbnail: "https://img.youtube.com/vi/jLuwLJBQkIs/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=jLuwLJBQkIs",
  },
];

export function Features() {
  const[isReady, setIsReady] = useState(false)

  function handlePlay(){
    setTimeout(() => setIsReady(true), 2000)
  }

  return (
    <div className="flex flex-col gap-7 pt-28">
      <div className="group flex justify-start items-center gap-2 w-fit cursor-default">
        <div className="w-4 h-1 bg-accent rounded-full group-hover:animate-[spin_200ms_linear_infinite]"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          Features
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-4xl text-primary font-semibold tracking-tight">
          Learn faster from any YouTube video
        </h2>
        <p className="text-secondary-foreground text-base max-w-3xl">
          Vidiopintar turns long videos into structured insights, conversational
          Q&amp;A, and a reusable library. Explore each capability below — every
          tab&apos;s content stays available in the page HTML for accessibility
          and AI agents.
        </p>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="-ml-3">
          <TabsTrigger value="insights">
            <LucideLightbulb className="size-8 mr" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessagesSquare className="size-8 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="library">
            <SquareLibrary className="size-8 mr-1" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <div className="w-full rounded-[3px]">
            <div className="relative isolate overflow-hidden rounded-[3px] w-full aspect-video min-h-[640px]">
              <ReactPlayer
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="https://res.cloudinary.com/dr15yjl8w/video/upload/v1756632015/public/g3wh199356lbdhnvue6n.mp4"
                playing
                loop
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
              <div className="absolute top-10 sm:left-10">
                <div className=" flex flex-col gap-3 mb-3 px-6 py-7 rounded-md max-w-[420px] bg-white">
                  <div className="flex flex-col gap-2">
                    <FileText className="text-secondary-foreground size-6" />
                    <div className="text-slate-900 text-[1.25rem] font-semibold">
                      Summary
                    </div>
                  </div>
                  <p className="text-slate-900 text-balance">
                    This YouTube video by Dr. Justin Sung presents three key
                    strategies for achieving high levels of productivity: the
                    Pareto Principle, the Zeigarnik Effect, and the Championship
                    Mentality. He explains each principle, provides examples of
                    how they work, and then introduces a "supercharged" version
                    of each to maximize their effectiveness. The video aims to
                    provide viewers with actionable techniques to improve their
                    productivity and achieve their goals more efficiently.
                  </p>
                </div>
                <div className="absolute flex flex-col gap-3 px-6 py-7 rounded-md max-w-[420px] bg-white">
                  <div className="flex flex-col gap-2">
                    <List className="text-secondary-foreground size-6" />
                    <div className="text-slate-900 text-[1.25rem] font-semibold">
                      Outline
                    </div>
                  </div>
                  <ol className="text-slate-800 list-decimal list-outside pl-5">
                    <li>
                      Introduction: Overview of the three productivity
                      principles.
                    </li>
                    <li>
                      The Pareto Principle: Focusing on the 20% of efforts that
                      yield 80% of the results.
                    </li>
                    <li>
                      Supercharged Pareto (Pareto Squared): Applying the Pareto
                      Principle to itself.
                    </li>
                    <li>
                      The Zeigarnik Effect: Using the mind's tendency to
                      remember incomplete tasks to overcome procrastination.
                    </li>
                    <li>
                      Supercharged Zeigarnik (Zeigarnik Squared): Breaking down
                      the initial steps of a task to make starting even easier.
                    </li>
                    <li>
                      The Championship Mentality: Sacrificing short-term gains
                      for long-term success. Supercharged Championship: (Not
                      covered in this transcript excerpt)
                    </li>
                  </ol>
                </div>
              </div>
              <div className="absolute flex flex-col gap-6 justify-center items-center top-0 w-full h-full bg-gradient-to-t from-black from-4% to-black/0 to-100%" />
              <div className="absolute flex flex-col right-8 bottom-30 gap-1.5">
                <h3 className=" text-primary font-semibold text-3xl text-right">
                  Instant insights without the watch time
                </h3>
                <p className="text-primary/80 text-base text-right">
                  AI instantly generate video’s summary, outline, key takeaways,
                  and next action steps for you.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <div className="w-full rounded-[3px]">
            <div className="relative isolate overflow-hidden rounded-[3px] w-full aspect-video min-h-[640px]">
              <ReactPlayer
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="https://res.cloudinary.com/dr15yjl8w/video/upload/v1756632015/public/g3wh199356lbdhnvue6n.mp4"
                playing
                loop
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
              <div className="absolute flex flex-col top-16 sm:right-12 max-w-[375px] w-full border-2 mx-4 px-4 py-6 rounded-md backdrop-blur-[7px] gap-4">
                <div className="flex w-full justify-end">
                  <div className="bg-primary text-slate-900 text-right w-fit text-base rounded-full px-3 py-1.5 border-x-1 border-b-2 border-slate-300">
                    What's the next steps
                  </div>
                </div>
                <div className="flex gap-2 justify-start">
                  <div className="flexx shrink-0 size-4 mr-1 rounded-full bg-accent" />
                  <div className="flex flex-col gap-1">
                    <p className="-mt-1">Next steps</p>
                    <ol className="list-decimal list-outside pl-4">
                      <li>
                        Identify Your 20%: Analyze your tasks and activities to
                        determine which ones contribute the most to your goals.
                      </li>
                      <li>
                        Apply Pareto Squared: Break down your high-impact tasks
                        into smaller components and focus on the most critical
                        initial steps.
                      </li>
                      <li>
                        Use the Zeigarnik Effect: Start tasks without the
                        pressure of finishing them to overcome procrastination.
                      </li>
                      <li>
                        Implement Zeigarnik Squared: Break down the initial
                        steps of tasks into even smaller actions and automate
                        them where possible.
                      </li>
                      <li>
                        Adopt the Championship Mentality: Prioritize long-term
                        goals over short-term gains and be willing to make
                        sacrifices for future success.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="absolute flex flex-col gap-6 justify-center items-center top-0 w-full h-full bg-gradient-to-t from-black from-4% to-black/0 to-100%" />
              <div className="absolute flex flex-col left-10 bottom-30 gap-1.5">
                <h3 className=" text-primary font-semibold text-3xl text-left">
                  Study smarter with AI Chat
                </h3>
                <p className="text-primary/80 text-base">
                  Ask anything and dive deeper what’s in the video with AI.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <div className="w-full rounded-[3px]">
            <div className="relative isolate overflow-hidden rounded-[3px]">
              <div className="grid lg:grid-cols-3 md:grid-cols-2 auto-rows-auto w-full max-h-dvh gap-3">
                {libraryVideo.map((video) => (
                  <a
                    href={video.url}
                    key={video.id}
                    className="hover:opacity-90 mb-8"
                    target="blank"
                  >
                    <div className="flex flex-col gap-1 ">
                      <img src={video.thumbnail} className="rounded-xs" />
                      <div className="text-lg text-primary font-medium pt-1 line-clamp-1">
                        {video.title}
                      </div>
                      <div className="text-base text-secondary-foreground">
                        {video.author} — {video.number} videos
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="absolute flex flex-col gap-6 justify-center items-center top-0 w-full h-full bg-gradient-to-t from-black from-10% to-black/0 to-100%" />
              <div className="absolute flex flex-col right-10 bottom-24 gap-1.5">
                <h3 className="text-3xl font-semibold text-primary text-right">
                  Grow your library of knowledge
                </h3>
                <p className="text-primary/80 text-base text-right">
                  Your insights, your way. Build a personal knowledge base from
                  videos you love.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
