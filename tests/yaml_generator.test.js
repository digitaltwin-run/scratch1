/**
 * @jest-environment jsdom
 */

describe('YAML Generator', () => {
    let workspace;

    beforeEach(() => {
        // Create a headless workspace
        workspace = new Blockly.Workspace();
    });

    afterEach(() => {
        workspace.dispose();
    });

    test('should generate a comment for an empty workspace', () => {
        const code = Blockly.YAML.workspaceToCode(workspace);
        expect(code).toBe('# Empty YAML file');
    });

    test('should generate a simple key-value pair', () => {
        const block = workspace.newBlock('key_value_pair');
        // Set key
        const keyBlock = workspace.newBlock('text');
        keyBlock.setFieldValue('name', 'TEXT');
        block.getInput('KEY').connection.connect(keyBlock.outputConnection);
        // Set value
        const valueBlock = workspace.newBlock('text');
        valueBlock.setFieldValue('Alice', 'TEXT');
        block.getInput('VALUE').connection.connect(valueBlock.outputConnection);

        const code = Blockly.YAML.blockToCode(block);
        expect(code).toBe('name: Alice');
    });

    test('should generate a simple list', () => {
        const listBlock = workspace.newBlock('list_create_with');
        listBlock.itemCount_ = 2;
        listBlock.updateShape_();

        const item1 = workspace.newBlock('text');
        item1.setFieldValue('apple', 'TEXT');
        listBlock.getInput('ADD0').connection.connect(item1.outputConnection);

        const item2 = workspace.newBlock('text');
        item2.setFieldValue('banana', 'TEXT');
        listBlock.getInput('ADD1').connection.connect(item2.outputConnection);

        const code = Blockly.YAML.blockToCode(listBlock);
        expect(code).toBe('- apple\n- banana');
    });
});
