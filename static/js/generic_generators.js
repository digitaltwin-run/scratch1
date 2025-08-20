'use strict';

// --- YAML Generator ---
Blockly.YAML = new Blockly.Generator('YAML');

Blockly.YAML.INDENT = '  ';

Blockly.YAML.workspaceToCode = function(workspace) {
  const code = Blockly.Generator.prototype.workspaceToCode.call(this, workspace);
  return code.trim() ? code : '# Empty YAML file';
};

Blockly.YAML.scrub_ = function(block, code) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if (nextBlock) {
    nextCode = '\n' + Blockly.YAML.blockToCode(nextBlock);
  }
  return code + nextCode;
};

Blockly.YAML['dict_create_with'] = function(block) {
  let code = '';
  for (let i = 0; i < block.itemCount_; i++) {
    const pairCode = Blockly.YAML.valueToCode(block, 'PAIR' + i, Blockly.YAML.ORDER_NONE) || '';
    if (pairCode) {
      code += pairCode + '\n';
    }
  }
  return code.trim();
};

Blockly.YAML['key_value_pair'] = function(block) {
  const key = Blockly.YAML.valueToCode(block, 'KEY', Blockly.YAML.ORDER_ATOMIC) || '""';
  let value = Blockly.YAML.valueToCode(block, 'VALUE', Blockly.YAML.ORDER_ATOMIC) || '""';

  // If value is a structure, indent it
  if (value.includes('\n')) {
    value = '\n' + Blockly.YAML.prefixLines(value, Blockly.YAML.INDENT);
  }

  return `${key.replace(/'/g, '')}: ${value}`;
};

Blockly.YAML['list_create_with'] = function(block) {
  let code = '';
  for (let i = 0; i < block.itemCount_; i++) {
    let item = Blockly.YAML.valueToCode(block, 'ADD' + i, Blockly.YAML.ORDER_NONE) || '""';
    // Handle nested structures
    if (item.includes('\n')) {
        item = '\n' + Blockly.YAML.prefixLines(item, Blockly.YAML.INDENT).trim();
        code += `- ${item}\n`;
    } else {
        code += `- ${item}\n`;
    }
  }
  return code.trim();
};

Blockly.YAML['text'] = function(block) {
  return [block.getFieldValue('TEXT'), Blockly.YAML.ORDER_ATOMIC];
};

Blockly.YAML['math_number'] = function(block) {
  return [String(Number(block.getFieldValue('NUM'))), Blockly.YAML.ORDER_ATOMIC];
};

Blockly.YAML['logic_boolean'] = function(block) {
  return [block.getFieldValue('BOOL').toLowerCase(), Blockly.YAML.ORDER_ATOMIC];
};


// --- XML Generator ---
Blockly.XML = new Blockly.Generator('XML');

Blockly.XML.workspaceToCode = function(workspace) {
  const code = Blockly.Generator.prototype.workspaceToCode.call(this, workspace);
  return code.trim() ? code : '<!-- Empty XML file -->';
};

Blockly.XML.scrub_ = Blockly.YAML.scrub_;

Blockly.XML['xml_tag'] = function(block) {
  const tagName = block.getFieldValue('TAG_NAME') || 'tag';
  const attributes = Blockly.XML.statementToCode(block, 'ATTRIBUTES');
  const children = Blockly.XML.statementToCode(block, 'CHILDREN');
  
  let code = `<${tagName}`;
  if (attributes) {
    code += ' ' + attributes.trim().replace(/\n/g, ' ');
  }
  
  if (children) {
    code += `>\n${Blockly.XML.prefixLines(children, Blockly.XML.INDENT)}</${tagName}>`;
  } else {
    code += '/>';
  }
  return code;
};

Blockly.XML['xml_attribute'] = function(block) {
  const attrName = block.getFieldValue('ATTR_NAME') || 'attribute';
  const attrValue = Blockly.XML.valueToCode(block, 'VALUE', Blockly.XML.ORDER_ATOMIC) || '""';
  return `${attrName}=${attrValue}`;
};

// Primitives for XML are same as YAML but with different order constants
Blockly.XML['text'] = function(block) {
  return ["'" + block.getFieldValue('TEXT') + "'", Blockly.XML.ORDER_ATOMIC];
};
Blockly.XML['math_number'] = Blockly.YAML['math_number'];
Blockly.XML['logic_boolean'] = Blockly.YAML['logic_boolean'];
