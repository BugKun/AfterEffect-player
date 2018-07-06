Vue.component('echarts', {
    name: "echarts",
    props: {
        options: {
            type: Object,
            require: true
        }
    },
    mounted: function() {
        this.myChart = echarts.init(this.$refs.echarts);
        this.setOption(this.options);
        this.$on('resize', this.resizeChart);
    },
    watch: {
        options: {
            handler: function(curVal) {
                this.setOption(curVal);
            },
            deep: true
        },
    },
    beforeDestory: function() {
        this.$off('resize', this.resizeChart);
        this.myChart.dispose();
        this.myChart = null;
    },
    data: function() {
        return {
            myChart: null
        }
    },
    methods: {
        setOption: function(options) {
            this.myChart.setOption(options, true);
        },
        resizeChart: function() {
            this.setOption(this.options);
            this.myChart.resize();
        }
    },
    template: '<div ref="echarts"></div>'
});