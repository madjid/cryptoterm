#!/usr/bin/env node

var request = require('request')
var Table = require('cli-table')
const chalk = require('chalk')
var timestamp = require('unix-timestamp')
var numeral = require('numeral')
var args = require('minimist')(process.argv.slice(2))
var baseurl = 'https://api.coinmarketcap.com/v2/ticker/?convert=BTC&limit=3'
var globalurl = 'https://api.coinmarketcap.com/v2/global/'
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

        var data = body.data
        var totalMarketCap = data.quotes.USD.total_market_cap
        var total24hVolume = data.quotes.USD.total_volume_24h
        var btcPercentage = data.bitcoin_percentage_of_market_cap
        var activeCurrencies = data.active_cryptocurrencies
        var activeMarkets = data.active_markets
        var lastUpdated = data.last_updated

        var totalMarketCapFormatted = 'Total market cap: ' + chalk.blueBright(formatNumeral(totalMarketCap))
        var total24hVolumeFormatted = 'Total 24h Volume: ' + chalk.blueBright(formatNumeral(total24hVolume))
        var btcPercentageFormatted = 'BTC Percentage: ' + chalk.blueBright(btcPercentage + '%')
        var activeCurrenciesFormatted = 'Active Currencies: ' + chalk.blueBright(activeCurrencies)
        var activeMarketsFormatted = 'Active Markets: ' + chalk.blueBright(activeMarkets)
        var lastUpdatedFormatteed = 'Last Updated: ' + chalk.blueBright(timestamp.toDate(lastUpdated))

        var table = new Table({
          chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                 , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                 , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                 , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
        })
        table.push(
          [totalMarketCapFormatted, total24hVolumeFormatted, btcPercentageFormatted],
          [activeCurrenciesFormatted, activeMarketsFormatted, lastUpdatedFormatteed]
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
          
    var data = sortObject(body)
    var currencies = Object.keys(data)
    
    currencies.forEach(function(key) {
      var coin = data[key]
      var test = coin.id
      var name = coin.name
      var rank =  coin.rank
      var sym = coin.symbol
      var usd = decimals(coin.quotes.USD.price, 2)
      
      var btc = decimals(coin.quotes.BTC.price, 8)
      
      /*
      var btc = coin.quotes.BTC.price
      if (typeof(btc) == 'undefined'){
        btc = 'N/A'
      } else {

        btc = decimals(coin.quotes.BTC.price, 8)
      }  
*/
      var hour = decimals(coin.quotes.USD.percent_change_1h, 2)
      var day = decimals(coin.quotes.USD.percent_change_24h, 2)
      var week = decimals(coin.quotes.USD.percent_change_7d, 2)
      var marketcap = formatNumeral(coin.quotes.USD.market_cap)
      var volume = formatNumeral(coin.quotes.USD.volume_24h)
      var availableSupply = formatNumeralUnits(coin.circulating_supply)
      var totalSupply = formatNumeralUnits(coin.total_supply)
      var maxSupply = formatNumeralUnits(coin.max_supply)
      var tableData = [rank, sym, usd, btc, colorByPercent(hour), colorByPercent(day), colorByPercent(week),
        colorByNumeral(marketcap), colorByNumeral(volume), name, colorByNumeral(availableSupply), colorByNumeral(totalSupply), colorByNumeral(maxSupply)]
      var fixedData = replaceNull(tableData)
      table.push(fixedData)
      
    });
      log(table.toString())
      log(' ')
      } else {
  		log(error)
  	}
  })
}

function sortObject(o) {
  return Object.keys(o.data)
  .sort((a,b) => (o.data[a].rank - o.data[b].rank))
  .reduce((acc,cur) => {
    return(acc[o.data[cur].rank] = o.data[cur],acc)
  },{})
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
    return baseurl + '&limit='+ lim.toString()
  }
  limit = 10
  return baseurl + '&limit='+ limit.toString()
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
