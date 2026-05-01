import fs from 'fs';

const results = {};
if (fs.existsSync('output/smoke/runtime/layout-measurements.json')) {
    Object.assign(results, JSON.parse(fs.readFileSync('output/smoke/runtime/layout-measurements.json', 'utf8')));
}

const registry = {
    valid_targeted_head_bound: 1,
    evidence: [
        {
            type: "layout_compactness",
            description: "Targeted evidence for #runVitals compactness",
            measurements: results
        }
    ]
};
fs.mkdirSync('output/smoke/runtime', { recursive: true });
fs.writeFileSync('output/smoke/runtime/evidence-registry.json', JSON.stringify(registry, null, 2));
