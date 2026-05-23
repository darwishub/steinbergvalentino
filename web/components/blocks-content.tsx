import React from 'react'
import type { StrapiBlock, StrapiMedia } from '@/lib/types'
import { getStrapiMedia } from '@/lib/strapi'

type InlineChild = {
  type: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  url?: string
  children?: InlineChild[]
}

function renderInline(children: InlineChild[]): React.ReactNode[] {
  return children.map((child, i) => {
    // Link node — render children as the visible text
    if (child.type === 'link') {
      const linkText = child.children?.map((c) => c.text ?? '').join('') ?? ''
      return (
        <a
          key={i}
          href={child.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-sv-gold)', textDecoration: 'underline' }}
        >
          {linkText}
        </a>
      )
    }

    let node: React.ReactNode = child.text ?? ''
    if (child.bold)
      node = (
        <strong key={i} style={{ fontWeight: 600, color: 'inherit' }}>
          {node}
        </strong>
      )
    if (child.italic) node = <em key={i}>{node}</em>
    if (child.underline) node = <u key={i}>{node}</u>
    return <span key={i}>{node}</span>
  })
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

interface BlocksContentProps {
  blocks: StrapiBlock[] | null | undefined
  className?: string
}

export function BlocksContent({ blocks, className }: BlocksContentProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className={`sv-rich-text ${className ?? ''}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            if (!block.children.some((c) => c.text?.trim())) return null
            return <p key={i}>{renderInline(block.children as InlineChild[])}</p>

          case 'heading': {
            const level = Math.min(Math.max(block.level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6
            const Tag = HEADING_TAGS[level - 1]
            return <Tag key={i}>{renderInline(block.children as InlineChild[])}</Tag>
          }

          case 'list': {
            const ListTag = block.format === 'ordered' ? 'ol' : 'ul'
            return (
              <ListTag
                key={i}
                style={{
                  listStyle: block.format === 'ordered' ? 'decimal' : 'none',
                  paddingLeft: block.format === 'ordered' ? '1.5rem' : 0,
                }}
              >
                {block.children.map((item, j) => (
                  <li
                    key={j}
                    style={{
                      paddingLeft: block.format === 'unordered' ? '1.25rem' : 0,
                      position: 'relative',
                      marginBottom: '0.5rem',
                      color: 'var(--color-sv-slate)',
                    }}
                  >
                    {block.format === 'unordered' && (
                      <span
                        style={{ position: 'absolute', left: 0, color: 'var(--color-sv-gold)' }}
                      >
                        —
                      </span>
                    )}
                    {renderInline((item as { type: string; children: InlineChild[] }).children)}
                  </li>
                ))}
              </ListTag>
            )
          }

          case 'quote':
            return (
              <blockquote
                key={i}
                style={{
                  borderLeft: '3px solid var(--color-sv-gold)',
                  paddingLeft: '1.25rem',
                  margin: '1.5rem 0',
                  fontStyle: 'italic',
                  color: 'var(--color-sv-slate)',
                }}
              >
                {renderInline(block.children as InlineChild[])}
              </blockquote>
            )

          case 'image': {
            const img = block.image as StrapiMedia
            if (!img?.url) return null
            const src = getStrapiMedia(img.url) ?? img.url
            return (
              <figure
                key={i}
                style={{ margin: '1.5rem 0', lineHeight: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={img.alternativeText ?? ''}
                  width={img.width || undefined}
                  height={img.height || undefined}
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  loading="lazy"
                />
              </figure>
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}
