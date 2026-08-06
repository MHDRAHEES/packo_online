'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Play } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'

const videos = [
  {
    id: 1,
    title: 'Product Promo',
    description: 'Explore our latest premium products.',
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/sMO-IurmaYM',
    url: 'https://youtube.com/shorts/sMO-IurmaYM',
  },
  {
    id: 2,
    title: 'Product Review',
    description: 'See your favorite products in action.',
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/wybnzDytBVw',
    url: 'https://youtube.com/shorts/wybnzDytBVw',
  },
  // {
  //   id: 3,
  //   title: 'Instagram Highlights',
  //   description: 'Follow our latest updates.',
  //   type: 'instagram',
  //   embedUrl: '',
  //   url: 'https://www.instagram.com/reel/YOUR_REEL_ID/',
  // },  {
{
  id: 3,
  title: 'Product Review',
  description: 'See your favorite products in action.',
  type: 'youtube',
  embedUrl: 'https://www.youtube.com/embed/xmI7L8NShYY',
  url: 'https://youtube.com/shorts/xmI7L8NShYY',
},
]

export function VideoShowcase() {
  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
            Watch product stories, product reviews and our latest collections.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Video */}
              <div className="relative aspect-video bg-green-950">
                {video.type === 'youtube' ? (
                  <>
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    <button
                      onClick={() => openVideo(video.url)}
                      className="absolute inset-0 z-10"
                      aria-label="Open Video"
                    />
                  </>
                ) : (
                  <button
                    onClick={() => openVideo(video.url)}
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-800 to-green-950"
                  >
                    <div className="text-center text-white">
                      <Play className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/20 p-3" />
                      <p className="font-semibold">
                        Open Instagram Reel
                      </p>
                    </div>
                  </button>
                )}

                <div className="pointer-events-none absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-green-800">
                  <Play className="h-5 w-5 fill-current" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-green-950">
                  {video.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {video.description}
                </p>

                <button
                  onClick={() => openVideo(video.url)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Now
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}