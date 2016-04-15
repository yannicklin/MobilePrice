<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>Mobile Price Compare</title>
    <script src="lib/angular/angularjs.min.js" charset="utf8"></script>
    <script src="lib/angular-bootstrap/ui-bootstrap-csp.css" charset="utf8"></script>
    <script src="lib/d3/d3.min.js" charset="utf8"></script>
    <script src="lib/d3-geo-projection/d3.geo.projection.min.js" charset="utf8"></script>
    <script src="lib/topojson/topojson.js" charset="utf8"></script>
    <link href="css/custom.css" rel="stylesheet" />
</head>
<body>
<section class='container'>
          <hgroup>
            <h1>Welcome to your PHP application on OpenShift</h1>
          </hgroup>


        <div class="row">
          <section class='col-xs-12 col-sm-6 col-md-6'>
            <section>
              <h2>Deploying code changes</h2>
                <p>OpenShift uses the <a href="http://git-scm.com/">Git version control system</a> for your source code, and grants you access to it via the Secure Shell (SSH) protocol. In order to upload and download code to your application you need to give us your <a href="https://developers.openshift.com/en/managing-remote-connection.html">public SSH key</a>. You can upload it within the web console or install the <a href="https://developers.openshift.com/en/managing-client-tools.html">RHC command line tool</a> and run <code>rhc setup</code> to generate and upload your key automatically.</p>

                <h3>Working in your local Git repository</h3>
                <p>If you created your application from the command line and uploaded your SSH key, rhc will automatically download a copy of that source code repository (Git calls this 'cloning') to your local system.</p>

                <p>If you created the application from the web console, you'll need to manually clone the repository to your local system. Copy the application's source code Git URL and then run:</p>

<pre>$ git clone &lt;git_url&gt; &lt;directory_to_create&gt;

# Within your project directory
# Commit your changes and push to OpenShift

$ git commit -a -m 'Some commit message'
$ git push</pre>


                  <ul>
                    <li><a href="https://developers.openshift.com/en/managing-modifying-applications.html">Learn more about deploying and building your application</a></li>
                    <li>See the README file in your local application Git repository for more information on the options for deploying applications.</li>
                  </ul>
            </section>

          </section>
          <section class="col-xs-12 col-sm-6 col-md-6">

              <!-- 3d tags for circles -->
              <div id="map" style="display: block; margin:auto;"></div>


          </section>
        </div>


        <footer>
          <div class="logo"><a href="https://www.twoudia.com/" target="_blank"></a></div>
        </footer>
</section>

<script type="text/javascript">
    //var width = 800, height = 600;
    var width = window.screen.width * 0.8 * window.devicePixelRatio, height = 0.4 * width;
    var vis = d3.select("#map").append("svg").attr("width", width).attr("height", height);

    d3.json("worldmap-area-2016.topo.json", function (error, data) {

        var twArea = topojson.feature(data, data.objects["Areas"]);
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
            .on("click", ClickonArea);

        var viscolour = d3.scale.linear().domain([0,500]).range(["#090","#f00"]);
        vis.selectAll("path").data(twArea.features).attr({
            d: path,
            fill: function(d) {
                return viscolour(d.properties.postCount);
            }
        });

        vis.selectAll("label").data(twArea.features)
            .enter().append("text")
            .attr("transform", function (d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "2em")
            .attr("fill", "red")
            .text(function (d) {
                return d.properties.postCount;
            })
            .on("click", ClickonArea);

        function ClickonArea(data) {
            alert('NONE!');
        };
    });
</script>
</body>
</html>
