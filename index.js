#! /usr/bin/env node

var request = require('request')
var Table = require('cli-table')
const chalk = require('chalk')
var numeral = require('numeral')
var args = require('minimist')(process.argv.slice(2))
var baseurl = 'https://api.coinmarketcap.com/v1/ticker/'
var globalurl = 'https://api.coinmarketcap.com/v1/global/'
const log = console.log
var ticker = args.t
var lim = args.l
var limit = 0
var url = setUrl(ticker, lim)

if (ticker==undefined) {
  globalData(function(statusCode, error) {
    if (statusCode = 200) {
      tickerData();
    } else {
      log('Error:' + error)
    }
  })
} else {
  tickerData()
}

function globalData(callback) {

  request({
      url: globalurl,
      json: true
  }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        log(' ')
        var data = body
        var totalMarketCap = data.total_market_cap_usd
        var total24hVolume = data.total_24h_volume_usd
        var btcPercentage = data.bitcoin_percentage_of_market_cap
        var activeCurrencies = data.active_currencies
        var activeAssets = data.active_assets
        var activeMarkets = data.active_markets

        var totalMarketCapFormatted = 'Total market cap: ' + chalk.blueBright(formatNumeral(totalMarketCap))
        var total24hVolumeFormatted = 'Total 24h Volume: ' + chalk.blueBright(formatNumeral(total24hVolume))
        var btcPercentageFormatted = 'BTC Percentage: ' + chalk.blueBright(btcPercentage + '%')
        var activeCurrenciesFormatted = 'Active Currencies: ' + chalk.blueBright(activeCurrencies)
        var activeAssetsFormatteed = 'Active Assets: ' + chalk.blueBright(activeAssets)
        var activeMarketsFormatted = 'Active Markets: ' + chalk.blueBright(activeMarkets)

        var table = new Table({
          chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                 , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                 , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                 , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
        })
        table.push(
          [totalMarketCapFormatted, total24hVolumeFormatted, btcPercentageFormatted],
          [activeCurrenciesFormatted, activeAssetsFormatteed, activeMarketsFormatted]
        )
        log(table.toString())
        callback(response.statusCode, error)

      } else {
        log(error)
      }
    })
}

function tickerData() {
  request({
      url: url,
      json: true
  }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
  		log(' ')

      var table = new Table({
          head: [' Rank', 'Sym', 'Usd', 'Btc', 'Hour', 'Day', 'Week', 'Marketcap', 'Volume', 'Name', 'Available','Total', 'Max']
        , colWidths: [8, 8, 10, 13, 10, 10, 10, 15, 12, 20, 11, 11, 11]
        , colAligns: ['right', 'left', 'right', 'left', 'right', 'right', 'right', 'right', 'right', 'left', 'right', 'right', 'right']
        , style : {compact : true, 'padding-left' : 1, head: ['yellow']}
      })

  		for (var i = 0; i < limit; i++) {
        var data = body[i]
        var name = data.name
      	var rank =  data.rank
        var sym = data.symbol
        var usd = decimals(data.price_usd, 2)
        var btc = decimals(data.price_btc, 8)
        var hour = decimals(data.percent_change_1h, 2)
        var day = decimals(data.percent_change_24h, 2)
        var week = decimals(data.percent_change_7d, 2)
        var marketcap = formatNumeral(data.market_cap_usd)
        var volume = formatNumeral(data['24h_volume_usd'])
        var availableSupply = formatNumeralUnits(data.available_supply)
        var totalSupply = formatNumeralUnits(data.total_supply)
        var maxSupply = formatNumeralUnits(data.max_supply)
        var tableData = [rank, sym, usd, btc, colorByPercent(hour), colorByPercent(day), colorByPercent(week),
          colorByNumeral(marketcap), colorByNumeral(volume), name, colorByNumeral(availableSupply), colorByNumeral(totalSupply), colorByNumeral(maxSupply)]
        var fixedData = replaceNull(tableData)
        table.push(fixedData)
  		}
      log(table.toString())
      log(' ')
      } else {
  		log(error)
  	}
  })
}

function replaceNull(tableData) {

  for (var i = 0; i < tableData.length; i++) {
    if (tableData[i] == null) {
      tableData[i] = "N/A"
    }
  }
return tableData
}

function colorByPercent(number){

  if (Number(number)>0) {
    return chalk.greenBright(number + '%')
  } else if (Number(number)<0) {
    return chalk.redBright(number + '%')
  }
}

function colorByNumeral(number) {

  if (number.slice(-1) == 'b') {
    return chalk.blueBright(number)
  } else {
    return chalk.magenta(number)
  }
}


function decimals(value, number){
  return Number(value).toFixed(number)
}

function setUrl(ticker, lim) {
  if (ticker) {
    limit=1
    return baseurl + '/' + ticker
  } else if (lim) {
    limit = lim
    return baseurl + '?limit='+ lim.toString()
  }
  limit = 10
  return baseurl + '?limit='+ limit.toString()
}

function formatNumeral(number){
  var string = numeral(number);
  return string.format('($0.00 a)')
}

function formatNumeralUnits(number){

  if (number == null) {
    return "-----"
  }
  var string = numeral(number);
  return string.format('(0.0 a)')
}
