import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import swiss from './swiss'
import moment from 'moment'
import * as _ from 'lodash'
const fetch = require('node-fetch')
moment.locale('de')

const app = express()

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors())

app.use('/', express.static('public'))
app.get('/milestones/:id', async (req, res) => {
    var activeYear = parseInt(req.params.id)
    const timelineData = await getTimelineData()

    const milestones = await getMilestones(activeYear, timelineData)

    res.json(milestones)
})

const getTimelineData = async () => {
    const timelineRequest = await fetch(
        'http://localhost:8000/stats/person_birth_death_pic',
        {
            method: 'GET',
        }
    )

    const data = await timelineRequest.json()

    const name = _.values(data.name)
    const birthday = _.values(data.date_of_birth)
    const deathday = _.values(data.date_of_birth)
    const img = _.values(data.link)

    const date = moment(moment(birthday[0]).format('YYYY MMM DD')).format(
        'YYYY,M,D'
    )

    const milestones = name.map((n, i) => {
        return {
            birthday: birthday[i],
            deathday: deathday[i],
            name: n,
            img: img[i],
        }
    })

    return milestones
}

const getMilestones = (activeYear: any, milestones: any) => {
    const currentMilestones = milestones.map((e: any, i: any) => {
        //console.log(e.birthday)

        if (e.birthday && e.birthday.trim() !== '') {
            var reg1 = new RegExp('[1-9][0-9][0-9][0-9]$')
            var reg2 = new RegExp('[1-9][0-9][0-9][0-9]~$')
            var reg3 = new RegExp(
                /([1-9][0-9][0-9][0-9]\s[A-Z][a-z][a-z]\s([0][1-9]|[1-3][0-9]))$/
            )

            const varInit = (date: any) => {
                if (date.match(reg1)) {
                    return moment(moment(date).format('YYYY')).format(
                        'YYYY,M,D'
                    )
                } else if (date.match(reg2)) {
                    return moment(
                        moment(date.replace('~', '')).format('YYYY')
                    ).format('YYYY,M,D')
                } else if (date.match(reg3)) {
                    return moment(
                        moment(date, 'YYYY MMM DD').format('YYYY MMM DD'),
                        'YYYY MMM DD'
                    ).format('YYYY,M,D')
                }
            }

            const birthday = varInit(e.birthday)
            const deathday = varInit(e.birthday)
            const response = []

            if (
                parseInt(moment(birthday).format('YYYY')) <=
                    parseInt(activeYear + 50) &&
                parseInt(moment(birthday).format('YYYY')) >=
                    parseInt(activeYear)
            ) {
                response.push({
                    startDate: birthday,
                    headline: `* ${e.name}`,
                    text: `${e.name} wird geboren`,
                    asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },
                })
            }

            if (
                parseInt(moment(deathday).format('YYYY')) <=
                    parseInt(activeYear + 50) &&
                parseInt(moment(deathday).format('YYYY')) >=
                    parseInt(activeYear)
            ) {
                response.push({
                    startDate: deathday,
                    headline: `† ${e.name}`,
                    text: `${e.name} verstirbt`,
                    asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },
                })
            }
            //console.log('response', response)
            return response
        }
    })

    const source = {
        timeline: {
            headline: 'Die Geschichte beginnt ...',
            text: 'Meilensteine um 1200',
            startdate: '1220',
            type: 'default',
            date: _.spread(_.union)(currentMilestones),
        },
    }
    return source
}
const server = app.listen(5000, () => {
    console.log('server is running')
})

export default server
