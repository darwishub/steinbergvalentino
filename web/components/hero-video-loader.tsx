'use client'

import dynamic from 'next/dynamic'

/* Thin client wrapper so next/dynamic with ssr:false can be used from a Server Component */
const HeroVideoInner = dynamic(
  () => import('@/components/hero-video').then((m) => m.HeroVideo),
  { ssr: false }
)

interface Props {
  src: string
  poster?: string | null
}

export function HeroVideoLoader({ src, poster }: Props) {
  return <HeroVideoInner src={src} poster={poster ?? src} />
}
