export function createLineChart() {

    // Tooltip div
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    d3.csv("./data/rent_homeless.csv").then(data => {
        // Convert numeric values
        data.forEach(d => {
            d.Year = +d.Year;
            d.MedianRent = +d.MedianRent;
            d.HomelessCount = +d.HomelessCount;
        });

        console.log(data);

        // ── DIMENSIONS ────────────────────────────────────────────────
        const margin = { top: 40, right: 90, bottom: 60, left: 90 };
        const width = 1100 - margin.left - margin.right;
        const height = 550 - margin.top - margin.bottom;

        // ── SVG ───────────────────────────────────────────────────────
        const svg = d3.select("#chart1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // chart title 
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "27px")
            .attr("font-weight", "bold")
            .attr("fill", "#0f172a")
            .text("Rising Rent Prices and Homelessness in King County (2012–2024)");

        // ── SCALES ────────────────────────────────────────────────────

        // X scale — years
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([0, width]);

        // Left Y scale — median rent
        const yRent = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.MedianRent) * 1.15])
            .range([height, 0]);

        // Right Y scale — homelessness count
        const yHomeless = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.HomelessCount) * 1.15])
            .range([height, 0]);

        // ── AXES ────────────────────────────────────────────────────── 
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .tickFormat(d3.format("d"))
                    .ticks(data.length)
            );

        xAxis.selectAll("text")
            .attr("font-size", "14px");

        const leftAxis = svg.append("g")
            .call(
                d3.axisLeft(yRent)
                    .tickFormat(d => "$" + d3.format(",")(d))
            );

        leftAxis.selectAll("text")
            .attr("font-size", "14px");

        const rightAxis = svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(
                d3.axisRight(yHomeless)
                    .tickFormat(d => d3.format(",")(d))
            );
        rightAxis.selectAll("text")
            .attr("font-size", "14px");


        // ── LINES ─────────────────────────────────────────────────────

        // Line generator — rent
        const rentLine = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yRent(d.MedianRent))
            .curve(d3.curveMonotoneX);

        // Line generator — homelessness
        const homelessLine = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yHomeless(d.HomelessCount))
            .curve(d3.curveMonotoneX);

        // Draw rent line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#c0392b")
            .attr("stroke-width", 2.5)
            .attr("d", rentLine);

        // Draw homelessness line (dashed)
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#2c7bb6")
            .attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "6,3")
            .attr("d", homelessLine);

        // ── DOTS ──────────────────────────────────────────────────────

        // Dots — rent
        svg.selectAll(".dot-rent")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-rent")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yRent(d.MedianRent))
            .attr("r", 5)
            .attr("fill", "#c0392b")
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.Year}</strong><br>Median Rent: $${d3.format(",")(d.MedianRent)}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        // Dots — homelessness
        svg.selectAll(".dot-homeless")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-homeless")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yHomeless(d.HomelessCount))
            .attr("r", 5)
            .attr("fill", "#2c7bb6")
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.Year}</strong><br>Homeless Count: ${d3.format(",")(d.HomelessCount)}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        // ── AXIS LABELS ───────────────────────────────────────────────

        // X axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")

            .text("Year");

        // Left Y axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -72)
            .attr("text-anchor", "middle")
            .attr("fill", "#c0392b")
            .text("Median Monthly Rent ($)");

        // Right Y axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(90)")
            .attr("x", height / 2)
            .attr("y", -width - 62)
            .attr("text-anchor", "middle")
            .attr("fill", "#2c7bb6")
            .text("Homelessness Count (King County)");
    });
}