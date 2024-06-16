import {JSDOM} from 'jsdom'

function normalizeURL(url) {
    const urlObj = new URL(url)
    let path = urlObj.pathname

    if (path.length > 0 && path[path.length-1] === '/') {
        path = path.slice(0, -1)
    }

    return `${urlObj.hostname}${path}`.toLowerCase()
}

function getURLsFromHTML(htmlBody, baseURL) {
    const dom = new JSDOM(htmlBody, {
        url: baseURL
    })
    const links = dom.window.document.querySelectorAll('a')
    let URLs = []

    for (const link of links) {
        if (link.href) {
            URLs.push(link.href)
        }
    }

    return URLs
}

export {normalizeURL, getURLsFromHTML};