import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:8200");

    // Simulate end-game state
    const save_str = "eNqlXXtz28gN/yofcz/sVnffZ8YxYzv1+BKHmziZTBJ7EsvXU+hIoC6lSgIkQEqy2/73C0iABEmQkl133Y+ZRFwsFovFYvHj8u//+E/5w4//yD//63/+z+e/nJ/+8p/L1WpxnL9/5f385c/fH797mP/8l/PFYvbn4/J4tZh9eZq/XSw//+vL49Xi228X84vjy8s/Zufzxcufb1cfjufLxZ9/+Zfz8+PF3b+fn/64PD9ezG5+/unr95ffH1//s5itjhd/Wsz+7+7/j99/9m+LxS//9t/PTz/808vffvjzj6vFh79dzNfnx8vj99sXv83+uDzcvT+fzWZnz8vFXz++mO2wM9R8dv+Xk+e3L//4+c+ffn1x8Zez83/9z/nZ89cvf//u/O/z84/zxcv7H2cfD7PVw+yP2cX3j1fv54v5Bf+eT0r5d35aXnE6q/2388V8+S+L1cf5+aenH89/PP/b9a3uU/Z+uHl+en6zml+sVl8Pz9ezH789rFbfPtx/wH+7T0y/rOaX52f/4k/7f/PjD7e39+1wB+6k2P/lZf5+/t1x/n754ePxcrY4vrzc3l+tlw+r+b/iL6v7x81f0N+9XyzOL+bLh9Xl7A/H98sPq3X1D9hWn1YPt25++cvq8c2H5cPhYvFuvV7c//54tVr8ZfXhdLlcLq8vP5x+P374e2l1eTz//b5Z3/9+d38y8b9+e7j/c/Vwd1oR+j83p3+8uX/4c3X/u/Pfl1/fvr7+8uH+f//04e9/vL7/7b/++vff//H6w8cf3//4/cvfH66+XNx/Yn7/9t0//nj8/t/m9/e/Pjz85R9//vN//eE/Hh/+9v/cfbh+e3z37vHdh8vV4uPhy9t//Pnl//371d3t8vW//nH1/p+//z//Y3X/m3/z9cPdQ7N5mG0fX/1++eHm+H+N/h+3t194+8Vsvlzdf9h+uFnc//7fV1fr8+PD7Yf1avYvj6/+/IfjB//X3f+/H74vbh9Xqz/ev5stP68uHlbr+5X29d273x0P79bzx1f8g+4/oJ7+/f5kPft+dZq4nC8/sJ3z2Z++HhbHx4f14/L7/X9tF3P38N93d79/efz+/o+rt6f756t3l5e3m+t3b/84Hn9//e2/H++u3l0dvz+eXvBfH//h9p/P57e//2Z1eXw/W5ze//WPi9v74/3j3dW7+w+Pj1f3//S3x7/+l6u372fzx8vlx9fL32Zfb+5efZ/ffXj728uHp/P/v/239e3b+c3t+29fD9d3X//z7/f3m/nN3cXq9N9/P1stFqvl6cfb219/e725f/v2w18O599v//Gby+u7+w+H9cfj1QG/fbu6+3vB//41/q+Pj28/Xf24mN+82wLz4S83b16t5l/v3o+9zP71b4frB//k6/3tw9XbV9ezxU2b9s0H7+hNdvgP8+93Xz/e/N/z/w/uFz/XvJjNn06/P17+4ZqL8vP/9Xn97cPrN/d316fbq4ef9y9+m82+H5f/b1b9l6fT7+8u3t3+sfrw4b/fXZ1Or96+/7Zav3/7H+9+f3d2427a1erfFv8024J396/m1/9y9Y8r/rZ/rD6eLv+O426z1fzq9/n18Xb+9e7/Wn04nP82+3j12/XN4/H+arH+fP367eH2dHN1d/2Xx8vjdvB+/+3q/uvv73/Ztq+8ubk//711+NPh05v1eja7/X/X+E/2d3/7+m6z582XN7e3x6cPM//4Bv5+Bf/f6vFw82P2r//4r//4T7P/+k8m27//k8n27/9ksv37P5ls//5PJts///qPq//84+o///j9//Hnn7//x5///vO/H19eX/y8/OP4ePW/AIfXf8E=";
    await page.evaluate(`window.localStorage.setItem('saveGame', '${save_str}')`);
    await page.evaluate("window.localStorage.setItem('skippedTutorial', 'true');");
    await page.evaluate("window.localStorage.setItem('theme', 'classic');");
    await page.reload();
    await page.waitForTimeout(2000);

    // Evaluate #commandDeck which wraps #menu
    const cdCssText = await page.evaluate(() => {
        const commandDeck = document.getElementById('commandDeck');
        return commandDeck ? commandDeck.style.cssText : "not found";
    });

    const cdComputed = await page.evaluate(() => {
        const commandDeck = document.getElementById('commandDeck');
        return commandDeck ? {
            display: window.getComputedStyle(commandDeck).display,
            maxHeight: window.getComputedStyle(commandDeck).maxHeight,
            overflowY: window.getComputedStyle(commandDeck).overflowY,
            gridTemplateColumns: window.getComputedStyle(commandDeck).gridTemplateColumns
        } : "not found";
    });

    // Check bounding box
    const cmdBox = await page.evaluate(() => {
        const el = document.getElementById('commandDeck');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { height: rect.height, bottom: rect.bottom };
    });

    const mainBox = await page.evaluate(() => {
        const el = document.querySelector('main');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { top: rect.top };
    });

    console.log(`commandDeck css text: ${cdCssText}`);
    console.log(`commandDeck computed: ${JSON.stringify(cdComputed)}`);
    console.log(`commandDeck height: ${cmdBox.height}`);
    console.log(`commandDeck bottom: ${cmdBox.bottom}`);
    console.log(`main top: ${mainBox.top}`);

    await browser.close();
}
main();
