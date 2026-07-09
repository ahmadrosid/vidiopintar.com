import React from "react";

const socialPostsData = [
  {
    id: 1,
    name: "Razii Abraham",
    title: "Heatseeker - Product Manager",
    avatar: "/testimonials/razii.jpeg",
    content:
      'Keren banget, udah nyobain! "Nonton" podcast, cukup liat table of content di description, terus langsung tanya-tanya aja based on section? Video nya di chatbox nya. Reply nya lupa bagus tone of voice LLM nya. Bonus: interface sleek and modern banget, well done!',
  },
  {
    id: 2,
    name: "Amik Dwiokta",
    title: "Content Creator",
    avatar: "/testimonials/ibunyaboemi.jpeg",
    content:
      "Ini keren banget sih. Bisa chit chat bahas isi videonya rupanya 😁 Pernah coba site serupa untuk ngerangkum video ytube juga. Tapi nggak ada chitchat session gini 😊 kadang yang di rangkum ada beberapa poin gatau dia dapatnya dari mana 🤔😁",
  },
  {
    id: 3,
    name: "Fizu - sadarutuh.id",
    title: "Content Creator | Personal Growth",
    avatar: "/testimonials/sadarutuh.jpeg",
    content:
      "vidiopintar.com keren sih ini. 🔥 Terobosan yang baru buat summary video yang durasinya panjang, tapi cuman mau ambil point-pointnya. Kalo kesulitan tinggal tanyakan dengan berikan penjelasan yang lebih mudah.",
  },
];

export const Testimonial = () => {
  return (
    <section className="flex flex-col gap-4 pt-9 select-none">
      <h2 className="sr-only">What early users say about Vidiopintar</h2>
      <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-3">
        {socialPostsData.map((post) => (
          <div
            key={post.id}
            className="bg-card hover:bg-card/90 rounded-xs pl-5 pr-6 py-7 shadow-lg "
          >
            <div className="flex items-start space-x-4">
              <img
                src={post.avatar}
                alt={post.name}
                className="size-10 rounded-full flex-shrink-0"
              />

              <div className="flex flex-col">
                <div className="flex flex-col space-x-2 mb-1 gap-0.5">
                  <p className="font-semibold text-primary text-sm">
                    {post.name}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">{post.title}</p>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {post.content}
                </p>

              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

