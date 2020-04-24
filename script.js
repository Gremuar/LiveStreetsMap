ymaps.ready(init);
function init() {
    getJson('https://gremuar.github.io/LiveStreetsMap/map_data.json').then((config) => {
        if (typeof (config) == "object") {
            mapInit(config.map);
            if (typeof (lsm) == 'object') {
                let searchControl, mapObjects, clusterer, streets, controls;

                lsm.config = config;
                searchControl = lsm.controls.get('searchControl');
                searchControl.options.set(config.searchControl);
                mapObjects = genMapObjects({
                    "placemark_options": config.placemark_options,
                    "placemark_data": config.placemark_data
                });
                clusterer = new ymaps.Clusterer(config.clusterer);
                clusterer.add(mapObjects);
                lsm.geoObjects.add(clusterer);
                streets = getStreets(config.placemark_data.places);
                controls = lsm.data = genControls(streets);
                addEvents(controls);
                lsm.controls.add(controls.location, { floatIndex: 1 }).add(controls.street, { floatIndex: 0 });
            };
        } else {
            console.warn(config);
            let cont = document.querySelector('#LiveStreets');
            cont.style.cssText = 'width:auto;height:auto;'
            cont.classList.add('alert-msg__danger', 'alert-msg');
            cont.innerHTML = "Не удалось загрузить конфигурацию карты =\\";
        }
    });

    //Functions
    function getRandom(max) {
        return Math.floor(Math.random() * max);
    }

    async function getJson(url) {
        let response = await fetch(url);
        if (response.ok) {
            let json = await response.json();
            return json;
        } else {
            return "Ошибка HTTP: " + response.status;
        }
    }

    function mapInit(conf) {
        window.lsm = new ymaps.Map(conf.conteiner, conf.params, conf.options);
    }

    function genMapObjects(mapData) {
        let geoObjects = [],
            places = mapData.placemark_data.places,
            opt = mapData.placemark_options;

        for (let i = 0; i < places.length; i++) {
            geoObjects[i] = new ymaps.Placemark(places[i].coords, {
                balloonContentHeader: places[i].header,
                balloonContentBody: "<div style='max-width:300px'>" +
                    "<img src='" + places[i].photo + "' style='float:left;width:30%;margin-right:10px'/>" +
                    "<p>" + places[i].text + "</p>",
                balloonContentFooter: "<a href='" + places[i].link + "' target='_blank'>Подробнее о проекте</a>",
                hintContent: places[i].hint,
                iconContent: (hIcon => hIcon.includes('::') ? hIcon.slice(0, hIcon.indexOf('::')) : hIcon)(places[i].header)
            },
                {
                    preset: 'islands#blueStretchyIcon',
                    iconColor: opt.iconColor[getRandom(opt.iconColor.length)]
                });
        }
        return geoObjects;
    }

    function getStreets(mapData) {
        let streets = {};
        mapData = mapData.map(obj => obj.street.toLowerCase().replace(' ', '')).sort();
        mapData.forEach(street => {
            street = street.split(',');
            if (Object.keys(streets).includes(street[0])) {
                if (!streets[street[0]].includes(street[1])) streets[street[0]].push(street[1])
            } else { streets[street[0]] = [street[1]] }
        });
        return streets;
    }

    function genControls(streets_list) {
        let locs = Object.keys(streets_list).map((e, i) => {
            return new ymaps.control.ListBoxItem({
                data: {
                    content: e[0].toUpperCase() + e.slice(1),
                    zoom: 13
                },
                state: {
                    selected: false
                },
                options: { type: '1' }
            })
        });
        for (let loc in streets_list) {
            streets_list[loc] = streets_list[loc].map(street => {
                return new ymaps.control.ListBoxItem({
                    data: {
                        content: street[0].toUpperCase() + street.slice(1),
                        source_list: loc
                    },
                    state: { selected: false },
                    options: { type: '1' }
                })
            })
        }
        [].concat(locs, Object.values(streets_list).reduce((m, n) => [...m, ...n])).forEach(point => setCoords(point))
        return {
            'location': new ymaps.control.ListBox({
                data: {
                    content: 'Насленный пункт',
                    streets: streets_list
                },
                items: locs,
                options: {
                    itemSelectOnClick: false
                },
                state: {
                    'tKey': ['testData']
                }
            }),
            'street': new ymaps.control.ListBox({
                data: {
                    content: 'Улица'
                },
                items: [],
                options: {
                    itemSelectOnClick: false,
                    visible: false
                }
            })
        }
    }

    function addEvents(controls) {
        controls.location.events.add('click', event => {
            let target = event.get('target'),
                tData = target.data.getAll(),
                map = target.getMap();

            if (target.options._name !== 'listBox') {
                let parent = target.getParent(),
                    pData = parent.data.getAll();
                map.setCenter(tData.coords, tData.zoom ? tData.zoom : 17);
                controls.street.removeAll();
                parent.data.set('content', tData.content);
                pData.streets[tData.content.toLowerCase()].forEach(street => controls.street.add(street));
                controls.street.data.set('content', 'Улица')
                controls.street.options.set('visible', true);
            }
        });
        controls.street.events.add('click', event => {
            let target = event.get('target'),
                tData = target.data.getAll(),
                map = target.getMap();

            if (target.options._name !== 'listBox') {
                let parent = target.getParent(),
                    pData = parent.data.getAll();
                map.setCenter(tData.coords, tData.zoom ? tData.zoom : 17);
                parent.data.set('content', tData.content);
            }
        })
    }

    async function setCoords(street_control) {
        let zone = lsm.options.get('restrictMapArea'),
            prefix = street_control.data.get('source_list') + ',' || '',
            result = await ymaps.geocode(prefix + street_control.data.get('content'), {
                boundedBy: zone,
                kind: 'street',
                strictBounds: true
            });
        street_control.data.set('coords', result.geoObjects.get(0).geometry.getCoordinates());
    }

    function transposeArray(arr) {
        return arr[0].map((col, i) => arr.map(row => row[i]));
    }
}