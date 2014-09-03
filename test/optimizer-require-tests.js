'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');
var util = require('./util');
var outputDir = nodePath.join(__dirname, 'build');

require('app-module-path').addPath(nodePath.join(__dirname, 'src'));

describe('raptor-optimizer-require' , function() {

    beforeEach(function(done) {

        util.rmdirRecursive(outputDir);

        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }

        require('raptor-promises').enableLongStacks();

        require('raptor-logging').configureLoggers({
            // 'raptor-cache': 'WARN',
            // 'raptor-optimizer/lib/page-bundles-builder': 'WARN',
            // 'raptor-optimizer/perf': 'WARN'
            // 'raptor-optimizer': 'DEBUG'
        });

        done();
    });

    it('should allow for custom require extensions', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                bundlingEnabled: false,
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                }
            }, __dirname, __filename);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: ./test-project/test.rhtml'
                ],
                from: module,
                basePath: __dirname
            })
            .then(function(optimizedPage) {
                expect(writerTracker.getOutputFilenames()).to.deep.equal([
                    'raptor-modules-client.js',
                    'test.rhtml.js'
                ]);

                // var expected = '.test-1 {background-image: url(ebay-logo.png);}\n.test-2 {background-image: url(ebay-logo.png);}\n.test-3 {background-image: url(ebay-logo.png);}\n.test-4 {background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAeCAYAAABt5kPUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNzdGMTE3NDA3MjA2ODExODhDNkIzODA1MTg5Nzc0NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRTg2MEMyMzZFNzIxMUUyQjZGMEE2ODM0MDRENkNFNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRTg2MEMyMjZFNzIxMUUyQjZGMEE2ODM0MDRENkNFNiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAyODAxMTc0MDcyMDY4MTE5OTRDOTI2RkUxMEEyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY3N0YxMTc0MDcyMDY4MTE4OEM2QjM4MDUxODk3NzQ2Ii8+IDwvcmRmOkRlc2NyaXB0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);}';
                // var actual = writerTracker.getCodeForFilename('test.rhtml.js');
                // console.log(actual);
                // expect(actual).to.equal(expected);

            })
            .then(done)
            .fail(done);
    });

    it('should allow for require.resolve', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                bundlingEnabled: false,
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                }
            }, __dirname, __filename);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: ./test-project/test.js'
                ],
                from: module,
                basePath: __dirname
            })
            .then(function(optimizedPage) {
                expect(writerTracker.getOutputFilenames()).to.deep.equal([
                    'raptor-modules-client.js',
                    'test.js',
                    'test.rhtml.js'
                ]);

                // var expected = '.test-1 {background-image: url(ebay-logo.png);}\n.test-2 {background-image: url(ebay-logo.png);}\n.test-3 {background-image: url(ebay-logo.png);}\n.test-4 {background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAeCAYAAABt5kPUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNzdGMTE3NDA3MjA2ODExODhDNkIzODA1MTg5Nzc0NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRTg2MEMyMzZFNzIxMUUyQjZGMEE2ODM0MDRENkNFNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRTg2MEMyMjZFNzIxMUUyQjZGMEE2ODM0MDRENkNFNiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAyODAxMTc0MDcyMDY4MTE5OTRDOTI2RkUxMEEyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY3N0YxMTc0MDcyMDY4MTE4OEM2QjM4MDUxODk3NzQ2Ii8+IDwvcmRmOkRlc2NyaXB0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);}';
                // var actual = writerTracker.getCodeForFilename('test.rhtml.js');
                // console.log(actual);
                // expect(actual).to.equal(expected);

            })
            .then(done)
            .fail(done);
    });

    it('should handle require for modules with dependencies', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                enabledExtensions: ['jquery', 'browser'],
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                },
                require: {
                    includeClient: false,
                    rootDir: nodePath.join(__dirname, 'test-project')
                }
            }, __dirname, __filename);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    { 'require': 'foo' },
                    { 'require': 'bar' }],
                from: nodePath.join(__dirname, 'test-project/index.js')
            })
            .then(function(optimizedPage) {
                // console.log('writer: ', writer);
                expect(writerTracker.getOutputPaths()).to.deep.equal([
                        nodePath.join(__dirname, 'build/testPage.js')
                    ]);

                // console.log(writerTracker.getCodeForFilename('testPage.js'));

                var actual = writerTracker.getCodeForFilename('testPage.js');
                fs.writeFileSync(nodePath.join(__dirname, 'resources/foo-bar-bundle.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/foo-bar-bundle.expected.js'), {encoding: 'utf8'}));
                done();
            })
            .fail(done);
    });

    it('should bundle require dependencies correctly', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                enabledExtensions: ['jquery', 'browser'],
                require: {
                    rootDir: nodePath.join(__dirname, 'test-project')
                },
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                },
                bundles: [
                    {
                        name: 'core',
                        dependencies: [
                            'raptor-modules/client'
                        ]
                    },
                    {
                        name: 'jquery',
                        dependencies: [
                            'require: jquery'
                        ]
                    }
                ]
            }, nodePath.join(__dirname, 'test-project'));

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: jquery',
                    'require: foo'
                ],
                from: nodePath.join(__dirname, 'test-project')
            })
            .then(function(optimizedPage) {
                expect(writerTracker.getOutputPaths()).to.deep.equal([
                        nodePath.join(__dirname, 'build/core.js'),
                        nodePath.join(__dirname, 'build/jquery.js'),
                        nodePath.join(__dirname, 'build/testPage.js')
                    ]);
                done();
            })
            .fail(done);
    });

    it('should allow for browserify-style transforms', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                },
                require: {
                    includeClient: false,
                    transforms: [
                        'deamdify'
                    ],
                    rootDir: nodePath.join(__dirname, 'test-project')
                }
            }, nodePath.join(__dirname, 'test-project'));

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require ./amd-module'
                ],
                from: nodePath.join(__dirname, 'test-project')
            })
            .then(function(optimizedPage) {

                var actual = writerTracker.getCodeForFilename('testPage.js');

                fs.writeFileSync(nodePath.join(__dirname, 'resources/amd-module.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/amd-module.expected.js'), {encoding: 'utf8'}));
                done();
            })
            .fail(done);
    });

    it('should allow for modules to be mapped to globals', function(done) {
        var optimizer = require('../');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false
                },
                require: {
                    includeClient: false,
                    transforms: [],
                    rootDir: nodePath.join(__dirname, 'test-project')
                }
            }, nodePath.join(__dirname, 'test-project'));

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: jquery'
                ],
                from: nodePath.join(__dirname, 'test-project')
            },
            function(e, optimizedPage) {
                if (e) {
                    return done(e);
                }

                var actual = writerTracker.getCodeForFilename('testPage.js');
                fs.writeFileSync(nodePath.join(__dirname, 'resources/jquery-global.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/jquery-global.expected.js'), {encoding: 'utf8'}));
                done();
            });
    });

    it('should allow for same commonjs-def in different async package with bundling enabled', function(done) {
        var optimizer = require('../');

        var projectDir = nodePath.join(__dirname, 'test-async-project');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false,
                },
                require: {
                    includeClient: false,
                    transforms: [],
                    rootDir: projectDir
                },
                bundlingEnabled: true,

                bundles: [
                    {
                        name: 'loader-metadata',
                        dependencies: [
                            {'type': 'loader-metadata'}
                        ]
                    },
                    {
                        name: 'main',
                        dependencies: [
                            'require: ./index.js'
                        ]
                    },
                    {
                        name: 'async1',
                        dependencies: [
                            'require: ./async1'
                        ]
                    },
                    {
                        name: 'async2',
                        dependencies: [
                            'require: ./async2/async2-module.js'
                        ]
                    }
                ]
            }, projectDir);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: raptor-loader',
                    './optimizer.json'
                ],
                from: projectDir
            },
            function(e, optimizedPage) {
                if (e) {
                    return done(e);
                }

                var actual = writerTracker.getCodeForFilename('loader-metadata.js');

                fs.writeFileSync(nodePath.join(__dirname, 'resources/loader-metadata.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/loader-metadata.expected.js'), {encoding: 'utf8'}));
                done();
            });
    });

    it('should allow for same commonjs-def in different async package without bundling enabled', function(done) {
        var optimizer = require('../');

        var projectDir = nodePath.join(__dirname, 'test-async-project');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false,
                },
                require: {
                    includeClient: false,
                    transforms: [],
                    rootDir: projectDir
                },
                bundlingEnabled: false
            }, projectDir);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require: raptor-loader',
                    './optimizer.json'
                ],
                from: projectDir
            },
            function(e, optimizedPage) {
                if (e) {
                    return done(e);
                }

                var actual = writerTracker.getCodeForFilename('loader-metadata-.js');

                fs.writeFileSync(nodePath.join(__dirname, 'resources/loader-metadata-no-bundles.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/loader-metadata-no-bundles.expected.js'), {encoding: 'utf8'}));
                done();
            });
    });

    it('should allow for requiring json files', function(done) {
        var optimizer = require('../');

        var projectDir = nodePath.join(__dirname, 'test-project');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false,
                },
                require: {
                    includeClient: false,
                    transforms: [],
                    rootDir: projectDir
                },
                bundlingEnabled: true
            }, projectDir);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                'require: ./test.json'
                ],
                from: projectDir
            },
            function(e, optimizedPage) {
                if (e) {
                    return done(e);
                }

                var actual = writerTracker.getCodeForFilename('testPage.js');

                fs.writeFileSync(nodePath.join(__dirname, 'resources/require-json.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/require-json.expected.js'), {encoding: 'utf8'}));
                done();
            });
    });

    it('should allow for running required modules', function(done) {
        var optimizer = require('../');

        var projectDir = nodePath.join(__dirname, 'test-project');

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    outputDir: outputDir,
                    fingerprintsEnabled: false,
                },
                require: {
                    includeClient: false,
                    transforms: [],
                    rootDir: projectDir
                },
                bundlingEnabled: true
            }, projectDir);

        var writerTracker = require('./WriterTracker').create(pageOptimizer.writer);

        pageOptimizer.optimizePage({
                pageName: 'testPage',
                dependencies: [
                    'require-run'
                ],
                from: projectDir
            },
            function(e, optimizedPage) {
                if (e) {
                    return done(e);
                }

                var actual = writerTracker.getCodeForFilename('testPage.js');

                fs.writeFileSync(nodePath.join(__dirname, 'resources/require-run.actual.js'), actual, {encoding: 'utf8'});
                expect(actual).to.equal(
                    fs.readFileSync(nodePath.join(__dirname, 'resources/require-run.expected.js'), {encoding: 'utf8'}));
                done();
            });
    });
});
