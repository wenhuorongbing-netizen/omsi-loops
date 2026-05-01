import fs from 'fs';
const measurements = JSON.parse(fs.readFileSync('output/smoke/runtime/layout-measurements.json', 'utf8'));

const registry = {
    valid_targeted_head_bound: 1,
    evidence: [
        {
            type: "layout_compactness",
            description: "Targeted evidence for #runVitals compactness",
            measurements: measurements
        }
    ]
};
fs.writeFileSync('output/smoke/runtime/evidence-registry.json', JSON.stringify(registry, null, 2));
