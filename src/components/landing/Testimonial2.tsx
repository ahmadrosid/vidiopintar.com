import React from "react";

const testimonialsData = [
  {
    id: 1,
    name: "Ari Kurniawan - idearik",
    title: "Content Creator",
    avatar: "/testimonials/idearik.jpeg",
    content:
      "Saya salah satu penggunanya. Oke banget buat dapetin summary dari konten panjang kayak podcast.",
  },
  {
    id: 2,
    name: "Musli",
    title: "Content Creator",
    avatar: "/testimonials/musli.jpg",
    content:
      "Dengan bantuan vidiopintar, aku gak perlu menghabiskan waktu berjam-jam nonton youtube...",
  },
  {
    id: 3,
    name: "Paulus Aditya Hernawan",
    title: "L&D Practitioner",
    avatar: "/testimonials/koeladit.jpg",
    content:
      "Keren bingo ini Mas, alternative lain buat ngulik dan riset video YouTube selain pakai NotebookLM 🔥",
  },
  {
    id: 4,
    name: "Hilmi Aunillah Kamil",
    title: "Human Resources Enthusiast",
    avatar: "/testimonials/hilmi.jpeg",
    content:
      "makasih mas, aku udah nyoba dan beneran ngebantu banget buat proses belajar dari youtube sangat menghemat waktu",
  },
  {
    id: 5,
    name: "Muhammad Fatih Darmawan",
    title: "Driving Brand & Business Growth with SEO",
    avatar: "/testimonials/fatih-darmawan.jpeg",
    content:
      "Thanks bro, sebelumnya saya manual, dari transcipt webpage trus lempar ke chatgpt. Udah nyobain, bermanfaat banget.",
  },
  {
    id: 6,
    name: "Lucky Wiratanandi",
    title: "Cluster HR Executive",
    avatar: "/testimonials/lucky.jpeg",
    content:
      "Sebuah gebrakan yang keren bro, in needsnya jadi lebih mencakup kebutuhan pasar ✨",
  },
];

const Testimonials2 = () => {
  return (
    <div className="flex flex-col gap-7 pt-28 select-none">
      <div className="flex group justify-start items-center gap-2 w-fit">
        <div className="w-4 h-1 bg-accent rounded-full group-hover:animate-[pulse_200ms_linear_infinite]"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          Testimonials
        </div>
      </div>
      <div className="text-4xl text-primary font-semibold tracking-tight">
        Built for busy people and curious minds
        <div className="text-secondary-foreground text-base font-normal pt-3 tracking-normal">
          See how people are extracting real insights and building knowledge
          from the videos they love.
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-3">
        {testimonialsData.map((data) => (
          <div
            key={data.id}
            className="bg-card hover:bg-card/90 rounded-xs pl-5 pr-6 py-7 shadow-lg "
          >
            <div className="flex items-start space-x-4">
              <img
                src={data.avatar}
                alt={data.name}
                className="size-10 rounded-full flex-shrink-0"
              />

              <div className="flex flex-col">
                <div className="flex flex-col space-x-2 mb-1 gap-0.5">
                  <h3 className="font-semibold text-primary text-sm">
                    {data.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{data.title}</p>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {data.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Testimonials2 }
