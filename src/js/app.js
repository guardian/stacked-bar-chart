import * as d3 from "d3"
import { makeTooltip } from './modules/tooltips'

var firstRun = true

function init(results) {
	const container = d3.select("#graphicContainer")
	console.log(results)
	var data = results.sheets.data
	var details = results.sheets.details
	var labels = results.sheets.labels
	var userKey = results['sheets']['key']
	var optionalKeys = [];
	var optionalColours = [];
	var tooltip = null;

	if (userKey.length > 1) { 
		userKey.forEach(function (d) {
			optionalKeys.push(d.key)
			optionalColours.push(d.colour)
		})
	}

	console.log(optionalKeys)
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
	var dateParse = null
	var timeInterval = null

	// Check if margin defined by user

	if (details[0]['margin-top'] != "") {
		console.log("yo")
		margin = {top: +details[0]['margin-top'], right: +details[0]['margin-right'], bottom: +details[0]['margin-bottom'], left:+details[0]['margin-left']};
	}

	else {
		margin = {top: 20, right: 20, bottom: 20, left:40};	
	}	
	
	console.log(margin)

	// Check if time format defined by user


	if (typeof details[0]['dateFormat'] != undefined) {
		dateParse = d3.timeParse(details[0]['dateFormat']);
	}

	if (typeof details[0]['timeInterval'] != undefined) {
		timeInterval = details[0]['timeInterval'];
	}

	if (details[0].tooltip!='' ) {
		tooltip = true
	}

	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

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

	var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];

	var color = d3.scaleOrdinal();

	if (userKey.length > 1) {
		color.domain(optionalKeys).range(optionalColours)
	}	

	else {
		color.domain(keys).range(colors);
	}

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


	keys.forEach(function(key,i) { 

		var keyDiv = chartKey.append("div")
						.attr("class","keyDiv")

		keyDiv.append("span")
			.attr("class", "keyCircle")
			.style("background-color", function() {
					return color(key);
				}
			)

		keyDiv.append("span")
			.attr("class", "keyText")
			.text(key)

	})

	data.forEach(function(d) {

		if (dateParse != null) {
			if (firstRun) {
					d[xVar] = dateParse(d[xVar])
			}
			
		}

		keys.forEach(function(key,i) { 
			d[key] = +d[key]
		});	
	})

	// console.log(data)

	labels.forEach(function (d) {

		if (dateParse != null) {

			d.x = dateParse(d.x)
		}	
		
		d.y = +d.y
		d.y2 = +d.y2
	});

	// Time scales for bar charts are heaps annoying

	var barWidth;
	var xRange;

	function stackMin(serie) {
		  return d3.min(serie, function(d) { return d[0]; });
		}

	function stackMax(serie) {
	  return d3.max(serie, function(d) { return d[1]; });
	}

	if (timeInterval) {

		console.log(data[data.length-1][xVar])

		if (timeInterval == 'year') {
			xRange = d3.timeYear.range(data[0][xVar], d3.timeYear.offset(data[data.length-1][xVar],1));
		}

		if (timeInterval == 'day') {
			xRange = d3.timeDay.range(data[0][xVar], d3.timeDay.offset(data[data.length-1][xVar],1));
		}

		if (timeInterval == 'month') {
			xRange = d3.timeMonth.range(data[0][xVar], d3.timeMonth.offset(data[data.length-1][xVar],1));
		}
		
	}

	else {
		xRange = data.map(function(d) { return d[xVar]; })
	}	

	// console.log(xRange)
 	var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
    	x.domain(xRange);

    var y = d3.scaleLinear().range([height, 0]);

	// if (userKey.length > 1) { 
	// 	userKey.forEach(function (d) {
	// 		optionalKey[d.keyName] = d.colour; 
	// 	})
	// }    

	var layers = d3.stack().offset(d3.stackOffsetDiverging).keys(keys)(data)

	layers.forEach(function(layer) {
		console.log(layer.key)
		layer.forEach(function(subLayer) {
			subLayer.group = layer.key
		})
	})

	y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)]).nice()

	var xAxis;
	var yAxis;

	var ticks = 3

	console.log(x.domain().length)
	var tickMod = Math.round(x.domain().length/10)

	if (isMobile) {
		tickMod = Math.round(x.domain().length/5)
	}	

	console.log("tickMod",tickMod)

	var ticks = x.domain().filter(function(d,i) { return !(i%tickMod); } );
	
	console.log(ticks)
	if (isMobile) {
		xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))
		yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)}).ticks(5);
	}

	else {
		xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %Y"))
		yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)});
	}

	features.append("g")
			.attr("class","x")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

	features.append("g")
		.attr("class","y")
		.call(yAxis)

	var layer = features.selectAll('layer')
		.data(layers)
		.enter()
		.append('g')
		.attr('class', d => "layer " + d.key)
		.style('fill', (d, i) => (color(d.key) ))

	layer.selectAll('rect')
		.data(d => d)
		.enter()
		.append('rect')
		.attr('x', d => x(d.data[xVar]))
		.attr('y', d => y(d[1]))
		.attr("class", "barPart")
		.attr("title", d => d.data[d.key])
		.attr('data-group', d => d.group)
		.attr('data-count', d => d.data[d.key])
		.attr('height', d => y(d[0]) - y(d[1]))
		.attr('width', x.bandwidth())
			

	features.append("g")
			.attr("class","x")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

	features.append("g")
		.attr("class","y")
		.call(yAxis)	

	if (tooltip) {
		makeTooltip(".barPart");	
	}	
	

	function textPadding(d) {
		if (d.y2 > 0) {
			return 12
		}

		else {
			return - 2
		}
	}

	function textPaddingMobile(d) {
		if (d.y2 > 0) {
			return 12
		}

		else {
			return 4
		}
	}		

	features.selectAll(".annotationLine")
		.data(labels)
		.enter().append("line")
		.attr("class", "annotationLine")
		.attr("x1", function(d) { return x(d.x) + x.bandwidth()/2; })
		.attr("y1", function(d) { return y(d.y) })
		.attr("x2", function(d) { return x(d.x) + x.bandwidth()/2; })
		.attr("y2", function(d) { return y(d.y2) })
		.style("opacity", 1)	
		.attr("stroke", "#000");  

	var footerAnnotations = d3.select("#footerAnnotations");
	
	footerAnnotations.html("");	

	if (isMobile) {

		features.selectAll(".annotationCircles")
				.data(labels)
				.enter().append("circle")
				.attr("class", "annotationCircle")
				.attr("cy", function(d) { return y(d.y2) + textPadding(d)/2})
				.attr("cx", function(d) { return x(d.x) + x.bandwidth()/2})
				.attr("r", 8)
				.attr("fill", "#000");

		features.selectAll(".annotationTextMobile")
				.data(labels)
				.enter().append("text")
				.attr("class", "annotationTextMobile")
				.attr("y", function(d) { return y(d.y2) + textPaddingMobile(d)})
				.attr("x", function(d) { return x(d.x) + x.bandwidth()/2})
				.style("text-anchor", "middle")
				.style("opacity", 1)
				.attr("fill", "#FFF")
				.text(function(d,i) { 
					return i + 1
				});	
		console.log(labels.length)
		
		if (labels.length > 0) {
			footerAnnotations.append("span")
				.attr("class", "annotationFooterHeader")
				.text("Notes: ");
		}

		labels.forEach(function(d,i) { 

			footerAnnotations.append("span")
				.attr("class", "annotationFooterNumber")
				.text(i+1 + " - ");

			if (i < labels.length -1 ) {
				footerAnnotations.append("span")
				.attr("class", "annotationFooterText")
				.text(d.text + ", ");
			}
			
			else {
				footerAnnotations.append("span")
					.attr("class", "annotationFooterText")
					.text(d.text);
			}	

			

		})		

	}

	else {

		features.selectAll(".annotationText")
			.data(labels)
			.enter().append("text")
			.attr("class", "annotationText")
			.attr("y", function(d) { return y(d.y2) })
			.attr("x", function(d) { return x(d.x) + x.bandwidth()/2})
			.style("text-anchor", function(d) { return d.align })
			.style("opacity", 1)
			.text(function(d) {return d.text});

	}		

	firstRun = false

}	// end init

function getURLParams(paramName) {

	const params = window.location.search.substring(1).split("&")

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