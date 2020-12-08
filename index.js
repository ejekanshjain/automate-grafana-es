require('dotenv').config()
const axios = require('axios')
const async = require('async')

const dataSources = require('./dataSources.json')

const { GRAFANA_URL, API_KEY } = process.env

const main = async () => {
    if (!GRAFANA_URL || !API_KEY) {
        console.error('GRAFANA_URL & API_KEY are required!')
        process.exit(1)
    }
    if (!dataSources && !Array.isArray(dataSources) && !dataSources.length) return
    await async.forEachLimit(dataSources, 1, async ({ name, url, index }) => {
        if (!name || !url || !index) return
        try {
            await axios({
                url: GRAFANA_URL + '/api/datasources',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                },
                data: {
                    name,
                    url,
                    database: index,
                    jsonData: {
                        esVersion: 70,
                        timeField: "timestamp",
                        maxConcurrentShardRequests: 5
                    },
                    type: "elasticsearch",
                    access: "proxy",
                    basicAuth: false,
                    isDefault: false
                }
            })
            console.log(`Added Data Source ${name}`)
        } catch (err) {
            console.error(`Failed to add Data Source ${name}`, err)
        }
    })
}

main()
    .then(() => {
        console.log('Finished...')
        process.exit(0)
    }).catch(err => {
        console.error(err)
        process.exit(1)
    })