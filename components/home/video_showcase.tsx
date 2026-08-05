'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'

const videos = [
  {
    id: 1,
    title: 'Premium Collection Showcase',
    description: 'Explore our latest premium products.',
    type: 'youtube',
    url: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
  },
  {
    id: 2,
    title: 'Customer Experience',
    description: 'See how customers love Verdant.',
    type: 'youtube',
    url: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
  },
  {
    id: 3,
    title: 'Instagram Highlights',
    description: 'Follow our latest updates.',
    type: 'instagram',
    url: 'https://www.instagram.com/reel/YOUR_REEL_ID/embed',
  },
]

export function VideoShowcase() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <Reveal className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            Watch & Discover
          </p>

          <h2 className="mt-3 font-heading text-3xl font-bold text-green-950 sm:text-4xl">
            Experience Verdant
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Watch product stories, customer experiences and latest collections.
          </p>
        </Reveal>


        <div className="grid gap-8 md:grid-cols-3">

          {videos.map((video, index) => (

            <motion.div
              key={video.id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once:true
              }}
              transition={{
                duration:0.5,
                delay:index * 0.1
              }}
              className="
                overflow-hidden
                rounded-3xl
                border
                border-green-100
                bg-white
                shadow-lg
                transition
                hover:-translate-y-2
                hover:shadow-2xl
              "
            >

              {/* Video */}
              <div className="relative aspect-video bg-green-950">

                <iframe
                  src={video.url}
                  title={video.title}
                  className="h-full w-full"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture
                  "
                  allowFullScreen
                />

                <div className="
                  pointer-events-none
                  absolute
                  left-4
                  top-4
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  text-green-800
                ">
                  <Play className="size-5 fill-current"/>
                </div>

              </div>


              {/* Content */}
              <div className="p-6">

                <h3 className="
                  font-heading
                  text-xl
                  font-bold
                  text-green-950
                ">
                  {video.title}
                </h3>


                <p className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-gray-600
                ">
                  {video.description}
                </p>


                <button
                  className="
                    mt-5
                    rounded-xl
                    bg-green-800
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-green-900
                  "
                >
                  Watch Now
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  )
}