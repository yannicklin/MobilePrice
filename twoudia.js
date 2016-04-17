/**
 * Created by Yannick on 2016/4/16.
 */
angular.module("MobilePriceCompare.TWOUDIA", ["ngAnimate", "ui.bootstrap", "ui.grid", "ui.grid.pagination", "angular.filter"])
    .run([function () {
    }])
    .config([function () {
    }])
    .controller("TWCtrl", ["$rootScope", "$scope", "$log", "$filter", "$http", function ($rootScope, $scope, $log, $filter, $http) {
        $scope.form = {};

        // Tabs
        $scope.tabs = [
            {title: 'Globe', template: 'views/globe.html'},
            {title: 'Asia', template: 'views/asia.html'},
            {title: 'Europe', template: 'views/europe.html'},
            {title: 'Africa', template: 'views/africa.html'},
            {title: 'Oceania', template: 'views/oceania.html'},
            {title: 'North America', template: 'views/northamerica.html'},
            {title: 'South America', template: 'views/southamerica.html'}
        ];
        // Get Overall Data for Grids
        $http.get('sample.json').success(function (data) {
            $rootScope.GridData = data;
            $scope.optContinent = $filter('unique')(data, 'CONTIENT');
            $scope.optSubRegionRAW = $filter('unique')(data, 'SUBREGION');
        });


        // Search Form
        // Date Picker
        $scope.inputDateOpt = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(2016, 1, 11),
            startingDay: 1
        };
        $scope.inputDatePopup = {
            opened: false
        };
        $scope.inputDateClick = function () {
            $scope.inputDatePopup.opened = true;
        };

        $scope.selContinentChanged = function () {
            $scope.optSubRegion = $filter('filterBy')($scope.optSubRegionRAW, {CONTIENT: $scope.form.selContinent});
        };

    }])

    .controller("GlobeCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        //var width = 800, height = 600;
        //var width = window.screen.width * 0.8 * window.devicePixelRatio, height = 0.4 * width;
        var width = parseInt(d3.select('#globemap').style('width'), 10), height = 0.4 * width;
        var vis = d3.select("#globemap").append("svg").attr("width", width).attr("height", height);

        // Define the div for the tooltip
        var div = d3.select("#globemap").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.json("worldmap-area-2016.topo.json", function (error, data) {

            var twArea = topojson.feature(data, data.objects["GlobalAreas"]);
            // Set the post count per Area
            for (idx = twArea.features.length - 1; idx >= 0; idx--) {
                twArea.features[idx].properties.postCount = idx;
            }

            // Create a unit projection and the path generator
            var projection = d3.geo.robinson()
                .scale(1)
                .translate([0, 0]);
            var path = d3.geo.path()
                .projection(projection);

            // Calcualte and resize the path to fit the screen
            var b = path.bounds(twArea),
                s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
            projection
                .scale(s)
                .translate(t);

            // Draw Map with Post Counts
            vis.selectAll("path").data(twArea.features)
                .enter().append("path")
                .attr("d", path)
                .attr("id", function (d) {
                    return d.properties.sovereignt;
                })
                //.style("fill", "darkgrey")
                .style("stroke-width", "1")
                .style("stroke", "white")
                .on("click", function (d) {
                    alert('name: ' + d.properties.name + ' \n continent: ' + d.properties.continent + ' \n ISO: ' + d.properties.iso_a3);
                })
                .on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.properties.name + '<br />' + '$$' + d.properties.postCount)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            var viscolour = d3.scale.linear().domain([0, 500]).range(["#090", "#f00"]);
            vis.selectAll("path").data(twArea.features).attr({
                d: path,
                fill: function (d) {
                    return viscolour(d.properties.postCount);
                }
            });

        });

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'ID'},
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'},
                {name: 'REGION'},
                {name: 'SUBREGION'}
            ]
        };
        $scope.twGrid.data = $rootScope.GridData;
    }])

    .controller("AsiaCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        //var width = 800, height = 600;
        var width = window.screen.width * 0.4 * window.devicePixelRatio, height = 0.4 * width;
        var vis = d3.select("#asiamap").append("svg").attr("width", width).attr("height", height);

        // Define the div for the tooltip
        var div = d3.select("#asiamap").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.json("worldmap-area-2016.topo.json", function (error, data) {

            var twArea = topojson.feature(data, data.objects["GlobalAreas"]);
            // Set the post count per Area
            for (idx = twArea.features.length - 1; idx >= 0; idx--) {
                twArea.features[idx].properties.postCount = idx;
            }

            // Create a unit projection and the path generator
            var projection = d3.geo.robinson()
                .scale(1)
                .translate([0, 0]);
            var path = d3.geo.path()
                .projection(projection);

            // Calcualte and resize the path to fit the screen
            var b = path.bounds(twArea),
                s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
            projection
                .scale(s)
                .translate(t);

            // Draw Map with Post Counts
            vis.selectAll("path").data(twArea.features)
                .enter().append("path")
                .attr("d", path)
                .attr("id", function (d) {
                    return d.properties.sovereignt;
                })
                //.style("fill", "darkgrey")
                .style("stroke-width", "1")
                .style("stroke", "white")
                .on("click", function (d) {
                    alert('name: ' + d.properties.name + ' \n continent: ' + d.properties.continent + ' \n ISO: ' + d.properties.iso_a3);
                })
                .on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html('name: ' + d.properties.name + '<br />' + '$$' + d.properties.postCount)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            var viscolour = d3.scale.linear().domain([0, 500]).range(["#090", "#f00"]);
            vis.selectAll("path").data(twArea.features).attr({
                d: path,
                fill: function (d) {
                    return viscolour(d.properties.postCount);
                }
            });

        });

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'Asia'});
    }])


    .controller("EuropeCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'Europe'});
    }])


    .controller("AfricaCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'Africa'});
    }])


    .controller("OceaniaCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'Oceania'});
    }])

    .controller("NorthAmericaCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'North America'});
    }])

    .controller("SouthAmericaCtrl", ["$rootScope", "$scope", "$log", "$filter", function ($rootScope, $scope, $log, $filter) {

        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [
                {name: 'NAME'},
                {name: 'ISO_3'},
                {name: 'CONTIENT'}
            ]
        };
        $scope.twGrid.data = $filter('filter')($rootScope.GridData, {CONTIENT: 'South America'});
    }])

;