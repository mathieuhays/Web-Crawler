import { expect, describe, it} from "@jest/globals"
import {normalizeURL, getURLsFromHTML, sortPages} from "./crawl.js";

describe('normalizeURL', () => {
    it('strips out protocol and trailing slash', () => {
        expect(normalizeURL('http://site.example.com/blog/')).toBe('site.example.com/blog')
    })

    it('strip out secure protocol', () => {
        expect(normalizeURL('https://www.example.com/blog')).toBe('www.example.com/blog')
    })

    it('strips out query string', () => {
        expect(normalizeURL('http://example.com/?test')).toBe('example.com')
        expect(normalizeURL('http://example.com/test/?test')).toBe('example.com/test')
    })

    it('has consistent casing', () => {
        expect(normalizeURL('https://www.example.com/BLOG')).toBe('www.example.com/blog')
    })

    it('throws when invalid url is provided', () => {
        expect(() => {
            normalizeURL('example.com/test')
        }).toThrow(new TypeError('Invalid URL'))
    })
})

describe('getURLsFromHTML', () => {
    it('detects a absolute link', () => {
        const html = `
        <!doctype html>
        <html>
        <head></head>
        <body>
            <p>
                random content
            </p>
            <p>
                more content <a href="https://boot.dev">with a link</a>
            </p>
        </body>
        </html>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(1)
        expect(links).toContain('https://boot.dev/')
    })

    it('detects a relative link', () => {
        const html = `
        <!doctype html>
        <html>
        <head></head>
        <body>
            <p>
                random content
            </p>
            <p>
                more content <a href="/blog">with a link</a>
            </p>
        </body>
        </html>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(1)
        expect(links).toContain('https://example.com/blog')
    })

    it('detects link with HTML missing its doctype', () => {
        const html = `
        <p>some content</p>
        <a href="https://example.com">link</a>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(1)
        expect(links).toContain('https://example.com/')
    })

    it('detects multiple links', () => {
        const html = `
        <!doctype html>
        <html>
        <head></head>
        <body>
            <p>
                random content <a href="https://google.com">first link</a>
            </p>
            <p>
                more content <a href="/blog">with a link</a>
            </p>
            <a href="#">third link</a>
        </body>
        </html>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(3)
        expect(links).toContain('https://example.com/blog')
    })

    it('detects links and not anchors', () => {
        const html = `
        <!doctype html>
        <html>
        <head></head>
        <body>
            <p>
                Some content <a href="/blog">with a link</a>
            </p>
            <a id="anchor">I'm not a link</a>
        </body>
        </html>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(1)
        expect(links).toContain('https://example.com/blog')
    })

    it('detects links and not anchors', () => {
        const html = `
        <!doctype html>
        <html>
        <head></head>
        <body>
            <a href="tel:09987654321">phone link</a>
            <a href="mailto:john@example.com">email link</a>
            <a href="https://example.com">URL link</a>
        </body>
        </html>
        `

        const links = getURLsFromHTML(html, 'https://example.com')

        expect(links).toHaveLength(1)
        expect(links).toContain('https://example.com/')
    })
});

describe('sortPages', () => {
    it('should sort pages according to count', () => {
        const pages = {
            'example.com': { count: 15 },
            'example.com/test': { count: 1 },
            'example.com/blog': { count: 5 },
        }

        const expected = {
            'example.com': { count: 15 },
            'example.com/blog': { count: 5 },
            'example.com/test': { count: 1 },
        }

        expect(sortPages(pages)).toEqual(expected)
    });
});