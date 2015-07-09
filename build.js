'use strict';

var fs = require('fs');
var path = require('path');
var join = path.join;
var babel = require('babel-core');
var ncp = require('ncp').ncp;

var source = __dirname;
var target = process.argv[2];

if ( !target ) {
    console.log('Usage: build.js output_path');
    process.exit();
}

copyFolder(source, target);

function copyFolder(source, target) {
    if ( fs.existsSync(target) && fs.readdirSync(target).length > 0 ) {
        console.error('Output path is not empty.');
        return;
    }
    
    ncp(
        source,
        target,
        { filter: function(p) {
            return path.basename(p) !== '.git';
        } },
        function (error) {
            if ( error ) {
                console.error(error);
            }
            else {
                compileSources(target);
            }
        }
    );
}

function compileSources(root) {
    compileFolder(join(root, 'source'));
    compileFolder(join(root, join('source', 'adventure')));
    compileFolder(join(root, 'tests'));
    
    console.log('Build complete');
}

function compileFolder(folder) {
    if ( !fs.existsSync(folder) ) {
        return;
    }
    
    var files = fs.readdirSync(folder);
    files.filter(function(filename) {
        var esPath = join(folder, filename);
        if ( path.extname(esPath) === '.es6' ) {
            var jsPath = join(folder, path.basename(esPath, '.es6') + '.js');
            var js = babel.transformFileSync(esPath).code;
            if ( fs.existsSync(jsPath) ) {
                console.error('Already exists: ' + jsPath);
            }
            else {
                fs.writeFileSync(jsPath, js);
            }
        }
    });
}
