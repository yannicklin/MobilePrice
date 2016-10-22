/**
 * Created by Yannick on 2016/4/16.
 */
angular.module("MobilePriceCompare.TWOUDIA", ["ngAnimate", "ui.bootstrap", "smart-table", "angular.filter", "angular-loading-bar"])
    .run(["$rootScope", "$log", "$filter", function ($rootScope, $log, $filter) {
        $rootScope.GridData = "";

        $rootScope.drawMAPD3 = function (width, height, jsonpath, datReference, vis, tip, popover) {

            vis.selectAll("*").remove();

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

                // Calculate and resize the path to fit the screen
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
                        tip.html(d.properties.name)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        tip.transition()
                            .duration(200)
                            .style("opacity", .9);
                    })
                    .on("mouseout", function (d) {
                        tip.transition()
                            .duration(200)
                            .style("opacity", 0);
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

    .controller("TWCtrl", ["$scope", "$log", function ($scope, $log) {
        // Copyright Years Presented in Footer
        $scope.copyrightsyear = (new Date().getFullYear() > 2016) ? '2016 - ' + (new Date().getFullYear()) : '2016';
    }])

    .controller("MainCtrl", ["$scope", "$log", "$filter", "$http", function ($scope, $log, $filter, $http) {
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
        $http.get('recordFetch.php?table=v_currency_country').success(function (data) {
            $scope.optCurrency = data;
        });

        // Define the actions while user define conditions
        // for Product - Brand
        $scope.selProductBrandChanged = function () {
            $scope.optProductModel = $filter('filter')($scope.optProductModelRAW, {brand: $scope.form.selProductBrand}, true);

            // Set default initial value for Product Model
            $scope.form.selProductModel = $scope.optProductModel[0].model;
            $scope.selProductModelChanged();
        };
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
        // $scope.selProductSPECChanged = function () {
        // };
        // for Exchange Rate Date
        $scope.form.inpEXDate = new Date(new Date().setDate(new Date().getDate() - 1));
        $scope.inpEXDatePopup = {
            opened: false
        };
        $scope.inpEXDateOpt = {
            format: 'yyyy-MM-dd',
            maxDate: new Date(new Date().setDate(new Date().getDate() - 1)),
            minDate: new Date(new Date().setDate(new Date().getDate() - 90)),
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
            if (!$scope.form.selCurrency) blnCompleted = false;
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
    }])

    .controller("GlobeCtrl", ["$scope", "$log", "$window", function ($scope, $log, $window) {
        var vis = d3.select("#globemap").append("svg");
        var tip = d3.select("#globemap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#globemap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#globemap').style('width'), 10);
            var height = 0.5 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/worldmap-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#asiamap").append("svg");
        var tip = d3.select("#asiamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#asiamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#asiamap').style('width'), 10) * 0.9;
            var height = 0.7 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/asia-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#europemap").append("svg");
        var tip = d3.select("#europemap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#europemap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#europemap').style('width'), 10) * 0.9;
            var height = 0.3 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/europe-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#africamap").append("svg");
        var tip = d3.select("#africamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#africamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#africamap').style('width'), 10) * 0.6;
            var height = 1 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/africa-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#oceaniamap").append("svg");
        var tip = d3.select("#oceaniamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#oceaniamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#oceaniamap').style('width'), 10) * 0.7;
            var height = 0.8 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/oceania-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#northamericamap").append("svg");
        var tip = d3.select("#northamericamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#northamericamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#northamericamap').style('width'), 10) * 0.9;
            var height = 0.6 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/northamerica-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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
        var vis = d3.select("#southamericamap").append("svg");
        var tip = d3.select("#southamericamap").append("div").attr("class", "tooltip").style("opacity", 0);
        var popover = d3.select("#southamericamap").append("div").attr("class", "popover").style("opacity", 0);

        function D3reDraw() {
            var width = parseInt(d3.select('#southamericamap').style('width'), 10) * 0.5;
            var height = 1.5 * width;
            vis.attr("width", width).attr("height", height);
            $scope.drawMAPD3(width, height, "geo/southamerica-2016.topo.json", $scope.twGrid, vis, tip, popover);
        }
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

    .controller("HistoryCtrl", ["$scope", "$log", "$filter", "$http", function ($scope, $log, $filter, $http) {
        $scope.form = {};

        $scope.historyEnquiry = function () {
            if (!$scope.form.selProductBrand) return;
            $scope.GridData = "";
            $http.get('recordFetch.php?table=v_history_price&cond=y&brand=' + encodeURIComponent($scope.form.selProductBrand)).success(function (data) {
                $scope.GridData = data;
            });
        };

        // Get Product Settings - Brand
        $http.get('recordFetch.php?table=v_product').success(function (data) {
            $scope.optProductBrand = $filter('unique')(data, 'brand');
            // Set default initial value for Product Brand
            $scope.form.selProductBrand = $scope.optProductBrand[0].brand;
            //Do once while page initialing
            $scope.historyEnquiry();
        });
    }])

    .controller("TrendCtrl", ["$scope", "$log", "$filter", "$http", function ($scope, $log, $filter, $http) {
        $scope.form = {};

        // Get Product Settings - Brand, Model, SPEC as Option List
        $http.get('recordFetch.php?table=v_product').success(function (data) {
            $scope.optProductBrand = $filter('unique')(data, 'brand');
            $scope.optProductModelRAW = $filter('unique')(data, 'con_B_M');
            $scope.optProductSPECRAW = data;

            // Set default initial value for Product Brand
            $scope.form.selProductBrand = $scope.optProductModelRAW[0].brand;
            $scope.selProductBrandChanged();
        });

        // Define the actions while user define conditions
        // for Product - Brand
        $scope.selProductBrandChanged = function () {
            $scope.optProductModel = $filter('filter')($scope.optProductModelRAW, {brand: $scope.form.selProductBrand}, true);

            // Set default initial value for Product Model
            $scope.form.selProductModel = $scope.optProductModel[0].model;
            $scope.selProductModelChanged();
        };
        // for Product - Model
        $scope.selProductModelChanged = function () {
            $scope.optProductSPEC = $filter('filter')($scope.optProductSPECRAW, {
                brand: $scope.form.selProductBrand,
                model: $scope.form.selProductModel
            }, true);

            // Set default initial value for Product SPEC
            $scope.form.selProductSPEC = $scope.optProductSPEC[0].spec;
            $scope.selProductSPECChanged();
        };
        // for Product - SPEC
        $scope.selProductSPECChanged = function () {
            $scope.optCountry = "";

            // Get Country Settings as Option List
            $http.get('recordFetch.php?table=v_product_availcountry&cond=y&brand=' + encodeURIComponent($scope.form.selProductBrand) + '&model=' + encodeURIComponent($scope.form.selProductModel) + '&spec=' + encodeURIComponent($scope.form.selProductSPEC)).success(function (data) {
                $scope.optCountry = data;

                // Set default initial value for Country
                $scope.form.selCountry = $scope.optCountry[0].country_iso;
            });
        };
        // for Country
        //$scope.selCountryChanged = function () {
        //};

        $scope.optCurrency = "";
        // Get Currency Settings as Option List
        $http.get('recordFetch.php?table=v_currency_country').success(function (data) {
            $scope.optCurrency = data;

            // Set default initial value for Country
            $scope.form.selCurrency = $scope.optCurrency[0].currency;
        });
        // for Currency
        //$scope.selCurrencyChanged = function () {
        //};

        // Set DateRange Option List
        $scope.optDateRange = [
            { value: '30', label: '30 Days' },
            { value: '60', label: '60 Days' },
            { value: '90', label: '90 Days' },
            { value: '120', label: '120 Days' },
        ];
        $scope.form.selDateRange = $scope.optDateRange[0].value;

        // Query available only all conditions are set
        $scope.$watchCollection('form', function () {
            $scope.ChartData = "";
            $scope.ChartDataDateRange = 0;
            var blnCompleted = true;
            if (!$scope.form.selProductBrand) blnCompleted = false;
            if (!$scope.form.selProductModel) blnCompleted = false;
            if (!$scope.form.selProductSPEC) blnCompleted = false;
            if (!$scope.form.selCountry) blnCompleted = false;
            if (!$scope.form.selCurrency) blnCompleted = false;
            if (!$scope.form.selDateRange) blnCompleted = false;
            $scope.condsCompleted = blnCompleted;
        });

        // Get Chart Data according to user defined conditions
        $scope.trendEnquiry = function () {
            if (!$scope.condsCompleted) return;
            $scope.ChartData = "";

            var queryFromDate = new Date(new Date().setDate(new Date().getDate() - 1 - $scope.form.selDateRange));
            var queryEndDate = new Date(new Date().setDate(new Date().getDate() - 1));

            $http.get('recordFetch.php?table=v_pricesummary&cond=y&country_iso=' + encodeURIComponent($scope.form.selCountry) + '&brand=' + encodeURIComponent($scope.form.selProductBrand) + '&model=' + encodeURIComponent($scope.form.selProductModel) + '&spec=' + encodeURIComponent($scope.form.selProductSPEC) + '&basecurrency=' + encodeURIComponent($scope.form.selCurrency) + '&ratedate>=' + encodeURIComponent($filter('date')(queryFromDate, 'yyyy-MM-dd')) + '&ratedate<=' + encodeURIComponent($filter('date')(queryEndDate, 'yyyy-MM-dd'))).success(function (data) {
                $scope.ChartData = data;
                $scope.ChartDataDateRange = $scope.form.selDateRange;
            });
        };
    }])

    .controller("ChartCtrl", ["$scope", "$log", "$filter", "$window", function ($scope, $log, $filter, $window) {
        var vis = d3.select("#chart").append("svg");
        var tip = d3.select("#chart").append("div").attr("class", "tooltip").style("opacity", 0);
        var Dataset;

        function D3ChartDraw() {
            vis.selectAll("*").remove();

            var width = parseInt(d3.select('#chart').style('width'), 10) * 0.9, height = 0.5 * width;
            var margin = {top: 10, right: 10, bottom: 50, left: 50};
            var drawW = width - (margin.left + margin.right), drawH = height - (margin.top + margin.bottom);
            var chartSVG = vis.attr("width", width).attr("height", height).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var minPriceRange = d3.min(Dataset, function(d) { return d.baseprice_date; }) * 0.95, maxPriceRange = d3.max(Dataset, function(d) { return d.baseprice_date; }) * 1.05;

            var x = d3.time.scale().domain(d3.extent(Dataset, function (d) {
                return d.ratedate;
            })).range([0, drawW]);
            var y = d3.scale.linear().domain([ minPriceRange , maxPriceRange ]).range([drawH, 0]);
            var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(10).tickFormat(d3.time.format("%d %b"));
            var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5)
                .tickFormat(function(d){
                    if (100000 < d < 0.00001) {
                        return "$ " + d;
                    }else {
                        return "$ " + d.toExponential();
                    }
                });
            var xGrid = d3.svg.axis().scale(x).orient('bottom').ticks(10).tickSize(-drawH, 0, 0).tickFormat("");
            var yGrid = d3.svg.axis().scale(y).orient('left').ticks(5).tickSize(-drawW, 0, 0).tickFormat("");

            chartSVG.append('g').attr({
                    class: "x axis",
                    transform: 'translate(0,' + drawH + ')'
                }).call(xAxis)
                .append("text")
                    .attr("class", "axis-label")
                    .attr("x", drawW)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text("Date");
            chartSVG.append('g').attr({
                    class: "y axis"
                }).call(yAxis)
                .append("text")
                    .attr("class", "axis-label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Converted");
            chartSVG.append('g').attr({
                    class: "grid",
                    transform: 'translate(0,' + drawH + ')'
                }).call(xGrid)
                .on("mouseover", function (d) {
                    tip.html( 'Date: ' + d )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                    tip.transition()
                        .duration(200)
                        .style("opacity", .9);
                })
                .on("mouseout", function () {
                    tip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
            chartSVG.append('g').attr({
                    class: "y-grid"
                }).call(yGrid);

            chartSVG.selectAll('g.x.axis').selectAll("text:not(.axis-label)")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-60)");

            chartSVG.selectAll('g.y.axis').selectAll("text:not(.axis-label)")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-45)");

            // Draw the line of price
            function DrawLine(data, lineClass, pointClass, valueColumn, radiusDotCircle, nameTip4valueColumn) {
                var line = d3.svg.line().interpolate("cardinal")
                    .x(function (d) {
                        return x(d.ratedate);
                    })
                    .y(function (d) {
                        return y(d[valueColumn]);
                    });

                chartSVG.append('path').datum(Dataset)
                    .attr({
                        class: lineClass,
                        d: line
                    });

                chartSVG.selectAll(".dot")
                    .data(data)
                    .enter().append("circle")
                    .attr("class", pointClass)
                    .attr("cy", function (d) { return y(d[valueColumn]); } ) //set y
                    .attr("cx", function (d) { return x(d.ratedate); } ) //set x
                    .attr("r", radiusDotCircle)
                    .on("mouseover", function (d) {
                        tip.html( 'Date: ' + d.tip_date + '<br />' + nameTip4valueColumn + ': ' + d[valueColumn] )
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 20) + "px");
                        tip.transition()
                            .duration(200)
                            .style("opacity", .9);
                    })
                    .on("mouseout", function () {
                        tip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
            }

            DrawLine(Dataset, 'dashline line-bt-red', 'dot-bt-red', 'baseprice_30days', 2.5, 'Running Average');
            DrawLine(Dataset, 'solidline line-bt-darkblue', 'dot-bt-darkblue', 'baseprice_date', 4, 'Price');

            // Prepare Legend
            var colorClass = d3.scale.ordinal()
                .range(['rect-bt-darkblue','rect-bt-red']);

            var legend = chartSVG.selectAll(".legend")
                .data(["Price", "30 Days Running Average"])
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            // draw legend colored rectangles
            legend.append("rect")
                .attr("x", drawW - 18)
                .attr("class", colorClass);

            // draw legend text
            legend.append("text")
                .attr("x", drawW - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d;})
        }
        // Setup the DataGrid
        $scope.$watchCollection('ChartData', function () {

            if (!$scope.ChartDataDateRange) return;
            Dataset = [];

            // Build up the result array
            // 1. Reformat and modify the floating price(s) & date(s)
            // 2. For those countries whose products are discountinued
            for (idx = 0; idx < $scope.ChartDataDateRange ; idx++ ) {
                var objDateResult = {};
                var DateFilter = new Date(new Date().setDate(new Date().getDate() - 1 - idx));
                DateFilter = $filter('date')(DateFilter, 'yyyy-MM-dd');
                var existData = $filter('filter')($scope.ChartData, {ratedate: DateFilter}, true);

                if (existData.length) {
                    objDateResult.ratedate = d3.time.format("%Y-%m-%d").parse(existData[0].ratedate);
                    objDateResult.tip_date = existData[0].ratedate;
                    objDateResult.baseprice_date = +(Math.round(existData[0].baseprice_date + "e+2")  + "e-2");
                    objDateResult.baseprice_30days = +(Math.round(existData[0].baseprice_30days + "e+2")  + "e-2");
                } else {
                    objDateResult.ratedate = d3.time.format("%Y-%m-%d").parse(DateFilter);
                    objDateResult.tip_date = DateFilter;
                    objDateResult.baseprice_date = 0;
                    objDateResult.baseprice_30days = 0;
                }
                Dataset.push(objDateResult);
            }

            D3ChartDraw();
        });

        angular.element($window).bind('orientationchange', function () {
            D3ChartDraw();
        });

        angular.element($window).bind('resize', function(){
            D3ChartDraw();
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