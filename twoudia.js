/**
 * Created by Yannick on 2016/4/16.
 */
angular.module("MobilePriceCompare.TWOUDIA", ["ngAnimate", "ui.bootstrap", "ui.grid", "ui.grid.pagination", "ui.grid.autoResize", "angular.filter"])
    .run(["$rootScope", "$log", "$filter", function ($rootScope, $log, $filter) {
        $rootScope.GridData = "";

        $rootScope.drawMAPD3 = function (width, height, jsonpath, datReference, vis, tip) {
            d3.json(jsonpath, function (error, data) {

                var twArea = topojson.feature(data, data.objects["Areas"]);

                // Get Price (converted with exchange rate per country, and also build up the range
                var pricerangeMIN = 0.1, pricerangeMAX = 0.1;
                for (idx = twArea.features.length - 1; idx >= 0; idx--) {
                    var countryData = $filter('filter')(datReference, {country_iso: twArea.features[idx].properties.iso_a3}, true);
                    if (countryData.length == 0) {
                        twArea.features[idx].properties.convertprice = 0;
                    } else {
                        twArea.features[idx].properties.convertprice = Math.round(countryData[0].convertprice);
                        if (countryData[0].convertprice < pricerangeMIN) pricerangeMIN = countryData[0].convertprice;
                        if (countryData[0].convertprice > pricerangeMAX) pricerangeMAX = countryData[0].convertprice;
                    }
                }

                // Create a unit projection and the path generator
                var projection = d3.geo.robinson().scale(1).translate([0, 0]);
                var path = d3.geo.path().projection(projection);

                // Calcualte and resize the path to fit the screen
                var b = path.bounds(twArea),
                    s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
                projection.scale(s).translate(t);

                // Draw Map with Post Counts
                vis.selectAll("path").data(twArea.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("id", function (d) {
                        return d.properties.sovereignt;
                    })
                    .style("stroke-width", "1")
                    .style("stroke", "white")
                    .on("click", function (d) {
                        alert('name: ' + d.properties.name + ' \n continent: ' + d.properties.continent + ' \n ISO: ' + d.properties.iso_a3);
                    })
                    .on("mouseover", function (d) {
                        tip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tip.html(d.properties.name + '<br />' + ' $$' + d.properties.convertprice)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function (d) {
                        tip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                var viscolour = d3.scale.linear().domain([pricerangeMIN, pricerangeMAX]).range(["#FFD700", "#B8860B"]);
                vis.selectAll("path").data(twArea.features).attr({
                    d: path,
                    fill: function (d) {

                        if (d.properties.convertprice == 0) {
                            return "#708090";
                        } else {
                            return viscolour(d.properties.convertprice);
                        }
                    }
                });
            });
        };
    }])
    .config([function () {
    }])
    .controller("TWCtrl", ["$scope", "$log", "$filter", "$http", function ($scope, $log, $filter, $http) {
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

        // Get Product Settings - Brand, Model, SPEC as Option List
        $http.get('recordFetch.php?table=v_product').success(function (data) {
            $scope.optProductBrand = $filter('unique')(data, 'brand');
            $scope.optProductModelRAW = $filter('unique')(data, 'con_B_M');
            $scope.optProductSPECRAW = data;
        });

        // Get Currency Settings as Option List
        $http.get('recordFetch.php?table=v_currency').success(function (data) {
            $scope.optCurrency = data;
        });

        // Define the actions while user define conditions
        // for Product - Brand
        $scope.selProductBrandChanged = function () {
            $scope.optProductModel = $filter('filter')($scope.optProductModelRAW, {brand: $scope.form.selProductBrand}, true);
            $scope.GridData = "";
        }
        // for Product - Model
        $scope.selProductModelChanged = function () {
            $scope.optProductSPEC = $filter('filter')($scope.optProductSPECRAW, {
                brand: $scope.form.selProductBrand,
                model: $scope.form.selProductModel
            }, true);
            $scope.GridData = "";
        };
        // for Product - SPEC
        $scope.selProductSPECChanged = function () {
            $scope.GridData = "";
        };
        // for Exchange Rate Date
        $scope.form.inpEXDate = new Date();
        $scope.inpEXDatePopup.opened = false;
        $scope.inpEXDateOpt = {
            format: 'yyyy-MM-dd',
            maxDate: new Date(),
            minDate: new Date(new Date().setDate(new Date().getDate() - 180)),
            startingDay: 0,
            showWeeks: false
        };
        $scope.inpEXDateClick = function () {
            $scope.inpEXDatePopup.opened = true;
        };
        // for Currency
        $scope.form.selCurrency = 'USD';
        $scope.selCurrencyChanged = function () {
            if ($scope.GridData) $scope.priceEnquiry();
        };

        // Get Price according to user defined conditions
        $scope.priceEnquiry = function () {
            $scope.GridData = "";
            $http.get('recordFetch.php?table=v_price&cond=y&brand=' + $scope.form.selProductBrand + '&model=' + $scope.form.selProductModel + '&spec=' + $scope.form.selProductSPEC + '&convertcurrency=' + $scope.form.selCurrency + '&ratedate=' + $filter('date')($scope.form.inpEXDate, 'yyyy-MM-dd')).success(function (data) {
                $scope.GridData = data;
            });
        };
    }])

    .controller("GlobeCtrl", ["$scope", "$log", function ($scope, $log) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.8 * window.devicePixelRatio, height = 0.4 * width;
        var width = parseInt(d3.select('#globemap').style('width'), 10), height = 0.5 * width;
        var vis = d3.select("#globemap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#globemap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationPageSizes: [10, 25],
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'continent', displayName: 'Continent'},
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $scope.GridData;
            $scope.drawMAPD3(width, height, "geo/worldmap-2016.topo.json", $scope.twGrid.data, vis, tip);
        });

    }])

    .controller("AsiaCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 0.7 * width;
        var width = parseInt(d3.select('#asiamap').style('width'), 10)* 0.9, height = 0.7 * width;
        var vis = d3.select("#asiamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#asiamap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'Asia'}, true);
            $scope.drawMAPD3(width, height, "geo/asia-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .controller("EuropeCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 0.3 * width;
        var width = parseInt(d3.select('#europemap').style('width'), 10)* 0.9, height = 0.3 * width;
        var vis = d3.select("#europemap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#europemap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'Europe'}, true);
            $scope.drawMAPD3(width, height, "geo/europe-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .controller("AfricaCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 1 * width;
        var width = parseInt(d3.select('#africamap').style('width'), 10)* 0.6, height = 1 * width;
        var vis = d3.select("#africamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#africamap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'Africa'}, true);
            $scope.drawMAPD3(width, height, "geo/africa-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .controller("OceaniaCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 0.8 * width;
        var width = parseInt(d3.select('#oceaniamap').style('width'), 10) * 0.7, height = 0.8 * width;
        var vis = d3.select("#oceaniamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#oceaniamap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: false,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'Oceania'}, true);
            $scope.drawMAPD3(width, height, "geo/oceania-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .controller("NorthAmericaCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 0.6 * width;
        var width = parseInt(d3.select('#northamericamap').style('width'), 10)* 0.9, height = 0.6 * width;
        var vis = d3.select("#northamericamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#northamericamap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'North America'}, true);
            $scope.drawMAPD3(width, height, "geo/northamerica-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .controller("SouthAmericaCtrl", ["$scope", "$log", "$filter", function ($scope, $log, $filter) {
        //var width = 800, height = 600;
        //var width = window.screen.width * 0.3 * window.devicePixelRatio, height = 1.5 * width;
        var width = parseInt(d3.select('#southamericamap').style('width'), 10)* 0.5, height = 1.5 * width;
        var vis = d3.select("#southamericamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#southamericamap").append("div").attr("class", "tooltip").style("opacity", 0);

        // Setup the DataGrid
        $scope.twGrid = {
            enablePaginationControls: true,
            paginationTemplate: 'views/ui-grid-pagination-no-pagesoption.html',
            paginationPageSize: 10,
            enableColumnMenus: false,
            columnDefs: [
                {name: 'country', displayName: 'Country', cellTooltip: true, width: '30%'},
                {name: 'currency', displayName: 'Currency'},
                {name: 'price', displayName: 'Origin', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'convertprice', displayName: 'Conversion', cellFilter: 'priceFilter', cellClass: 'right'},
                {name: 'memo', displayName: 'Memo', enableSorting: false},
                {name: 'recdate', displayName: 'Last Updated'}
            ]
        };

        $scope.$watchCollection('GridData', function () {
            $scope.twGrid.data = $filter('filter')($scope.GridData, {continent: 'South America'}, true);
            $scope.drawMAPD3(width, height, "geo/southamerica-2016.topo.json", $scope.twGrid.data, vis, tip);
        });
    }])

    .filter('priceFilter', function () {
        return function (value) {
            return '$'+ parseFloat(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        };
    })
;