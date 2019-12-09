import * as d3 from "d3"

function makeTooltip(el) {

	console.log("make", el)
	
	var els = d3.selectAll(el)
	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
	var tooltip = d3.select("#graphicContainer").append("div")
		    .attr("class", "tooltip")
		    .attr("id", "tooltip")
		    .style("position", "absolute")
		    .style("background-color", "white")
		    .style("opacity", 0);

	els.on("mouseover", function(d) {
		var text = `<b>${d.group}</b><br>${d.data[d.group]}`
		tooltip.transition()
			.duration(200)
		   	.style("opacity", .9);

		tooltip.html(text)
		var tipHeight = document.querySelector("#tooltip").getBoundingClientRect().height
		var tipWidth = document.querySelector("#tooltip").getBoundingClientRect().width
		// console.log(tipHeight)
		var mouseX = d3.mouse(this)[0]
        var mouseY = d3.mouse(this)[1]
        var half = width/2;

        if (mouseX < half) {
            tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");
        }

        else if (mouseX >= half) {
            tooltip.style("left", (d3.mouse(this)[0] - tipWidth) + "px");
        }

        // tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");
        tooltip.style("top", (d3.mouse(this)[1]) + "px");

	})
	
	els.on("mouseout", function(d) {

	  tooltip.transition()
	       .duration(500)
	       .style("opacity", 0);

	})


}

export { makeTooltip }