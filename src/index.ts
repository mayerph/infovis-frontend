import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import swiss from './swiss'

const app = express()

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors())

app.use('/', express.static('public'))
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('hell world')
})

export default server
