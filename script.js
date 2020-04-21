ymaps.ready(init);
function init() {
    getJson('https://gremuar.github.io/LiveStreetsMap/map_data.json').then((config) => {
        if (typeof (config) == "object") {
            console.log(config);
            mapInit(config.map);
            if (typeof (lsm) == 'object') {
                let searchControl, mapObjects, clusterer, streets;

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
                hintContent: places[i].hint+" "+places[i].id
            },
                {
                    iconColor: opt.iconColor[getRandom(opt.iconColor.length)]
                });
        }
        return geoObjects;
    }

    function getStreets(mapData) {
        let streets = [];

        mapData.map( (obj)=> {
            let temp_str = obj.street.toLowerCase().replace(' ','');
            if(!streets.includes( temp_str )) streets.push( temp_str );
        });
        return streets;
    }
}
