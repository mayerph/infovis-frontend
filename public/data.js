let milestones = []

const getIncestData = async () => {
    const incestRequest = await fetch(
        'http://localhost:8000/stats/incest_relationsships',
        {
            method: 'GET',
        }
    )

    const data_1 = await incestRequest.json()
    const year_1 = _.values(data_1.jahr)
    const country_1 = _.values(data_1.land)
    const incestCount = _.values(data_1.count_incest)

    const mapped_1 = year_1.map((y, i) => {
        return { year: y, country: country_1[i], incestCount: incestCount[i] }
    })

    const mapped2_1 = _.uniqBy(year_1).map((y, i) => {
        const elements = mapped_1
            .filter(e => {
                return e.year == y
            })
            .map(e => {
                return { values: e.incestCount, country: e.country }
            })
        return { [y.toString()]: elements }
    })

    const mapped3_1 = _.assign.apply(_, mapped2_1)
    //console.log('mapped2_1', _.assign.apply(_, mapped2_1))

    // ###################################################################
    // ###################################################################

    const humanRequest = await fetch(
        'http://localhost:8000/stats/men_women_decade',
        {
            method: 'GET',
        }
    )

    const data_2 = JSON.parse(await humanRequest.text())
    const year_2 = _.values(data_2.jahr)
    const country_2 = _.values(data_2.land)
    const gender = _.values(data_2.geschlecht)
    const count = _.values(data_2.count)

    const mapped_2 = year_2.map((y, i) => {
        return {
            year: y,
            country: country_2[i],
            gender: gender[i],
            count: count[i],
        }
    })

    var mapped2_2 = _(mapped_2)
        .groupBy('year')
        .map(function(items, year) {
            const onlyCountry = items.map(e => {
                return e.country
            })

            const result = _.uniqBy(onlyCountry).map((e, i) => {
                const values = items.filter(e2 => {
                    return e2.country == e
                })

                const valuesIncest = !mapped3_1[year]
                    ? 0
                    : mapped3_1[year]
                          .filter(e2 => {
                              return e2.country == e
                          })
                          .map(e => {
                              if (e.values) {
                                  return e.values
                              } else {
                                  return 0
                              }
                          })[0]

                const incest = valuesIncest ? valuesIncest : 0

                //console.log('country', e, 'valuesIncest', valuesIncest)
                const male = values.filter(e3 => e3.gender == 'm')[0]
                    ? values.filter(e3 => e3.gender == 'm')[0].count
                    : 0

                const female = values.filter(e3 => e3.gender == 'w')[0]
                    ? values.filter(e3 => e3.gender == 'w')[0].count
                    : 0

                return {
                    country: e,
                    values: [male, female, incest],
                }
            })
            return {
                [year.toString()]: result,
            }
        })
        .value()

    const finalData = _.assign.apply(_, mapped2_2)
    values2 = {
        keys: ['Herren', 'Damen', 'Inzestbeziehungen'],
        ...finalData,
    }
}

getIncestData()

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
    const deathday = _.values(data.date_of_death)
    const img = _.values(data.link)

    const date = moment(moment(birthday[0]).format('YYYY MMM DD')).format(
        'YYYY,M,D'
    )

    milestones = name.map((n, i) => {
        return {
            birthday: birthday[i],
            deathday: deathday[i],
            name: n,
            img: img[i],
        }
    })

    /*const finalJson = mapped.forEach(e => {
        const date1 = moment(e.birthday).format('YYYY MMM DD')
        if ()
    })*/

    /*const result = _(source)
        .groupBy('birthdate')
        .map(function(items, bdate) {
            return {
                birthdate: bdate,
                names: _.map(items, 'name'),
            }
        })
        .value()*/
    /*{
        "startDate": "1218,5,1",
        "headline": "Rudolf I. wird geboren",
        "text": "Ms. Taylor disclosed that she had congestive heart failure,a disorder in which the heart ",
        "asset": {
            "media": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/2880px-Star_Wars_Logo.svg.png",
            "credit": "",
            "caption": ""
        }
    },*/
}
