// tests/setup.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const vm = require('vm'); // Import the vm module

// Create a JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    runScripts: 'dangerously',
    resources: 'usable'
});

// Assign JSDOM globals to Node's global object
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Create a context for the vm module from the JSDOM window object
const context = vm.createContext(dom.window);

// Helper to read file content
const readFile = (filePath) => {
    return fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
};

// Read the scripts
const blocklyScript = readFile('../vendor/blocks_compressed.js');
const customBlocksScript = readFile('../static/js/generic_blocks.js');
const customGeneratorsScript = readFile('../static/js/generic_generators.js');

// Execute scripts directly in the created context
vm.runInContext(blocklyScript, context);
vm.runInContext(customBlocksScript, context);
vm.runInContext(customGeneratorsScript, context);

// Expose Blockly to the global scope so tests can access it
global.Blockly = dom.window.Blockly;
