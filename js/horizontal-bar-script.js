(function () {
  let DATA_COUNT = 50;

  let data = [];

  for (let i = 0; i < DATA_COUNT; i++) {
    let datum = {};
    datum.label = `Data ${i + 1}`;
    datum.value = Math.floor(Math.random() * 800);
    data.push(datum);
  }

  let margin = { top: 20, right: 0, bottom: 20, left: 60 };
  let marginOverview = 10;
  let selectorWidth = 40;
  let widthOverview = selectorWidth + marginOverview;
  let width = 600 - margin.left - margin.right - widthOverview;
  let height = 600 - margin.top - margin.bottom;

  let maxLength = d3.max(data.map((d) => d.label.length));
  let barWidth = maxLength * 7;
  let numBars = Math.round(width / barWidth);
  let isScrollDisplayed = barWidth * data.length > width;

  const slicedData = data.slice(0, numBars).reverse();

  let xscale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([0, width]);

  let yscale = d3
    .scaleBand()
    .domain(slicedData.map((d) => d.label))
    .range([height, 0])
    .padding(0.1);

  let svg = d3
    .select('#horizontal-chart')
    .append('svg')
    .attr('width', width + margin.left + widthOverview)
    .attr('height', height + margin.top + margin.bottom);

  let diagram = svg
    .append('g')
    .attr('transform', `translate(${margin.left} , ${margin.top})`);

  diagram
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, 0)`)
    .call(d3.axisTop(xscale));

  diagram.append('g').attr('class', 'y axis').call(d3.axisLeft(yscale));

  let bars = diagram.append('g');

  bars
    .selectAll('rect')
    .data(data.slice(0, numBars), (d) => d.label)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => yscale(d.label))
    .attr('width', (d) => xscale(d.value))
    .attr('height', yscale.bandwidth());

  if (isScrollDisplayed) {
    const dataReversed = data.slice(0, data.length).reverse();

    let xOverview = d3
      .scaleLinear()
      .range([0, selectorWidth])
      .domain(xscale.domain());

    let yOverview = d3
      .scaleBand()
      .domain(dataReversed.map((d) => d.label))
      .range([height, 0])
      .padding(0.2);

    let subBars = diagram.selectAll('.subBar').data(dataReversed);

    subBars
      .enter()
      .append('rect')
      .classed('subBar', true)
      .attr('height', () => yOverview.bandwidth())
      .attr('width', (d) => xOverview(d.value))
      .attr('x', width + marginOverview)
      .attr('y', (d) => yOverview(d.label));

    var displayedH = d3
      .scaleQuantize()
      .domain([0, height])
      .range(d3.range(data.length));

    diagram
      .append('rect')
      .attr('transform', `translate(${width + marginOverview}, 0)`)
      .attr('class', 'mover')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 70)
      .attr('width', selectorWidth)
      .attr('pointer-events', 'all')
      .attr('cursor', 'ns-resize')
      .call(d3.drag().on('drag', reclaculateHorizontal));
  }

  function reclaculateHorizontal() {
    let y = parseInt(d3.select(this).attr('y')),
      ny = y + d3.event.dy,
      h = parseInt(d3.select(this).attr('height')),
      f,
      nf,
      new_data,
      rects;

    if (ny < 0 || ny + h > height) return;

    d3.select(this).attr('y', ny);

    f = displayedH(y);
    nf = displayedH(ny);

    if (f === nf) return;

    new_data = data.slice(nf, nf + numBars).reverse();

    yscale.domain(new_data.map((d) => d.label));

    diagram.select('.y.axis').call(d3.axisLeft(yscale));

    rects = bars.selectAll('rect').data(new_data, (d) => d.value);

    rects.attr('y', (d) => yscale(d.label));

    rects
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => yscale(d.label))
      .attr('width', (d) => xscale(d.value))
      .attr('height', yscale.bandwidth());

    rects.exit().remove();
  }
})();
