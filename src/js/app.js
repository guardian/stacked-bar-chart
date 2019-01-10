import * as d3 from "d3"

function init(results) {
	const container = d3.select("#graphicContainer")
	console.log(results)
	var data = results.sheets.data
	var details = results.sheets.details
	var labels = results.sheets.labels

	function numberFormat(num) {
        if ( num > 0 ) {
            if ( num > 1000000000 ) { return ( num / 1000000000 ) + 'bn' }
            if ( num > 1000000 ) { return ( num / 1000000 ) + 'm' }
            if ( num > 1000 ) { return ( num / 1000 ) + 'k' }
            if (num % 1 != 0) { return num.toFixed(2) }
            else { return num.toLocaleString() }
        }
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return [ "-" + String(( posNum / 1000000000 )) + 'bn'];
            if ( posNum > 1000000 ) return ["-" + String(( posNum / 1000000 )) + 'm'];
            if ( posNum > 1000 ) return ["-" + String(( posNum / 1000 )) + 'k'];
            else { return num.toLocaleString() }
        }
        return num;
    }

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
	var height = width*0.5;					
	var margin;

	if (details[0]['margin-top']) {
		margin = {top: +details[0]['margin-top'], right: +details[0]['margin-right'], bottom: +details[0]['margin-bottom'], left:+details[0]['margin-left']};
	}

	else {
		margin = {top: 0, right: 0, bottom: 20, left:40};	
	}	

	d3.select("#chartTitle").text(details[0].title)
    d3.select("#subTitle").text(details[0].subtitle)
    d3.select("#sourceText").html(details[0].source)
    d3.select("#footnote").html(details[0].footnote)
    d3.select("#graphicContainer svg").remove();
    var chartKey = d3.select("#chartKey");
	chartKey.html("");


	var svg = d3.select("#graphicContainer").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var keys = Object.keys(data[0])

	var xVar;

	if (details[0]['xColumn']) {
		xVar = details[0]['xColumn'];
		keys.splice(keys.indexOf(xVar), 1);
	}
	
	else {
		xVar = keys[0]
		keys.splice(0, 1);
	}
	
	console.log(xVar, keys);

	data.forEach(function(d) {
		if (typeof d[xVar] == 'string') {
			d[xVar] = +d[xVar];
		}
		keys.forEach(function(key,i) { 
			d[key] = +d[key]
		});	
	})

    var x = d3.scaleBand().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map(function(d) { return d[xVar]; }));
	y.domain(d3.extent(data, function(d) { return d[keys[0]]; }));

	var xAxis;
	var yAxis;

	if (isMobile) {
		xAxis = d3.axisBottom(x).ticks(5);
		yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)}).ticks(5);
	}

	else {
		xAxis = d3.axisBottom(x);
		yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)});
	}

	features.append("g")
			.attr("class","x")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

	features.append("g")
		.attr("class","y")
		.call(yAxis)

	features.selectAll(".bar")
    	.data(data)
		    .enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d[xVar]) })
			.style("fill", function(d) {
					return "#197caa"
			})
			.attr("y", function(d) { 
				return y(Math.max(d[keys[0]], 0))
				// return y(d[keys[0]]) 
			})
			.attr("width", x.bandwidth())
			.attr("height", function(d) { 
				return Math.abs(y(d[keys[0]]) - y(0))

			});



}	

function getURLParams(paramName) {

	const params = window.parent.location.search.substring(1).split("&")

    for (let i = 0; i < params.length; i++) {
    	let val = params[i].split("=");
	    if (val[0] == paramName) {
	        return val[1];
	    }
	}
	return null;

}

const key = getURLParams('key') //"10k7rSn5Y4x0V8RNyQ7oGDfhLvDqhUQ2frtZkDMoB1Xk"

if ( key != null ) {

	Promise.all([
		d3.json(`https://interactive.guim.co.uk/docsdata/${key}.json`)
		])
		.then((results) =>  {
			init(results[0])
			var to=null
			var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
			window.addEventListener('resize', function() {
				var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
				if (lastWidth != thisWidth) {
					window.clearTimeout(to);
					to = window.setTimeout(function() {
						    init(results[0])
						}, 100)
				}
			
			})

		});

}