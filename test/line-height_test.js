// Load in test dependencies
var lineHeight = require('../lib/line-height.js'),
    assert = require('proclaim'),
    domify = require('domify'),
    cssControls = require('css-controls');

// TODO: Review all tests and make sure they have clear intent. If not, comment.

// Create common fixture actions
function fixtureNode() {
  before(function () {
    var node = domify(this.html);
    document.body.appendChild(node);
    this.node = node;
  });
  after(function () {
    document.body.removeChild(this.node);
  });
}

function processNode() {
  before(function () {
    this.lineHeight = lineHeight(this.node);
  });

  it('has a line-height which is a number', function () {
    assert.strictEqual(typeof this.lineHeight, 'number');
    assert.notEqual(isNaN(this.lineHeight), true);
  });
}

function styleBody(css) {
  before(function () {
    document.body.style.cssText = css;
  });
  after(function () {
    document.body.style.cssText = '';
  });
}

var styleSheet = cssControls.createStyleSheet();
function globalStyle(selector, rule) {
  var index;
  before(function () {
    index = cssControls.addRule(styleSheet, selector, rule);
  });
  after(function () {
    cssControls.removeRule(styleSheet, index);
  });
}

// Basic tests
var _defaultLnHeight;
describe('An unstyled div', function () {
  before(function () {
    this.html = '<div>abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    before(function () {
      // Save the line height for other tests
      _defaultLnHeight = this.lineHeight;
    });

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });
  });
});

describe('A line-height styled div', function () {
  before(function () {
    this.html = '<div style="line-height: 50px;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has the styled line-height\'s height', function () {
      assert.strictEqual(this.lineHeight, 50);
    });
  });
});

// DEV: Tests and disproves that an element has a constant ratio for its font-size
describe('A font-size styled div', function () {
  before(function () {
    this.html = '<div style="font-size: 50px;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has the styled line-height\'s height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });

    it('has a line-height greater than the its font-size', function () {
      var lnHeight = this.lineHeight;
      assert.ok(lnHeight > 50, 'Expected: > 50, Actual: ' + lnHeight);
    });
  });
});

// Intermediate tests
describe('A percentage line-height div', function () {
  before(function () {
    this.html = '<div style="line-height: 150%;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });

    it('has a line-height greater than the default', function () {
      var lnHeight = this.lineHeight;
      assert.ok(lnHeight > _defaultLnHeight, 'Expected: > ' + _defaultLnHeight + ' (default), Actual: ' + lnHeight);
    });
  });
});

describe('An em based line-height div', function () {
  before(function () {
    this.html = '<div style="line-height: 1.3em;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    // it('has a line-height very close to its height', function () {
    //   var height = this.node.offsetHeight,
    //       lnHeight = this.lineHeight,
    //       withinBounds = Math.abs(lnHeight - height) <= 1;
    //   assert.strictEqual(withinBounds, true, 'Expected: ' + lnHeight + ', Actual: ' + height);
    // });
    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });
  });
});

describe('A numeric line-height div', function () {
  before(function () {
    this.html = '<div style="line-height: 2.3;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });
  });
});

// Verify ancestor -> descendant works on global styling to node level
describe('An inherit line-height div', function () {
  before(function () {
    this.html = '<div style="line-height: inherit;">abc</div>';
  });
  styleBody('line-height: 40px;');
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to the inherited amount', function () {
      assert.strictEqual(this.lineHeight, 40);
    });
  });
});

// Verify ancestor -> descendant works on node to node level
describe('A child in a styled div', function () {
  before(function () {
    this.html = '<div style="line-height: 50px;"><div id="child">abc</div></div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    before(function () {
      var childNode = document.getElementById('child');
      this.lineHeight = lineHeight(childNode);
    });

    it('has a line-height equal to the parent\'s line-height', function () {
      assert.strictEqual(this.lineHeight, 50);
    });
  });
});

// Advanced tests
// Verify more global styling inheritance
describe('A globally styled body and an unstyled div', function () {
  before(function () {
    this.html = '<div>abc</div>';
  });
  styleBody('font-size: 40px;');
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });

    it('has a line-height greater than the body\'s font-size', function () {
      var lnHeight = this.lineHeight;
      assert.ok(lnHeight > 40, 'Expected: > 40, Actual: ' + lnHeight);
    });
  });
});

// Kitchen sink tests
// Testing a specific unit type explicitly
// TODO: Test *every* unit type
describe('A pt line-height div', function () {
  before(function () {
    this.html = '<div style="line-height: 27pt;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });
  });
});

// Verify there is no bleeding between
describe('An em line-height with a pt font div', function () {
  before(function () {
    this.html = '<div style="line-height: 2.5em; font-size: 33pt;">abc</div>';
  });
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
    });
  });
});

// Verify we return a line-height specific for a the tag type (e.g. h2 over div)
describe('A div-specific font-size style and an h2', function () {
  before(function () {
    this.html = '<h2>abc</h2>';
  });
  globalStyle('div', 'font-size: 60px;');
  fixtureNode();

  describe('processed by line-height', function () {
    processNode();

    it('has a line-height equal to its height', function () {
      var height = this.node.offsetHeight;
      assert.strictEqual(this.lineHeight, height);
      assert.notEqual(this.lineHeight, 60);
    });
  });
});
