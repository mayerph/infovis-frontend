var width = 1700,
    height = 600
var active = []
var values2 = { keys: [], '1200': [] }

var projection = d3.geo
    .mercator()
    .scale(50000)
    .center([-119.5, 35])
    .translate([width / 2, height / 2])

var path = d3.geo.path().projection(projection)

var svg = d3
    .select('#map-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

svg.append('rect')
    .attr('width', width)
    .attr('height', height)

var tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'hidden tooltip2')

var g = svg.append('g')
let coordiante = { x: -1, y: -1 }
let myInterval
let activeCountries = []

function click(d) {
    if (active.includes(d)) {
        active = active.filter(e => e !== d)
        activeCountries = activeCountries.filter(e => e !== d.properties.NAME)
        d3.select(this).classed('active', false)
    } else {
        active = active.concat(d)
        activeCountries = activeCountries.concat(d.properties.NAME)
        d3.select(this).classed('active', true)
        var b = path.bounds(d)
    }
    updateChartOverview()
}

document.getElementById('reset-button').addEventListener('click', () => {
    reset()
})

function reset() {
    g.selectAll('.active').classed('active', false)
    active = []
    g.transition()
        .duration(750)
        .attr('transform', '')

    document.querySelector('.select-button[name="0"]').click()
    drawChartOverview()
}

const toggleButtonGroup = document.querySelectorAll(
    '.toggle-button-group button'
)
const activeYearElement = () => {
    return document.querySelector('.toggled-button')
}

const activeYearElementJson = () => {
    return activeYearElement().getAttribute('data-json')
}

const activeYear = () => {
    return activeYearElement().innerHTML
}

for (let i = 0; i < toggleButtonGroup.length; i++) {
    toggleButtonGroup[i].addEventListener('click', function(e) {
        if (toggleButtonGroup[i].classList.contains('toggled-button')) {
            console.log('true')
        } else {
            const was = document
                .querySelector('.toggled-button')
                .classList.remove('toggled-button')
            toggleButtonGroup[i].classList.add('toggled-button')
            onYearUpdate()
            drawMap()
        }
    })
}

const firstStoryConclusionYear = document.querySelectorAll('.selected-year')

const firstStoryConclusion = document.querySelector('#first-story-conclusion')
const firstStoryConclusionTitle = document.querySelector(
    '#first-story-conclusion-title'
)

const updateFirstStoryConclusion = () => {
    firstStoryConclusionYear.forEach(e => {
        e.innerHTML = activeYear()
    })
    firstStoryConclusion.innerHTML =
        values3[activeYear()].first_story_conclusion
    firstStoryConclusionTitle.innerHTML =
        values3[activeYear()].first_story_conclusion_title
}

updateFirstStoryConclusion()

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip()
})
let activeGeoJson = ''
const drawMap = () => {
    if (activeGeoJson != activeYearElementJson()) {
        activeGeoJson = activeYearElementJson()
        d3.selectAll('path').remove()
        d3.json(`/data/data.json`, function(error, h2o) {
            g.selectAll('path')
                .data(topojson.object(h2o, h2o.objects.hu12).geometries)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', 'feature')
                .on('click', click)
                .on('mouseenter', function(d) {
                    let value = ''
                    const keys = values2.keys
                    const element = values2[activeYear()].filter(
                        e => e.country == d.properties.NAME
                    )[0]
                    if (element) {
                        value = `<span class="tooltip2-head">${element.country}</span></br><span class="tooltip2-body">Herren: ${element.values[0]}</br>Damen: ${element.values[1]}</br>Inzest: ${element.values[2]}</span>`
                    } else {
                        value = d.properties.NAME
                    }
                    tooltip.html(value)
                })
                .on('mousemove', function() {
                    tooltip
                        .classed('hidden', false)
                        .attr(
                            'style',
                            'left:' +
                                (coordiante.x + 15) +
                                'px; top:' +
                                (coordiante.y - 35) +
                                'px'
                        )
                })
                .on('mouseout', function() {
                    tooltip.classed('hidden', true)
                })

            $(document).mousemove(function(event) {
                coordiante.x = event.pageX
                coordiante.y = event.pageY
            })

            g.append('path')
                .datum(
                    topojson.mesh(h2o, h2o.objects.hu12, function(a, b) {
                        return a !== b
                    })
                )
                .attr('class', 'mesh')
                .attr('d', path)

            d3.selectAll('path').each(function(d, i) {
                if (
                    d.properties &&
                    activeCountries.includes(d.properties.NAME)
                ) {
                    d3.select(this).classed('active', true)
                }
            })
        })
    }
}

drawMap()
//########################################  Timeline   ##################################################

const createTimeline = year => {
    /*getTimelineData((milestones) => {

    })*/

    const currentMilestones = milestones.map((e, i) => {
        //console.log(e.birthday)

        if (e.birthday && e.birthday.trim() !== '') {
            var reg1 = new RegExp('[1-9][0-9][0-9][0-9]$')
            var reg2 = new RegExp('[1-9][0-9][0-9][0-9]~$')
            var reg3 = new RegExp(
                /([1-9][0-9][0-9][0-9]\s[A-Z][a-z][a-z]\s([0][1-9]|[1-3][0-9]))$/
            )

            const varInit = date => {
                if (date.match(reg1)) {
                    return null
                } else if (date.match(reg2)) {
                    return null
                } else if (date.match(reg3)) {
                    return moment(
                        moment(date, 'YYYY MMM DD').format('YYYY MMM DD'),
                        'YYYY MMM DD'
                    ).format('YYYY,M,D')
                }
            }

            const birthday = varInit(e.birthday)
            const deathday = varInit(e.deathday)
            const response = []

            if (
                (birthday,
                parseInt(moment(birthday).format('YYYY')) <=
                    parseInt(year) + 50 &&
                    parseInt(moment(birthday).format('YYYY')) >= parseInt(year))
            ) {
                response.push({
                    startDate: birthday,
                    headline: `* ${e.name}`,
                    text: `${e.name} wird geboren`,
                    /*asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },*/
                })
            }
            if (
                (deathday,
                parseInt(moment(deathday).format('YYYY')) <=
                    parseInt(year) + 50 &&
                    parseInt(moment(deathday).format('YYYY')) >= parseInt(year))
            ) {
                response.push({
                    startDate: deathday,
                    headline: `† ${e.name}`,
                    text: `${e.name} verstirbt`,
                    /*asset: {
                        media: e.img,
                        credit: '',
                        caption: '',
                    },*/
                })
            }
            //console.log('response', response)
            return response
        }
    })

    let elements = _.spread(_.union)(currentMilestones)
    /*elements = elements.slice(
        elements.length > 50 ? 50 : elements.length,
        elements.length
    )*/
    elements = elements.slice(1, 150)

    const source = {
        timeline: {
            headline: 'Die Geschichte beginnt ...',
            text: `Geburts- & Todestage um ${activeYear()}`,
            type: 'default',
            date: elements,
        },
    }

    //console.log('source', source)
    document.querySelector('#timeline-embed-1').innerHTML = ''

    var JS = document.createElement('script')
    JS.text = 'jsFile=' + source
    json = source

    //body.appendChild(script)

    createStoryJS({
        width: '100%',
        height: '500',
        source: json,
        id: 'timeline1',
        embed_id: 'timeline-embed-1', //OPTIONAL USE A DIFFERENT DIV ID FOR EMBED
        start_at_end: false, //OPTIONAL START AT LATEST DATE
        //start_at_slide: '4', //OPTIONAL START AT SPECIFIC SLIDE
        start_zoom_adjust: '0', //OPTIONAL TWEAK THE DEFAULT ZOOM LEVEL
        //hash_bookmark: true, //OPTIONAL LOCATION BAR HASHES
        //font: 'Bevan-PotanoSans', //OPTIONAL FONT
        //debug: true, //OPTIONAL DEBUG TO CONSOLE
        lang: 'de', //OPTIONAL LANGUAGE
        maptype: 'toner-labels', //OPTIONAL MAP STYLE
        css: 'timeline/css/timeline.css', //OPTIONAL PATH TO CSS
        js: 'timeline/js/timeline-min.js', //OPTIONAL PATH TO JS
    })
}

getTimelineData().then(() => {
    createTimeline(activeYear())
})

//#########################################################################################################

const onYearUpdate = () => {
    updateChartOverview()
    updateFirstStoryConclusion()
    createTimeline(activeYear())
}

const getUrlYear = () => {
    var urlParams = new URLSearchParams(window.location.search)
    year = urlParams.get('year')
    return year
}
