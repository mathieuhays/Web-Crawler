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
        if (link.href && link.href.startsWith('http')) {
            URLs.push(link.href)
        }
    }

    return URLs
}

async function crawlPage(baseURL, currentURL = baseURL, pages={}) {
    if ((new URL(baseURL)).hostname !== (new URL(currentURL)).hostname) {
        return pages
    }

    const normalizedURL = normalizeURL(currentURL)

    if (normalizedURL in pages) {
        pages[normalizedURL].count++
        return pages
    }

    pages[normalizedURL] = {
        count: 1,
        loadTimeMs: null,
        errors: []
    }

    console.log(`crawling ${currentURL}`)

    const timeStart = performance.now()
    let htmlText
    try {
        htmlText = await fetchURL(currentURL)
    } catch (err) {
        pages[normalizedURL].errors.push(err)
        return pages
    }
    const timeEnd = performance.now()
    pages[normalizedURL].loadTimeMs = timeEnd - timeStart

    const URLs = getURLsFromHTML(htmlText, baseURL)

    if (URLs.length) {
        for (const url of URLs) {
            pages = await crawlPage(baseURL, url, pages)
        }
    }

    return pages;
}

async function fetchURL(currentURL) {
    let response
    try {
        response = await fetch(currentURL, {
            method: 'GET'
        })
    } catch (err) {
        throw new Error(`Request Error: ${err.message}`)
    }

    if (response.status >= 400) {
        throw new Error(`Couldn't fetch URL. Status: ${response.statusText} (${response.status})`)
    }

    let contentType
    try {
        contentType = response.headers.get('Content-Type')
    } catch (err) {}

    if (!contentType || !contentType.includes('text/html')) {
        throw new Error(`Unexpected content type at URL: ${contentType}`)
    }

    return response.text();
}

function sortPages(pages) {
    const keys = Object.keys(pages)
    const sortedKeys = keys.sort((a, b) => {
        return pages[b].count - pages[a].count
    })
    let final = {}

    for (const key of sortedKeys) {
        final[key] = pages[key]
    }

    return final
}

function printReport(pages) {
    const keys = Object.keys(pages)

    if (keys.length < 1) {
        console.log('No results to show')
        return
    }

    let total = 0

    for (const key of keys) {
        const page = pages[key]
        const prettyTime = Math.round(page.loadTimeMs*100)/100
        total += page.loadTimeMs
        console.log(`Found ${page.count} internal links to ${key}. This page takes ${prettyTime}ms to load.`)
    }

    const averageLoadTime = total/keys.length
    const prettyAverage = Math.round(averageLoadTime*100)/100
    console.log(`The website took an average of ${prettyAverage}ms to respond`)
}

export {normalizeURL, getURLsFromHTML, crawlPage, printReport, sortPages};