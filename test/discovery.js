var bitcoinjs = require('bitcoinjs-lib')
var Chain = require('../src/chain')
var discovery = require('../src/discovery')
var test = require('tape')

var fixtures = require('./fixtures/discovery')

fixtures.valid.forEach(function (f) {
  var network = bitcoinjs.networks[f.network]
  var external = bitcoinjs.HDNode.fromBase58(f.external, network)
  var chain = new Chain(external, f.k)

  test('discovers until ' + f.expected.used + ' for ' + f.description + ' (GAP_LIMIT = ' + f.gapLimit + ')', function (t) {
    discovery(chain, f.gapLimit, function (addresses, callback) {
      return callback(undefined, addresses.map(function (address) {
        return !!f.used[address]
      }))
    }, function (err, used, checked) {
      t.ifErr(err, 'no error')
      t.equal(used, f.expected.used, 'used as expected')
      t.equal(checked, f.expected.checked, 'checked count as expected')

      var unused = checked - used
      for (var i = 1; i < unused; ++i) chain.pop()

      t.equal(chain.get(), f.expected.nextToUse, 'next address to use matches')
      t.end()
    })
  })
})
