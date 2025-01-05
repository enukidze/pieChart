class Chart {
    constructor() {
        // Defining state attributes
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 200,
            marginTop: 5,
            marginBottom: 5,
            marginRight: 5,
            marginLeft: 5,
            container: "body",
            defaultTextFill: "#2C3E50",
            defaultFont: "Helvetica",
            data: null,
            chartWidth: null,
            chartHeight: null
        };

        // Defining accessors
        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);

        // Automatically generate getter and setters for chart object based on the state properties;
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                }
                attrs[key] = _;
                return this;
            };
        });

        // Custom enter exit update pattern initialization (prototype method)
        this.initializeEnterExitUpdatePattern();
    }


    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.drawRects();
        return this;
    }

    calculateProperties() {
        const {
            marginLeft,
            marginTop,
            marginRight,
            marginBottom,
            svgWidth,
            svgHeight
        } = this.getState();

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({
            calc,
            chartWidth,
            chartHeight
        });
    }

    drawRects() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight
        } = this.getState();
        const radius = Math.min(chartWidth, chartHeight) / 4;
        const pie = d3.pie().value(d => d.value).sort(null)
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const arcs = pie(data)

        console.log(arcs)

        chart._add({
                tag: 'path',
                className: 'pie-slice',
                data: arcs
            })
            .attr("d", arc)
            .attr('transform', `translate(${chartWidth / 2},${chartHeight/2})`)
            .attr("fill", (d) => d.data.color)
            .attr('stroke', 'black')

        chart._add({
                tag: 'text',
                className: 'arc-label-precentage',
                data: arcs
            })
            .attr('transform', (d) => {
                const [x, y] = arc.centroid(d);
                console.log(x, y)
                return `translate(${x + chartWidth / 2}, ${y + chartHeight / 2} )`;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '14px')
            .text(d => d.data.value + '%');

        const textLabels = chart._add({
                tag: 'foreignObject',
                className: 'pie-slice-label',
                data: arcs
            })
            .attr('transform', function (d) {
                const [x, y] = arc.centroid(d);
                const radius = Math.sqrt(x * x + y * y); 
                const angle = Math.atan2(y, x); 
                const offset = radius * 1.23; 
                const newX = x * (1 + offset / radius) - 10;
                const newY = y * (1 + offset / radius);

                return `translate(${chartWidth / 2 + newX}, ${ chartHeight / 2 +newY})`;
            })
            .attr('width',120)
            .attr('height',50)
            .html(d => `<div style="font-size: 12px;">${d.data.name}</div>`)

            const legend = chart._add({
                tag: 'foreignObject',
                className: 'main-leged'
            })
            .attr('width',400)
            .attr('height',50)
            .attr('x',(chartWidth / 2) - 100)
            .attr('y',50)
            .html(`<div style="font-weight: bold;">Avarage Household Expenses </div>`)

    }

    drawSvgAndWrappers() {
        const {
            d3Container,
            svgWidth,
            svgHeight,
            defaultFont,
            calc,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        // Draw SVG
        const svg = d3Container
            ._add({
                tag: "svg",
                className: "svg-chart-container"
            })
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("font-family", defaultFont);

        //Add container g element
        var chart = svg
            ._add({
                tag: "g",
                className: "chart"
            })
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );


        this.setState({
            chart,
            svg
        });
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype._add = function (params) {
            var container = this;
            var className = params.className;
            var elementTag = params.tag;
            var data = params.data || [className];
            var exitTransition = params.exitTransition || null;
            var enterTransition = params.enterTransition || null;
            // Pattern in action
            var selection = container.selectAll("." + className).data(data, (d, i) => {
                if (typeof d === "object") {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            if (exitTransition) {
                exitTransition(selection);
            } else {
                selection.exit().remove();
            }

            const enterSelection = selection.enter().append(elementTag);
            if (enterTransition) {
                enterTransition(enterSelection);
            }
            selection = enterSelection.merge(selection);
            selection.attr("class", className);
            return selection;
        };
    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var d3Container = d3.select(attrs.container);
        var containerRect = d3Container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        d3.select(window).on("resize." + attrs.id, function () {
            var containerRect = d3Container.node().getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            this.render();
        });

        this.setState({
            d3Container
        });
    }
}