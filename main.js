import {argv, exit} from 'node:process'
import {crawlPage, printReport, sortPages} from './crawl.js'

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

    printReport(sortPages(pages))
}

function showUsage() {
    console.log('Usage: npm run start {base_url}')
}

await main()