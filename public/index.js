var width = 1700,
    height = 700
var active = []

var projection = d3.geo
    .mercator()
    .scale(230000)
    .center([-119.5, 35])
    .translate([width / 1.13, height * 1.6])

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
    console.log('d', this)
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
    console.log(active)
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

const updateFirstStoryConclusion = () => {
    firstStoryConclusionYear.forEach(e => {
        e.innerHTML = activeYear()
    })
    firstStoryConclusion.innerHTML =
        values2[activeYear()].first_story_conclusion
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
        d3.json(`/data/data_${activeYearElementJson()}.json`, function(
            error,
            h2o
        ) {
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
                    const element = values2[activeYear()].relationships.filter(
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
    document.querySelector('#timeline-embed').innerHTML = ''
    const source = `timeline/data/data_${year}.json`
    createStoryJS({
        width: '100%',
        height: '500',
        source,
        embed_id: 'timeline-embed', //OPTIONAL USE A DIFFERENT DIV ID FOR EMBED
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
createTimeline(activeYear())
//#########################################################################################################

const onYearUpdate = async () => {
    updateChartOverview()
    updateFirstStoryConclusion()
    createTimeline(activeYear())
}
