// craco.config.js
module.exports = {
    webpack: {
        configure: (config) => {
            // CRA içinde source-map-loader kuralını bulup lucide-react'i exclude et
            const visit = (rules) => {
                (rules || []).forEach((rule) => {
                    if (rule && typeof rule === 'object') {
                        if (rule.loader && String(rule.loader).includes('source-map-loader')) {
                            const ex = rule.exclude ? (Array.isArray(rule.exclude) ? rule.exclude : [rule.exclude]) : [];
                            ex.push(/lucide-react/);
                            rule.exclude = ex;
                        }
                        if (rule.oneOf) visit(rule.oneOf);
                        if (rule.rules) visit(rule.rules);
                        if (Array.isArray(rule.use)) visit(rule.use);
                    }
                });
            };
            visit(config.module?.rules);
            return config;
        }
    }
};
