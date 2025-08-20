/**
 * @jest-environment jsdom
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('YAML Generator with Puppeteer', () => {
    let browser;
    let page;
    let workspace;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        const testPagePath = `file://${path.resolve(__dirname, './test.html')}`;
        await page.goto(testPagePath, { waitUntil: 'networkidle0' });
        workspace = await page.evaluate(() => new Blockly.Workspace());
    });

    beforeEach(async () => {
        await page.evaluate(() => workspace.clear());
    });

    afterEach(async () => {
        await page.evaluate(() => workspace.dispose());
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should generate a comment for an empty workspace', async () => {
        const code = await page.evaluate(() => {
            return Blockly.YAML.workspaceToCode(workspace);
        });
        expect(code).toBe('# Empty YAML file');
    });

    test('should generate a simple key-value pair', async () => {
        const code = await page.evaluate(() => {
            const block = workspace.newBlock('key_value_pair');
            const keyBlock = workspace.newBlock('text');
            keyBlock.setFieldValue('name', 'TEXT');
            block.getInput('KEY').connection.connect(keyBlock.outputConnection);
            const valueBlock = workspace.newBlock('text');
            valueBlock.setFieldValue('Alice', 'TEXT');
            block.getInput('VALUE').connection.connect(valueBlock.outputConnection);
            return Blockly.YAML.blockToCode(block);
        });
        expect(code).toBe('name: Alice');
    });

    test('should generate a simple list', async () => {
        const code = await page.evaluate(() => {
            const listBlock = workspace.newBlock('list_create_with');
            listBlock.itemCount_ = 2;
            listBlock.updateShape_();

            const item1 = workspace.newBlock('text');
            item1.setFieldValue('apple', 'TEXT');
            listBlock.getInput('ADD0').connection.connect(item1.outputConnection);

            const item2 = workspace.newBlock('text');
            item2.setFieldValue('banana', 'TEXT');
            listBlock.getInput('ADD1').connection.connect(item2.outputConnection);

            return Blockly.YAML.blockToCode(listBlock);
        });
        expect(code).toBe('- apple\n- banana');
    });
});
