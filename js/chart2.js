export function createBarChart() {

    // chart dimensions
    const w = 1200;
    const h = 750;
    const margin = 140;

    // load CSV data
    d3.csv("./data/neighborhood_rent_data.csv").then(data => {

        // convert rent values to numbers
        data.forEach(d => {
            d.increase = +d.increase;
        });

        console.log(data);

        // x scale
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.increase)])
            .range([margin, w - margin]);

        // y scale
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.neighborhoods))
            .range([margin, h - margin])
            .padding(0.2);

        // create SVG container
        const svg = d3.select("#chart2")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
        
        const tooltip = d3.select(".tooltip");

        // create bars
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", margin)
            .attr("y", d => yScale(d.neighborhoods))
            .attr("width", d => xScale(d.increase) - margin)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#5B7C99")
            .on("mouseover", function(event, d) { 
                tooltip 
                    .style("opacity", 1) 
                    .html(` 
                        <strong>${d.neighborhoods}</strong><br> 
                        Rent Increase: ${d.increase}% 
                    `); 
            }) 
            .on("mousemove", function(event) { 
                tooltip 
                    .style("left", (event.pageX + 15) + "px") 
                    .style("top", (event.pageY - 28) + "px"); 
            }) 
            .on("mouseout", function() {
                tooltip 
                    .style("opacity", 0); 
            });

        // chart title
        svg.append("text")
            .attr("x", w / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Rent Increase Percentage by Seattle Neighborhood (2014-2024)");

        // label values
        svg.selectAll("text.labels")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "labels")
            .attr("x", d => xScale(d.increase) + 8)
            .attr("y", d => yScale(d.neighborhoods) + yScale.bandwidth() / 2 + 5)
            .text(d => d.increase + "%")
            .attr("font-size", "12px")
            .attr("fill", "#333");

        // add x-axis
        const xAxis = svg.append("g") 
            .attr("transform", `translate(0, ${h - margin})`) 
            .call( 
                d3.axisBottom(xScale) 
                .tickFormat(d => d + "%") 
            ); 

        xAxis.selectAll("text") 
                .attr("font-size", "16px");

        // add y-axis
        const yAxis = svg.append("g") 
            .attr("transform", `translate(${margin}, 0)`) 
            .call( 
                d3.axisLeft(yScale) 
            ); 
        
        yAxis.selectAll("text") 
            .attr("font-size", "16px");
    });
}
