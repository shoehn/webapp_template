import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'

describe('Card Components', () => {
  it('should render Card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('should apply custom className to Card', () => {
    const { container } = render(
      <Card className="custom-card">Content</Card>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('custom-card')
  })

  it('should apply custom className to CardHeader', () => {
    const { container } = render(
      <CardHeader className="custom-header">Header</CardHeader>
    )
    const header = container.firstChild as HTMLElement
    expect(header.className).toContain('custom-header')
  })

  it('should render CardTitle as div element', () => {
    render(<CardTitle>Title Text</CardTitle>)
    const title = screen.getByText('Title Text')
    expect(title.tagName).toBe('DIV')
  })

  it('should render CardDescription with muted styling', () => {
    const { container } = render(
      <CardDescription>Description Text</CardDescription>
    )
    const description = container.firstChild as HTMLElement
    expect(description.className).toContain('text-sm')
  })
})
