import {argv, exit} from 'node:process'
import {crawlPage} from './crawl.js'

async function main() {
    const args = argv.slice(2)

    if (args.length !== 1) {
        console.error(args.length < 1 ? 'Missing base URL' : 'Too many arguments')
        showUsage()
        exit(1)
    }

    let baseURL;
    try {
        baseURL = new URL(args[0])
    } catch (err) {
        console.error(err.message)
        showUsage()
        exit(1)
    }

    console.log(`Starting to crawl ${baseURL}`)
    const pages = await crawlPage(baseURL)

    console.log('pages', pages)
    console.log('average load time', averageLoadTime(pages))
}

function showUsage() {
    console.log('Usage: npm run start {base_url}')
}

function averageLoadTime(pages) {
    if (pages.length<1) {
        return 0;
    }

    let total = 0
    const keys = Object.keys(pages)

    for (const page of keys) {
        total += pages[page].loadTimeMs
    }

    return total/keys.length
}

await main()