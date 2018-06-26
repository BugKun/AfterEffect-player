const webpack = require('webpack'),
    path = require('path'),
    HappyPack = require('happypack'),
    os = require("os"),
    threads = os.cpus().length,
    ThreadLimit = 8, //超过8个线程后 happypack 打包速度会更慢
    happyThreadPool = HappyPack.ThreadPool({ size: (threads > ThreadLimit)? ThreadLimit : threads }),
    isProd = process.env.NODE_ENV === "production";

module.exports = {
    mode: isProd ? "production" : "development",
    entry:{
        "AfterEffectPlayer": './src/index.js'
    }, //入口文件
    output: {
        path: __dirname, //输出位置
        filename: 'dist/[name].js', //输入文件
        publicPath: '/',
        libraryTarget: 'umd',
        // `library` 声明全局变量
        library: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['happypack/loader?id=babel']
            }
        ]
    },
    plugins: [
        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            use: [{
                loader: "babel-loader?cacheDirectory=true",
                exclude: /node_modules/
            }],

        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    externals: {

    },
    devServer: {
        historyApiFallback: true, //如果设置为true，所有的跳转将指向index.html
        inline: true, //设置为true，当源文件改变时会自动刷新页面
        hot: true,
        contentBase: path.resolve(__dirname, "example"),
    }
};
