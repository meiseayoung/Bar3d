function Bar3d(opts) {
    return Bar3d.fn.init(opts);
}
Bar3d.fn = Bar3d.prototype = {
    init: function(opts) {
        var defaultConfig = {
            name: "Bar3d",
            renderTo: null,
            xAxis: ["船舶", "船舶", "船舶", "船舶", "船舶"], //名称
            lineData: [100, 50, 60, 40, 20], //拆线数据
            barData: [0, 0, 0, 0, 0], //柱图数据
            barMargin: 12 //柱子左右距离
        }
        this.config = Object.assign(defaultConfig, opts);
        this._createChartContainer();
        this._createBars();
        this._createLines();
        this._animate();
    },
    sayHello: function() {
        return this;
    },
    /**
     * 创建折线和柱图容器
     * @return undefined 无返回值
     **/
    _createChartContainer: function() {
        var me = this;
        if (!$(me.config.renderTo).length) {
            console.warn("渲染容器不存在,请检查传入的renderTo配置项");
            return;
        }
        $(me.config.renderTo).empty();
        var html = `<div class="bar3d-bg-chart" style="height: 220px;width: 220px;position: absolute;left:20px;z-index:1"></div>
		    				<div class="bar3d-legend" style="position:absolute;right:0px;top:5px;">
		    					<div style="display:inline-block;"><i style="display:inline-block;height:8px;width:8px;background-color:#17a2e2;"></i><span style="color:#a9a9a9;font-size:10px;">当前值</span></div>
		    					<div style="display:inline-block;"><i style="display:inline-block;height:4px;width:8px;background-color:#0aba1b;"></i><span style="color:#a9a9a9;font-size:10px;">全国中间值</span></div>
		    				</div>
		    				<div class="bar3d" style="height: 220px;width: 220px;position: absolute;left:20px;"></div>`;
        $(me.config.renderTo).append(html);
    },
    /**
     * 动态创建柱子
     * @param 
     * @return undefined 无返回值
     **/
    _createBars: function() {
        var me = this;

        function createItem(list, margin, lineData) {
            var scale = d3.scaleLinear().range([0, 100]).domain([0, d3.max(lineData)]);
            return list.map(function(data, index) {
                return `<li class="bar3d-list-item" style="position: relative;height: 100%;margin:0px ${me.config.margin || 30}px">
									<div class="bar3d-list-item-value" style="position: absolute;"></div>
									<div class="bar3d-list-item-graphic" style="width: 100%;position: absolute;">
										<div style="position: relative;width: 100%;height: 0%;margin-top: 0;" data-marginTop="calc(140px * ${1 - scale(data.value).toFixed(2)/100})" data-height="${scale(data.value).toFixed(2)}">
											<div style="width: 100%;height: 100%;position: absolute;top: 0px;left: 0px;"></div>
											<div style="width: 50%;height: 100%;position: absolute;top: 0px;left: 0px;"></div>
											<div style="position: absolute;top: 0px;left: 0px;"></div>
										</div>
									</div>
									<div class="bar3d-list-item-label" style="position: absolute;width: 100px;" title="${data.text}">${data.text}</div>
								</li>`
            }).join("");
        };
        var list = me.config.barData.map(function(v, i) {
            return {
                text: me.config.xAxis[i],
                value: v
            }
        });
        var barsHTML = `<ul class="bar3d-list" style="height: 220px;">
					${createItem(list,me.config.margin,me.config.lineData.concat(me.config.barData))}
		    	</ul>`;
        $(me.config.renderTo).find(".bar3d").html(barsHTML);
    },
    /**
     * 创建拆线图
     *
     **/
    _createLines: function() {
        var me = this;

        function createOptions(lineData) {
            var option = {
                color: ["rgba(0,0,0,0)", "#0aba1b"],
                tooltip: {
                    show: false,
                    trigger: 'axis'
                },
                legend: {
                    show: false,
                    right: 30,
                    top: 0,
                    data: ['当前值', '全国中间值'],
                    textStyle: {
                        color: "#ffffff",
                        fontSize: 10,
                        fontFamily: "微软雅黑"
                    }
                },
                grid: {
                    left: 25,
                    right: 0,
                    top: 25,
                    bottom: 30
                },
                xAxis: {
                    show: true,
                    type: 'category',
                    boundaryGap: false,
                    data: ["船舶", "航空", "铁路", "车辆", "舱单"],
                    axisLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                        textStyle: {
                            color: "#a9a9a9"
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: "#2f466b"
                        }
                    },
                    axisLabel: {
                        fontSize: 8,
                        color: "#a9a9a9"
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            color: "#2f466b"
                        }
                    }
                },
                series: [{
                    name: '当前值',
                    type: 'bar',
                    smooth: true,
                    data: [0, 0, 0, 0, 0],
                    barWidth: 14,
                    itemStyle: {
                        normal: {
                            borderColor: "#17a2e2",
                            borderWidth: 0
                        }
                    }
                }, {
                    name: '全国中间值',
                    type: 'line',
                    smooth: true,
                    data: lineData
                }]
            };
            return option;
        };
        me.echartsInstance = echarts.init($(me.config.renderTo).find(".bar3d-bg-chart").get(0));
        me.echartsInstance.setOption(createOptions(me.config.lineData));
    },
    /**
     * 柱状图生长动画
     * @return undefined 无返回值
     **/
    _animate: function() {
        var me = this;
        $(me.config.renderTo).find(".bar3d-list-item-graphic").each(function(index, elem) {
            var height = $(elem).find(">div").attr("data-height");
            var marginTop = $(elem).find(">div").attr("data-marginTop");
            $(elem).find(">div").css({
                height: height + "%",
                marginTop: marginTop
            });
        });
    }
}
Bar3d.fn.init.prototype = Bar3d.fn;