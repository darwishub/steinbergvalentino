import React from 'react'
import type { StrapiBlock } from '@/lib/types'

type InlineChild = { type: string; text: string; bold?: boolean; italic?: boolean }

function renderInline(children: InlineChild[]) {
  return children.map((child, i) => {
    let node: React.ReactNode = child.text
    if (child.bold)
      node = (
        <strong key={i} style={{ fontWeight: 600, color: 'inherit' }}>
          {node}
        </strong>
      )
    if (child.italic) node = <em key={i}>{node}</em>
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

          default:
            return null
        }
      })}
    </div>
  )
}
