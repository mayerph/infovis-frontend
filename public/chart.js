let chartOverview

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

const drawChartOverview = () => {
    chartOverview = new Chart(document.getElementById('bar-chart-grouped'), {
        type: 'bar',
        data: {
            labels: values2.keys,
            datasets: values2[activeYear()]
                .filter(e =>
                    active.map(e => e.properties.NAME).includes(e.country)
                )
                .map(e => {
                    return {
                        label: e.country,
                        backgroundColor: getRandomColor(),
                        data: e.values,
                    }
                }),
        },
        options: {
            title: {
                display: false,
                text: 'Die Habsburger Familienverhältnisse',
            },
            legend: {
                position: 'bottom',
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        },
    })
    chartOverview.update()
}

const updateChartOverview = () => {
    chartOverview.destroy()
    drawChartOverview()
}

drawChartOverview()
