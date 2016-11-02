QUnit.module('Plugin Tests');

QUnit.test('plugin function is defined', function(assert) {
    assert.ok(jQuery.fn.infiniteScrollHelper);
});

QUnit.test('plugin is defined on window', function(assert) {
    assert.ok(window.InfiniteScrollHelper)
});

QUnit.test('plugin can be destroyed', function(assert) {
    var $div = jQuery('<div>').infiniteScrollHelper();
    $div.infiniteScrollHelper('destroy');

    assert.equal(jQuery.data($div[0], 'plugin_infiniteScrollHelper'), null, 'plugin data is null');
});

QUnit.test('plugin triggers initial load callback', function(assert) {
    var done = assert.async();

    var $div = jQuery('<div>').infiniteScrollHelper({
        triggerInitialLoad: true,
        loadMore: function(page) {
            assert.equal(page, 1, 'the page should equal 1');
            done();
        }
    });
});

QUnit.test('plugin provides correct page number on initial load', function(assert) {
    var done = assert.async();

    var $div = $('<div>').infiniteScrollHelper({
        triggerInitialLoad: true,
        startingPageCount: 2,
        loadMore: function(page) {
            assert.equal(page, 2, 'the page should equal 2');
            done();
        }
    })
});

QUnit.test('plugin finds correct scroll container', function(assert) {
    var $fixture = $('#qunit-fixture'),
        $scrollDiv = $('<div>').css({
            'overflow-y': 'scroll'
        });

    $fixture.append($scrollDiv);

    var is = new InfiniteScrollHelper($scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], $scrollDiv[0], 'scroll container should be scroll div');
});

QUnit.test('plugin uses parent scroll container when element is not scrollable', function(assert) {
    var $fixture = $('#qunit-fixture'),
        $scrollDiv = $('<div>');

    $fixture.append($scrollDiv);

    var is = new InfiniteScrollHelper($scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], window, 'scroll container should be window');
});

QUnit.test('plugin uses window scroll container when element is not scrollable', function(assert) {
    var $fixture = $('#qunit-fixture'),
        $scrollDiv = $('<div>');

    $fixture.append($scrollDiv);

    var is = new InfiniteScrollHelper($scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], window, 'scroll container should be window');
});