/**
 * Created by Yannick on 2016/4/16.
 */
angular.module("MobilePriceCompare.TWOUDIA", ["ngAnimate", "ui.bootstrap", "smart-table", "angular.filter"])
    .run(["$rootScope", "$log", "$filter", function ($rootScope, $log, $filter) {
        $rootScope.GridData = "";

        $rootScope.drawMAPD3 = function (width, height, jsonpath, datReference, vis, tip, popover) {
            d3.json(jsonpath, function (error, data) {
                var twArea = topojson.feature(data, data.objects["Areas"]);

                // Get Price (converted with exchange rate per country, and also build up the range
                var pricerangeMIN = 0.1, pricerangeMAX = 0.1;
                for (idx = twArea.features.length - 1; idx >= 0; idx--) {
                    var countryData = $filter('filter')(datReference, {country_iso: twArea.features[idx].properties.iso_a3}, true);
                    if (countryData.length == 0) {
                        twArea.features[idx].properties.baseprice_date = 0;
                    } else {
                        twArea.features[idx].properties.baseprice_date = Math.round(countryData[0].baseprice_date);
                        twArea.features[idx].properties.price = countryData[0].price;
                        twArea.features[idx].properties.currency = countryData[0].currency;
                        twArea.features[idx].properties.basecurrency = countryData[0].basecurrency;
                        if (countryData[0].baseprice_date < pricerangeMIN) pricerangeMIN = countryData[0].baseprice_date;
                        if (countryData[0].baseprice_date > pricerangeMAX) pricerangeMAX = countryData[0].baseprice_date;
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

                // Draw Map with Converted Price
                vis.selectAll("path").data(twArea.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("id", function (d) {
                        return d.properties.sovereignt;
                    })
                    .style("stroke-width", "1")
                    .style("stroke", "white")
                    .on("click", function (d) {
                        if (d.properties.baseprice_date > 0) {
                            popover.html(d.properties.name + '<br /><br />Original: ' + d.properties.currency + ' ' + d.properties.price + '<br />Converted: ' + d.properties.basecurrency + ' ' + d.properties.baseprice_date)
                                .style("left", parseInt(vis.node().getBoundingClientRect().left + window.pageXOffset +  width /2 - 100)  + "px")
                                .style("top", parseInt(vis.node().getBoundingClientRect().top + window.pageYOffset + height /2 - 30)  + "px");
                            popover.transition()
                                .duration(500)
                                .style("opacity", .9)
                                .transition()
                                .duration(500)
                                .style("opacity", 0)
                                .delay(4000);
                        }
                    })
                    .on("mouseover", function (d) {
                        if (d.properties.baseprice_date > 0) {
                            tip.html(d.properties.name)
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                            tip.transition()
                                .duration(200)
                                .style("opacity", .9);
                        }
                    })
                    .on("mouseout", function (d) {
                        if (d.properties.baseprice_date > 0) {
                            tip.transition()
                                .duration(200)
                                .style("opacity", 0);
                        }
                    });

                // Set Colours for countries with available price, from Yellow (cheap) to Chocolate (expensive)
                var viscolour = d3.scale.linear().domain([pricerangeMIN, pricerangeMAX]).range(["#FFFFCC", "#E8A317"]);
                vis.selectAll("path").data(twArea.features).attr({
                    d: path,
                    fill: function (d) {

                        if (d.properties.baseprice_date == 0) {
                            return "#708090";
                        } else {
                            return viscolour(d.properties.baseprice_date);
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

            // Set default initial value for Product Brand
            $scope.form.selProductBrand = $scope.optProductModelRAW[0].brand;
            $scope.selProductBrandChanged();
        });

        // Get Currency Settings as Option List
        $http.get('recordFetch.php?table=v_currency').success(function (data) {
            $scope.optCurrency = data;
        });

        // Define the actions while user define conditions
        // for Product - Brand
        $scope.selProductBrandChanged = function () {
            $scope.optProductModel = $filter('filter')($scope.optProductModelRAW, {brand: $scope.form.selProductBrand}, true);

            // Set default initial value for Product Model
            $scope.form.selProductModel = $scope.optProductModel[0].model;
            $scope.selProductModelChanged();
        }
        // for Product - Model
        $scope.selProductModelChanged = function () {
            $scope.optProductSPEC = $filter('filter')($scope.optProductSPECRAW, {
                brand: $scope.form.selProductBrand,
                model: $scope.form.selProductModel
            }, true);

            // Set default initial value for Product SPEC
            $scope.form.selProductSPEC = $scope.optProductSPEC[0].spec;
        };
        // for Product - SPEC
        $scope.selProductSPECChanged = function () {
        };
        // for Exchange Rate Date
        $scope.form.inpEXDate = new Date(new Date().setDate(new Date().getDate() - 1));
        $scope.inpEXDatePopup = {
            opened: false
        };
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
        // Query available only all conditions are set
        $scope.$watchCollection('form', function () {
            $scope.GridData = "";
            var blnCompleted = true;
            if (!$scope.form.selProductBrand) blnCompleted = false;
            if (!$scope.form.selProductModel) blnCompleted = false;
            if (!$scope.form.selProductSPEC) blnCompleted = false;
            if (!$scope.form.selProductBrand) blnCompleted = false;
            if (!$scope.form.inpEXDate) blnCompleted = false;
            $scope.condsCompleted = blnCompleted;
        });

        // Get Price according to user defined conditions
        $scope.priceEnquiry = function () {
            if (!$scope.condsCompleted) return;
            $scope.GridData = "";
            $http.get('recordFetch.php?table=v_pricesummary&cond=y&brand=' + encodeURIComponent($scope.form.selProductBrand) + '&model=' + encodeURIComponent($scope.form.selProductModel) + '&spec=' + encodeURIComponent($scope.form.selProductSPEC) + '&basecurrency=' + encodeURIComponent($scope.form.selCurrency) + '&ratedate=' + encodeURIComponent($filter('date')($scope.form.inpEXDate, 'yyyy-MM-dd'))).success(function (data) {
                $scope.GridData = data;
            });
        };

        // Copyright Years Presented in Footer
        $scope.copyrightsyear = (new Date().getFullYear() > 2016) ? '2016 - ' + (new Date().getFullYear()) : '2016';
    }])

    .controller("GlobeCtrl", ["$scope", "$log", "$window", function ($scope, $log, $window) {
        var width = parseInt(d3.select('#globemap').style('width'), 10), height = 0.5 * width;
        var vis = d3.select("#globemap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#globemap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#globemap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#globemap').style('width'), 10);
            height = 0.5 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/worldmap-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection("GridData", function () {
            $scope.twGrid = $scope.GridData;
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("AsiaCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#asiamap').style('width'), 10) * 0.9, height = 0.7 * width;
        var vis = d3.select("#asiamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#asiamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#asiamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#asiamap').style('width'), 10) * 0.9;
            height = 0.7 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/asia-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'Asia'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("EuropeCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#europemap').style('width'), 10) * 0.9, height = 0.3 * width;
        var vis = d3.select("#europemap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#europemap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#europemap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#europemap').style('width'), 10) * 0.9;
            height = 0.3 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/europe-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'Europe'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("AfricaCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#africamap').style('width'), 10) * 0.6, height = 1 * width;
        var vis = d3.select("#africamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#africamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#africamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#africamap').style('width'), 10) * 0.6;
            height = 1 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/africa-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'Africa'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("OceaniaCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#oceaniamap').style('width'), 10) * 0.7, height = 0.8 * width;
        var vis = d3.select("#oceaniamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#oceaniamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#oceaniamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#oceaniamap').style('width'), 10) * 0.7;
            height = 0.8 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/oceania-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'Oceania'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("NorthAmericaCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#northamericamap').style('width'), 10) * 0.9, height = 0.6 * width;
        var vis = d3.select("#northamericamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#northamericamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#northamericamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#northamericamap').style('width'), 10) * 0.9;
            height = 0.6 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/northamerica-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'North America'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .controller("SouthAmericaCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var width = parseInt(d3.select('#southamericamap').style('width'), 10) * 0.5, height = 1.5 * width;
        var vis = d3.select("#southamericamap").append("svg").attr("width", width).attr("height", height);
        var tip = d3.select("#southamericamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#southamericamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            width = parseInt(d3.select('#southamericamap').style('width'), 10) * 0.5;
            height = 1.5 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/southamerica-2016.topo.json", $scope.twGrid, vis, tip, popover);
        };

        // Setup the DataGrid
        $scope.$watchCollection('GridData', function () {
            $scope.twGrid = $filter('filter')($scope.GridData, {continent: 'South America'}, true);
            D3reDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3reDraw();
        });

        angular.element($window).bind('resize', function(){
            D3reDraw();
        });
    }])

    .directive('stRatio',function(){
        return {
            link:function(scope, element, attr){
                var ratio=+(attr.stRatio);
                element.css('width',ratio+'%');
            }
        };
    })
;