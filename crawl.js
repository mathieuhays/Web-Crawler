function normalizeURL(url) {
    const urlObj = new URL(url)
    let path = urlObj.pathname

    if (path.length > 0 && path[path.length-1] === '/') {
        path = path.slice(0, -1)
    }

    return `${urlObj.hostname}${path}`.toLowerCase()
}

export {normalizeURL};