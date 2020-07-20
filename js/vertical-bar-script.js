// Adapted from http://bl.ocks.org/cse4qf/95c335c73af588ce48646ac5125416c6

(function () {
  let DATA_COUNT = 50;

  let data = [];

  for (let i = 0; i < DATA_COUNT; i++) {
    let datum = {};
    datum.label = `Data ${i + 1}`;
    datum.value = Math.floor(Math.random() * 600);
    data.push(datum);
  }

  let margin = { top: 20, right: 10, bottom: 20, left: 40 };
  let marginOverview = { top: 30, right: 10, bottom: 20, left: 40 };
  let selectorHeight = 40;
  let width = 600 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom - selectorHeight;
  let heightOverview = 80 - marginOverview.top - marginOverview.bottom;

  let maxLength = d3.max(data.map((d) => d.label.length));
  let barWidth = maxLength * 7;
  let numBars = Math.round(width / barWidth);
  let isScrollDisplayed = barWidth * data.length > width;

  console.log(isScrollDisplayed);

  let xscale = d3
    .scaleBand()
    .domain(data.slice(0, numBars).map((d) => d.label))
    .range([0, width])
    .padding(0.1);

  let yscale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height, 0]);

  let svg = d3
    .select('#vertical-chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + selectorHeight);

  let diagram = svg
    .append('g')
    .attr('transform', `translate(${margin.left} , ${margin.top})`);

  diagram
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xscale));

  diagram.append('g').attr('class', 'y axis').call(d3.axisLeft(yscale));

  let bars = diagram.append('g');

  bars
    .selectAll('rect')
    .data(data.slice(0, numBars), (d) => d.label)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xscale(d.label))
    .attr('y', (d) => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('height', (d) => height - yscale(d.value));

  if (isScrollDisplayed) {
    let xOverview = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, width])
      .padding(0.2);

    yOverview = d3.scaleLinear().range([heightOverview, 0]);
    yOverview.domain(yscale.domain());

    let subBars = diagram.selectAll('.subBar').data(data);

    subBars
      .enter()
      .append('rect')
      .classed('subBar', true)
      .attr('height', (d) => heightOverview - yOverview(d.value))
      .attr('width', () => xOverview.bandwidth())
      .attr('x', (d) => xOverview(d.label))
      .attr('y', (d) => height + heightOverview + yOverview(d.value));

    var displayedV = d3
      .scaleQuantize()
      .domain([0, width])
      .range(d3.range(data.length));

    diagram
      .append('rect')
      .attr('transform', 'translate(0, ' + (height + margin.bottom) + ')')
      .attr('class', 'mover')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', selectorHeight)
      .attr('width', Math.round(parseFloat(numBars * width) / data.length))
      .attr('pointer-events', 'all')
      .attr('cursor', 'ew-resize')
      .call(d3.drag().on('drag', reclaculateVertical));
  }

  function reclaculateVertical() {
    let x = parseInt(d3.select(this).attr('x')),
      nx = x + d3.event.dx,
      w = parseInt(d3.select(this).attr('width')),
      f,
      nf,
      new_data,
      rects;

    if (nx < 0 || nx + w > width) return;

    d3.select(this).attr('x', nx);

    f = displayedV(x);
    nf = displayedV(nx);

    if (f === nf) return;

    new_data = data.slice(nf, nf + numBars);

    xscale.domain(new_data.map((d) => d.label));
    diagram.select('.x.axis').call(d3.axisBottom(xscale));

    rects = bars.selectAll('rect').data(new_data, (d) => d.label);

    rects.attr('x', (d) => xscale(d.label));

    rects
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xscale(d.label))
      .attr('y', (d) => yscale(d.value))
      .attr('width', xscale.bandwidth())
      .attr('height', (d) => height - yscale(d.value));

    rects.exit().remove();
  }
})();
