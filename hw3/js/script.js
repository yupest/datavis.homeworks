const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создайте симуляцию с использованием forceCenter, forceX и forceCollide
    // ..
const simulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(1)) // increasing this value place bubbles forcing a vertcial placement
    .force('collision', d3.forceCollide())
    .force('center', d3.forceCenter(b_width/2, b_height/2));

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);  
    
    // Part 1 - задайте domain  для шкал
    x.domain([d3.min(years), d3.max(years)]);
    radius.domain([d3.min(rating), d3.max(rating)]);
    color.domain(ratings);

    console.log(data.map(d=> color(ratings.findIndex(r => r.key == d.rating))));
    // Part 1 - создайте circles на основе data
    var nodes = bubble
        .selectAll("circle").data(data).enter()
        .append("circle")
        .attr("cx", d => x(+d['release year']))
        .attr("fill", d=> color(d.rating))
        .attr("r", d => radius(+d['user rating score']));

    // добавьте обработчики событий mouseover и mouseout
    nodes.on('mouseover', overBubble)
    nodes.on('mouseout', outOfBubble);
    
    simulation.nodes(data)
    .on('tick', () => {
      nodes
        .attr('cx', d => +d.x)
        .attr('cy', d => +d.y)
    });

    simulation.force('collision', d3.forceCollide().radius(function(d) {
        return radius(+d['user rating score'])
      }));
    simulation.force('x', d3.forceX().x(function(d){
        return x(+d['release year'])
    }));

    // Part 1 - Создайте шаблон при помощи d3.pie на основе ratings  

    var pie = d3.pie()
    .value(function(d){return d.value.value});

    var arc = d3.arc()
    .innerRadius(100)
    .outerRadius(250);

    donut.selectAll('part')
        .data(pie(d3.entries(ratings)))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr("stroke", "white")
        .attr('fill', function(d){ return color(d.data.value.key)})
        .style("stroke-width", "2px")
        .style("opacity", '1')
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){

        // Part 2 - задайте stroke и stroke-width для выделяемого элемента   
        d3.select(this).style('stroke', 'black');
        d3.select(this).style('stroke-width', '0.8');

        // Part 3 - обновите содержимое tooltip с использованием классов title и year
        tooltip.html(
          "<b>" + 
          d['title'] + 
          "</b>" + 
          "<br/>" + 
          d['release year']
        )

        // Part 3 - измените display и позицию tooltip
        tooltip
        .style('display', 'block')
        .style("top", (d.y - 90) + "px") 
        .style("left", (d.x - 90) + "px") 
    }
    function outOfBubble(){
        // Part 2 - обнулите stroke и stroke-width
        d3.select(this).style('stroke', '');
        d3.select(this).style('stroke-width', '');
        // Part 3 - измените display у tooltip
        tooltip.style('display', 'none')
    }

    function overArc(d){
        // Part 2 - измените содержимое donut_lable
        donut_lable.text(d.data.value.key);
        
        // Part 2 - измените opacity арки
        d3.select(this).style('opacity', '0.3');
        
        // Part 3 - измените opacity, stroke и stroke-width для circles в зависимости от rating
        bubble.selectAll('circle')
            .style('opacity', function(dat) {
                if (dat.rating == d.data.value.key) { return '1'; } else { return '0.3'; }
              }
            )
            .style('stroke', function(dat) {
                if (dat.rating == d.data.value.key) { return 'black'; } else { return ''; }
              }
            )
            .style('stroke-width', function(dat) {
                if (dat.rating == d.data.value.key) { return '0.8'; } else { return '0'; }
              }
            );
           
    }
    function outOfArc(){
        // Part 2 - измените содержимое donut_lable
        donut_lable.text('')
       
        // Part 2 - измените opacity арки
        d3.select(this).style('opacity', '1');

        // Part 3 - верните opacity, stroke и stroke-width для circles
        bubble.selectAll('circle')
        .style('opacity', '1')
        .style('stroke', '')
        .style('stroke-width', 0)
    }
});