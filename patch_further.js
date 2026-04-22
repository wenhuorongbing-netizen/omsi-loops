const fs = require('fs');

let css = fs.readFileSync('stylesheet.css', 'utf8');

// Decrease margins/paddings further.
// The probe is measuring the commandDeck height at 974px. This means the layout constraints aren't taking effect
// or there's a missing display: flex or contain property preventing the height constraint from working.
// Let's add max-height: 40vh to #commandDeck for all sizes to strictly enforce it!

css = css.replace(`        & #commandDeck {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding-bottom: 2px;
            max-height: 35vh;
            overflow-y: auto;
        }`, `        & #commandDeck {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding-bottom: 2px;
            max-height: 30vh;
            overflow-y: auto;
        }`);

// Also we should ensure grid container for desktop is constrained
css = css.replace(`    & #commandDeck {
        grid:
            "time time" 14px
            "run menu" auto
            "resources menu" auto
            / minmax(0, 1.45fr) minmax(320px, 0.92fr);
        gap: 6px;
    }`, `    & #commandDeck {
        grid:
            "time time" 14px
            "run menu" auto
            "resources menu" auto
            / minmax(0, 1.45fr) minmax(320px, 0.92fr);
        gap: 4px;
        max-height: 40vh;
        overflow-y: auto;
    }`);

css = css.replace(`        & #commandDeck {
            grid:
                "time" 14px
                "run" auto
                "resources" auto
                "menu" auto
                / 100%;
            gap: 4px;
        }`, `        & #commandDeck {
            grid:
                "time" 14px
                "run" auto
                "resources" auto
                "menu" auto
                / 100%;
            gap: 4px;
            max-height: 35vh;
            overflow-y: auto;
        }`);

fs.writeFileSync('stylesheet.css', css);
