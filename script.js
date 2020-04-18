ymaps.ready(init);
function init() {
    window.lsm = new ymaps.Map("LiveStreets", {
        center: [52.84460345, 88.04247036],
        zoom: 10,
        nativeFullscreen: true,
        controls: ['zoomControl', 'fullscreenControl', 'typeSelector', 'searchControl'],
        restrictMapArea: [[53.294794700094776, 87.06966604079525], [52.439613574668044, 89.06917775954112]],
        suppressMapOpenBlock: true
    });
    searchControl = lsm.controls.get('searchControl');
    searchControl.options.set({
        noPlacemark: true,
        placeholderContent: 'Введите название улицы',
        boundedBy: [[53.294794700094776, 87.06966604079525], [52.439613574668044, 89.06917775954112]],
        strictBounds: true,
        suppressYandexSearch: true,
        noSuggestPanel: true
    });

    // Значения цветов иконок.
    let placemarkColors = [
        '#DB425A', '#4C4DA2', '#00DEAD', '#D73AD2',
        '#F8CC4D', '#F88D00', '#AC646C', '#548FB7'
    ],
        clusterer = new ymaps.Clusterer({
            // Макет метки кластера pieChart.
            clusterIconLayout: 'default#pieChart',
            // Радиус диаграммы в пикселях.
            clusterIconPieChartRadius: 25,
            // Радиус центральной части макета.
            clusterIconPieChartCoreRadius: 10,
            // Ширина линий-разделителей секторов и внешней обводки диаграммы.
            clusterIconPieChartStrokeWidth: 3,
            // Определяет наличие поля balloon.
            //hasBalloon: false,
            hasHint: false,
            //gridSize: 999999
        }),
        points = [
            [52.76408647, 87.86300161], [52.76461362, 87.86288359], [52.76736671, 87.87067314], [52.75888720, 87.84888825],
            [52.76276526, 87.83808069], [52.76358788, 87.84605100], [52.76454215, 87.88069933], [52.77287235, 87.89712498],
        ],
        geoObjects = [];

    for (var i = 0, len = points.length; i < len; i++) {
        geoObjects[i] = new ymaps.Placemark(points[i], { hintContent: 'Проект *****' }, {
            iconColor: getRandomColor()
        });
    }

    clusterer.add(geoObjects);
    //lsm.geoObjects.add(clusterer);
    console.log(clusterer.getBounds());
    /* автоматический зум на центр кластера
        lsm.setBounds(clusterer.getBounds(), {
            checkZoomRange: false
        });
    */
    function getRandomColor() {
        return placemarkColors[Math.floor(Math.random() * placemarkColors.length)];
    }



    /* ---------
    let myPlacemark = new ymaps.Placemark([52.76173973, 87.85590679], {
        balloonContentHeader: 'Школа №1',
        balloonContentBody: '<div class="icon"><img src="https://sun9-58.userapi.com/c845420/v845420937/3900b/Z44u3uvkI7I.jpg?ava=1"/></div><p>Описание проекта</p>',
        balloonContentFooter: '<a href="javascript://">Подробнее</a>',
        hintContent: 'Проект *****'
    });
    
    lsm.geoObjects.add(myPlacemark);
    
    // Балун откроется в точке «привязки» балуна — т. е. над меткой.
    // myPlacemark.balloon.open();*/

}
