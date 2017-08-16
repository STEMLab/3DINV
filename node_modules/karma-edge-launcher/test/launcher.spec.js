var di = require('di')
var osHomedir = require('os-homedir')
var proxyquire = require('proxyquire')

describe('launcher', function () {
  var EventEmitter, EdgeLauncher, injector, launcher, module

  beforeEach(function () {
    EventEmitter = require('../node_modules/karma/lib/events').EventEmitter
    EdgeLauncher = require('..')
    module = {
      baseBrowserDecorator: ['value', function () {}],
      emitter: ['value', new EventEmitter()],
      logger: [
        'value', {
          create: function () {
            return {
              error: function () {},
              debug: function () {}
            }
          }
        }
      ],
      args: ['value', []]
    }
  })

  afterEach(function () {
    injector = null
    launcher = null
  })

  describe('exports', function () {
    it('should export launcher:Edge', function (done) {
      expect(EdgeLauncher['launcher:Edge']).to.defined
      done()
    })
  })

  describe('initialization', function () {
    // These tests run from the home directory to ensure that the launcher is
    // initialized properly regardless of the working directory

    var previousdir

    before(function () {
      previousdir = process.cwd()
      process.chdir(osHomedir())
    })

    after(function () {
      process.chdir(previousdir)
    })

    beforeEach(function () {
      injector = new di.Injector([module, EdgeLauncher])
      launcher = injector.get('launcher:Edge')
    })

    it('should initialize name', function (done) {
      expect(launcher.name).to.equal('Edge')
      done()
    })

    it('should initialize ENV_CMD', function (done) {
      expect(launcher.ENV_CMD).to.equal('EDGE_BIN')
      done()
    })

    it('should initialize DEFAULT_CMD.win32', function (done) {
      expect(launcher.DEFAULT_CMD.win32).to.be.a.file()
      done()
    })
  })

  describe('_getOptions', function () {
    var getOptions

    beforeEach(function () {
      getOptions = function (url, module) {
        injector = new di.Injector([module, EdgeLauncher])
        launcher = injector.get('launcher:Edge')
        return launcher._getOptions(url)
      }
    })

    it('should return the given URL and a keepalive flag for launching Edge', function (done) {
      var options = getOptions('url', module)
      expect(options).to.deep.equal(['url', '-k'])
      done()
    })
  })

  describe('_onProcessExit', function () {
    var childProcessCmd, onProcessExit

    beforeEach(function () {
      onProcessExit = function () {
        var childProcessMock
        childProcessMock = {
          exec: function (cmd, cb) {
            childProcessCmd = cmd
            cb()
          }
        }

        EdgeLauncher = proxyquire('..', {
          child_process: childProcessMock
        })
        injector = new di.Injector([module, EdgeLauncher])
        launcher = injector.get('launcher:Edge')
        launcher._onProcessExit(1, 2)
      }
    })

    it('should call taskkill', function (done) {
      onProcessExit()
      expect(childProcessCmd).to.equal('taskkill /t /f /im MicrosoftEdge.exe')
      done()
    })
  })
})
