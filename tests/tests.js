QUnit.module('Plugin Tests', {
    before: function() {
        this.$fixture = $('#qunit-fixture');
    },

    beforeEach: function() {
        this.$scrollDiv = $('<div>');
    }
});

QUnit.test('plugin function is defined', function(assert) {
    assert.ok(jQuery.fn.infiniteScrollHelper);
});

QUnit.test('plugin is defined on window', function(assert) {
    assert.ok(window.InfiniteScrollHelper)
});

QUnit.test('plugin can be destroyed', function(assert) {
    this.$scrollDiv.infiniteScrollHelper();
    this.$scrollDiv.infiniteScrollHelper('destroy');

    assert.equal(jQuery.data(this.$scrollDiv[0], 'plugin_infiniteScrollHelper'), null, 'plugin data is null');
});

QUnit.test('plugin triggers initial load callback', function(assert) {
    var done = assert.async();

    this.$scrollDiv.infiniteScrollHelper({
        triggerInitialLoad: true,
        loadMore: function(page) {
            assert.equal(page, 1, 'the page should equal 1');
            done();
        }
    });
});

QUnit.test('plugin provides correct page number on initial load', function(assert) {
    var done = assert.async();

    this.$scrollDiv.infiniteScrollHelper({
        triggerInitialLoad: true,
        startingPageCount: 2,
        loadMore: function(page) {
            assert.equal(page, 2, 'the page should equal 2');
            done();
        }
    })
});

QUnit.test('plugin increments page number correctly', function(assert) {
    var done = assert.async();

    var is = new InfiniteScrollHelper(this.$scrollDiv[0], {
        loadMore: function(page) {
            assert.equal(page, 2, 'the page should equal 2');
            done();
        }
    });

    is._beginLoadMore();
});

QUnit.test('plugin uses self as scroll container', function(assert) {
    this.$scrollDiv.css({
        'overflow-y': 'scroll'
    });

    this.$fixture.append(this.$scrollDiv);

    var is = new InfiniteScrollHelper(this.$scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], this.$scrollDiv[0], 'scroll container should be self');
});

QUnit.test('plugin uses parent scroll container when element is not scrollable', function(assert) {
    var $scrollDivParent = $('<div>').css('overflow-y', 'scroll');

    $scrollDivParent.append(this.$scrollDiv);

    this.$fixture.append($scrollDivParent);

    var is = new InfiniteScrollHelper(this.$scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], $scrollDivParent[0], 'scroll container should be parent');
});

QUnit.test('plugin uses window scroll container when element is not scrollable', function(assert) {
    this.$fixture.append(this.$scrollDiv);

    var is = new InfiniteScrollHelper(this.$scrollDiv[0]);

    assert.equal(is._getScrollContainer()[0], window, 'scroll container should be window');
});

QUnit.test('plugin uses provided scrollContainer', function(assert) {
    var scrollDiv = document.createElement('div');

    var is = new InfiniteScrollHelper(this.$scrollDiv[0], {
        scrollContainer: scrollDiv
    });

    assert.equal(is._getScrollContainer()[0], scrollDiv, 'scroll container is scrollDiv');
});

QUnit.test('plugin triggers loadMore callback at specified threshold', function(assert) {
    var done = assert.async();

    var containerHeight = 500,
        contentHeight = 800,
        bottomBuffer = 80,
        scrollTriggerDistance = contentHeight - containerHeight - bottomBuffer;

    this.$scrollDiv.css({
        height: containerHeight,
        width: 300,
        overflow: 'scroll',
    });

    this.$scrollDiv.append($('<div>').css({
        height: contentHeight,
        width: 200
    }));

    this.$scrollDiv.infiniteScrollHelper({
        bottomBuffer: bottomBuffer,
        loadMore: function() {
            assert.ok(true, 'loadMore callback was invoked');
            done();
        }
    });

    setTimeout(function() {
        this.$scrollDiv.scrollTop(scrollTriggerDistance);
    }.bind(this), 1000);

    this.$fixture.append(this.$scrollDiv);
});

QUnit.test('plugin adds loading class to correct element', function(assert) {
    var done = assert.async(),
        _this = this;

    this.$scrollDiv.infiniteScrollHelper({
        triggerInitialLoad: true,
        loadMore: function(page, doneLoading) {
            setTimeout(function () {
                assert.ok(_this.$scrollDiv.hasClass('loading'), 'scroll div has class loading');
                doneLoading();
                done();
            }, 500);
        }
    });

    this.$fixture.append(this.$scrollDiv);
});