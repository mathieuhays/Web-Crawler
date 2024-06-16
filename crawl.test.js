import { expect, describe, it} from "@jest/globals"
import {normalizeURL} from "./crawl.js";

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

