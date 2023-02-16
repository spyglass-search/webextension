module.exports = {
    webpack: (config, { dev, vendor }) => {
        config.module.rules.push({
            test: /\.css$/i,
            use: ["style-loader", "css-loader", "postcss-loader"],
        });

        return config;
    },
};
