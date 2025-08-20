'use strict';

// --- Color Definitions ---
Blockly.Msg["%_STRUCTURE"] = '#4a6cd4';
Blockly.Msg["%_PRIMITIVES"] = '#5ba55b';
Blockly.Msg["%_XML"] = '#d9a341';

// --- Generic Structure Blocks (for YAML, JSON, etc.) ---

Blockly.Blocks['dict_create_with'] = {
  init: function() {
    this.setHelpUrl('');
    this.setColour(Blockly.Msg["%_STRUCTURE"]);
    this.appendValueInput('PAIR0')
        .setCheck('KeyValuePair')
        .appendField('dictionary');
    this.setOutput(true, 'Dictionary');
    this.setMutator(new Blockly.Mutator(['dict_create_with_item']));
    this.itemCount_ = 1;
    this.setTooltip('Creates a dictionary with key-value pairs.');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('dict_create_with_item');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('dict_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    var itemBlock = containerBlock.nextConnection.targetBlock();
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput('PAIR' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'PAIR' + i);
    }
  },
  updateShape_: function() {
    // Add or remove value inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('PAIR' + i)) {
        this.appendValueInput('PAIR' + i)
            .setCheck('KeyValuePair');
      }
    }
    // Remove trailing inputs.
    while (this.getInput('PAIR' + i)) {
      this.removeInput('PAIR' + i);
      i++;
    }
  }
};

Blockly.Blocks['dict_create_with_item'] = {
  init: function() {
    this.setColour(Blockly.Msg["%_STRUCTURE"]);
    this.appendDummyInput().appendField('pair');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.contextMenu = false;
  }
};

Blockly.Blocks['key_value_pair'] = {
  init: function() {
    this.setColour(Blockly.Msg["%_STRUCTURE"]);
    this.appendValueInput('KEY')
        .setCheck('String')
        .appendField('key');
    this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('value');
    this.setPreviousStatement(true, 'KeyValuePair');
    this.setNextStatement(true, 'KeyValuePair');
    this.setTooltip('A key-value pair for a dictionary.');
  }
};

Blockly.Blocks['list_create_with'] = {
  init: function() {
    this.setHelpUrl('');
    this.setColour(Blockly.Msg["%_STRUCTURE"]);
    this.appendValueInput('ADD0')
        .appendField('list');
    this.setOutput(true, 'Array');
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    this.itemCount_ = 1;
    this.setTooltip('Creates a list with any number of items.');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('lists_create_with_item');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('lists_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    var itemBlock = containerBlock.nextConnection.targetBlock();
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    for (var i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
  },
  updateShape_: function() {
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        this.appendValueInput('ADD' + i);
      }
    }
    while (this.getInput('ADD' + i)) {
      this.removeInput('ADD' + i);
      i++;
    }
  }
};

Blockly.Blocks['lists_create_with_item'] = {
  init: function() {
    this.setColour(Blockly.Msg["%_STRUCTURE"]);
    this.appendDummyInput().appendField('item');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.contextMenu = false;
  }
};

// --- XML/HTML Blocks ---

Blockly.Blocks['xml_tag'] = {
  init: function() {
    this.setColour(Blockly.Msg["%_XML"]);
    this.appendDummyInput()
        .appendField('<')
        .appendField(new Blockly.FieldTextInput('tag'), 'TAG_NAME')
        .appendField('>');
    this.appendStatementInput('ATTRIBUTES')
        .setCheck('XmlAttribute')
        .appendField('attributes');
    this.appendStatementInput('CHILDREN')
        .appendField('children');
    this.appendDummyInput()
        .appendField('</')
        .appendField(new Blockly.FieldLabel(this.getFieldValue('TAG_NAME')), 'TAG_NAME_CLOSING')
        .appendField('>');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Creates an XML/HTML tag.');
    // Update closing tag name when opening tag changes
    this.setOnChange(function(event) {
      if (event.blockId === this.id && event.name === 'TAG_NAME') {
        this.setFieldValue(event.newValue, 'TAG_NAME_CLOSING');
      }
    });
  }
};

Blockly.Blocks['xml_attribute'] = {
  init: function() {
    this.setColour(Blockly.Msg["%_XML"]);
    this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField(new Blockly.FieldTextInput('attr'), 'ATTR_NAME')
        .appendField('=');
    this.setPreviousStatement(true, 'XmlAttribute');
    this.setNextStatement(true, 'XmlAttribute');
    this.setTooltip('An attribute for an XML/HTML tag.');
  }
};
