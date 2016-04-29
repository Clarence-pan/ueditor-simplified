/**
 * 简化HTML的插件
 * @file
 * @since 1.2.6.1
 */
UE.plugin.register('simplify', function () {
    function simplify(root) {
        if (!root) {
            return;
        }

        root.setAttr('style', simplifyStyle(root.tagName, root.getAttr('style')));

        forEach(root.children, simplify);
    }

    function simplifyStyle(tagName, styles){
        if (!tagName || !styles){
            return null;
        }

        if (typeof(styles) == 'string'){
            styles = parseStyleToObject(styles);
        }

        var simplifiedStyles = [];

        forEach(styles, function(val, key){
            if (!isDefaultCssValue(tagName, key, val)){
                simplifiedStyles.push(key + ': ' + val);
            }
        });

        return simplifiedStyles.length ? simplifiedStyles.join('; ') : null;
    }

    function forEach(something, iter) {
        if (!something) {
            return;
        }

        for (var k in something) {
            if (something.hasOwnProperty(k)) {
                if (iter.call(something[k], something[k], k) === false) {
                    return false;
                }
            }
        }
    }

    function parseStyleToObject(str) {
        var obj = {}, styles = str.split(';');
        forEach(styles, function (v) {
            var index = v.indexOf(':'),
                key = UE.utils.trim(v.substr(0, index)).toLowerCase();
            key && (obj[key] = UE.utils.trim(v.substr(index + 1) || ''));
        });
        return obj;
    }

    /**
     * 判断是否是默认的CSS样式
     */
    function isDefaultCssValue(tag, key, value) {
        var defaultCssValues = UEDITOR_CONFIG.defaultCssValues;
        var found = false;

        forEach(defaultCssValues, function (keyPatternList, tagPattern) {
            if (doesPatternMatch(tagPattern, tag)) {
                return forEach(keyPatternList, function (valuePatternList, keyPattern) {
                    if (doesPatternMatch(keyPattern, key)) {
                        return forEach(valuePatternList, function (valuePattern) {
                            if (doesPatternMatch(valuePattern, value)) {
                                found = true;
                                return false;  // break
                            }
                        });
                    }
                });
            }
        });

        return found;
    }

    function doesPatternMatch(pattern, value) {
        if (pattern === '*') {
            return true;
        }

        value = (value + '').toLowerCase();
        if (pattern === value) {
            return true;
        }

        var reg = compilePatternToRegex(pattern);
        return reg && reg.test(value);
    }

    function compilePatternToRegex(pattern)
    {
        compilePatternToRegex.cache = compilePatternToRegex.cache || {};
        if (pattern in compilePatternToRegex.cache){
            return compilePatternToRegex.cache[pattern];
        }

        var reg = false;
        if (pattern.indexOf('*') >= 0 || pattern.indexOf('?') >= 0) {
            reg = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.?') + '$')
        }

        compilePatternToRegex.cache[pattern] = reg;

        return reg;
    }

    window.testPatterns = function(){
        function assert(condition){
            if (!condition || (condition.call && !condition.call())) {
                console.debug("Assertion failed: " + condition);
            }
        }

        assert(function(){
            return doesPatternMatch('rgb(255, 255, 255)', 'rgb(255, 255, 255)');
        });

        assert(function(){
            return doesPatternMatch('14px', '14px');
        });

        assert(function(){
            return isDefaultCssValue('div', 'background-color', 'rgb(255, 255, 255)');
        });
        assert(function(){
            return isDefaultCssValue('p', 'background-color', 'rgb(255, 255, 255)');
        });
        assert(function(){
            return isDefaultCssValue('span', 'background-color', 'rgb(255, 255, 255)');
        });
        assert(function(){
            return isDefaultCssValue('span', 'padding', '0');
        });
        assert(function(){
            return isDefaultCssValue('span', 'color', 'rgb(64, 64, 64)');
        });
    };



    return {
        bindEvents: {
            'ready': function () {
                console.debug("Simplify: ready");
            }
        },
        outputRule: function (root) {
            console.debug("Simplify: outputRule: %o", arguments);
            simplify(root);
        },
        inputRule: function (root) {
            console.debug("Simplify: inputRule: %o", arguments);
            simplify(root);
        }
    }
});
