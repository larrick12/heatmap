const Project = "Global heat temperature"; // coded by larrick, follow at github.com/larrick12

let h = 400;
let w = 800;

let url =
"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let color = [
"#F7630C",
"#FF8C00",
"#FFB900",
"#E81123",
"#42A5F5",
"#2196F3",
"#1E88E5",
"#1976D2",
"#0D47A1",
"#BDBDBD",
"#9E9E9E",
"#757575",
"#1A237E",
"#616161",
"#FFA726",
"#FF9800",
"#FB8C00",
"#EF6C00",
"#d50000",
"#DD2C00",
"#2E7D32",
"#F9A825",
"#FBC02D"].
reverse();

let svgCont = d3.
select(".svgcont").
append("svg").
attr("class", "svg").
attr("width", w + 500).
attr("height", h + 200);

let overlay = d3.
select(".svgcont").
append("div").
attr("id", "tooltip").
attr("class", "tooltip").
style("opacity", 0);

d3.json(url, (err, data) => {
  let subtitle = d3.
  select("#title").
  append("h3").
  attr("id", "description").
  attr("class", "subtitle").
  html(
  data.monthlyVariance[0].year +
  "-" +
  data.monthlyVariance[data.monthlyVariance.length - 1].year +
  ": base temperature " +
  data.baseTemperature +
  "&#8451;");


  let month = svgCont.
  append("text").
  attr("x", -180).
  attr("y", 25).
  attr("transform", "rotate(-90)").
  text("Months");

  let year = svgCont.
  append("text").
  attr("x", w - 250).
  attr("y", h + 90).
  attr("class", "descript").
  text("Years");

  let years = data.monthlyVariance.map(item => item.year);

  let xScale = d3.
  scaleLinear().
  domain([d3.min(years), d3.max(years)]).
  range([0, w + 200]);

  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSize(10);

  svgCont.
  append("g").
  attr("id", "x-axis").
  attr("class", "x-axis").
  call(xAxis).
  attr("transform", "translate(65," + (h + 25) + ")");

  data.monthlyVariance.forEach(d => d.month -= 1);

  let m = data.monthlyVariance.map(item => item.month);

  let yScale = d3.
  scaleBand().
  domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).
  range([0, h + 20]);

  let yAxis = d3.
  axisLeft(yScale).
  tickFormat(d => {
    let date = new Date(0);
    date.setUTCMonth(d);
    return d3.timeFormat("%B")(date);
  }).
  tickSize(10, 1);

  svgCont.
  append("g").
  attr("id", "y-axis").
  attr("class", "y-axis").
  call(yAxis).
  attr("transform", "translate(65, 5)");

  let variance = data.monthlyVariance.map(item => item.variance);

  let mintemp = data.baseTemperature + Math.min.apply(null, variance);

  let maxtemp = data.baseTemperature + Math.max.apply(null, variance);

  let threshold = d3.
  scaleThreshold().
  domain(
  function (d, m, c) {
    let arr = [];
    let s = (m - d) / c;
    let b = d;
    for (let i = 1; i < c; i++) {
      arr.push(b + i * s);
    }
    return arr;
  }(mintemp, maxtemp, color.length)).

  range(color);

  svgCont.
  selectAll("rect").
  data(data.monthlyVariance).
  enter().
  append("rect").
  attr("data-month", d => d.month).
  attr("data-year", d => d.year).
  attr("data-temp", d => data.baseTemperature + d.variance).
  attr("x", (d, i) => xScale(d.year)).
  attr("class", "cell").
  attr("y", (d, i) => yScale(d.month)).
  attr("width", 2).
  attr("height", 35).
  attr("transform", "translate(66, 5)").
  attr("fill", d => threshold(data.baseTemperature + d.variance)).
  on("mouseover", (d, i) => {
    let date = new Date(d.year, d.month);
    overlay.transition().duration(0).style("opacity", 0.9);
    overlay.html(
    "<span class='date'>" +
    d3.timeFormat("%Y - %B")(date) +
    "</span>" +
    "<br/>" +
    '<span class="temp">' +
    d3.format(".1f")(data.baseTemperature + d.variance) +
    "&#8451;" +
    "</span>" +
    "<br/>" +
    "<span class='variance'>" +
    d3.format("+.1f")(d.variance) +
    "&#8451" +
    "</span>");

    overlay.
    attr("data-year", d.year).
    style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY - 30 + "px").
    style("transform", "translateX(10px)");
  }).
  on("mouseout", function () {
    overlay.transition().duration(200).style("opacity", 0);
  });

  let legend = d3.scaleLinear().domain([mintemp, maxtemp]).range([0, 400]);

  let x = d3.axisBottom(legend).tickFormat(d3.format(".1f")).tickSize(8);

  let legends = svgCont.
  append("g").
  call(x).
  attr("id", "legend").
  attr("class", "legend").
  attr("transform", "translate(65, 536)");

  legends.
  append("g").
  selectAll("rect").
  data(
  threshold.range().map(item => {
    let d = threshold.invertExtent(item);
    if (d[0] == null) d[0] = legend()[0];
    if (d[1] == null) d[1] = legend()[1];
    return d;
  })).

  enter().
  append("rect").
  attr("height", 20).
  attr("width", (d, i) => legend(d[1]) - legend(d[0])).
  attr("x", d => legend(d[0])).
  attr("y", -20).
  style("fill", d => threshold(d[0]));
});