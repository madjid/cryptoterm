#!/usr/bin/env node

//var request = require('request')
var Table = require('cli-table')
const chalk = require('chalk')
var timestamp = require('unix-timestamp')
var numeral = require('numeral')
var args = require('minimist')(process.argv.slice(2))
const rp = require('request-promise');
var latestURL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
//var globalurl = 'https://api.coinmarketcap.com/v2/global/'
const log = console.log
var ticker = args.t
var lim = args.l
//var url = setUrl(ticker, lim)
var limit;

lim===undefined ? limit= '10': limit=lim

if (ticker===undefined){

  
}

var convert = 'USD'
const requestOptions = {
  method: 'GET',
  uri: latestURL,
  qs: {
    'start': '1',
    'limit': limit,
    'convert': convert
  },
  headers: {
    'X-CMC_PRO_API_KEY': '9dc06fb6-2a48-4575-999f-2e608610a4bc'
  },
  json: true,
  gzip: true
};

rp(requestOptions).then(response => {
  //console.log('API call response:', response);
  const currencies = response.data;

  // console.log(currencies)
  // for (const {name: n, symbol:s, quote:q} of currencies) {
  //   console.log(`Name: ${n} ` + `Symbol: ${s}`);
  //   console.log(q.USD)
  // }


var table = new Table({
          head: [' Rank', 'Sym', 'Usd', 'Hour', 'Day', 'Week', 'Marketcap', 'Volume', 'Name', 'Available','Total', 'Max']
        , colWidths: [8, 8, 10, 10, 10, 10, 15, 12, 20, 11, 11, 11]
        , colAligns: ['right', 'left', 'right' , 'right', 'right', 'right', 'right', 'right', 'left', 'right', 'right', 'right']
        , style : {compact : true, 'padding-left' : 1, head: ['yellow']}
      })

currencies.forEach(function (coin, index) {

var crypto = [coin.cmc_rank, coin.symbol, 
  decimals(coin.quote.USD.price, 2), 
  colorByPercent(decimals(coin.quote.USD.percent_change_1h,2)), 
  colorByPercent(decimals(coin.quote.USD.percent_change_24h, 2)), 
  colorByPercent(decimals(coin.quote.USD.percent_change_7d,2)), 
  colorByNumeral(formatNumeral(coin.quote.USD.market_cap)), 
  colorByNumeral(formatNumeralUnits(coin.quote.USD.volume_24h)),
  chalk.rgb(255, 136, 0).bold(coin.name.slice(0,18)), 
  colorByNumeral(formatNumeralUnits(coin.circulating_supply)), 
  colorByNumeral(formatNumeralUnits(coin.total_supply)), 
  colorByNumeral(formatNumeralUnits(coin.max_supply))]
  //   var btc = decimals(coin.quotes.BTC.price, 8)   

var fixedData = replaceNull(crypto)
table.push(fixedData)
});

console.log(table.toString())

}) 
      

   

// function globalData(callback) {

//   request({
//       url: globalurl,
//       json: true
//   }, function (error, response, body) {

//       if (!error && response.statusCode === 200) {
//         log(' ')

//         var data = body.data
//         var totalMarketCap = data.quotes.USD.total_market_cap
//         var total24hVolume = data.quotes.USD.total_volume_24h
//         var btcPercentage = data.bitcoin_percentage_of_market_cap
//         var activeCurrencies = data.active_cryptocurrencies
//         var activeMarkets = data.active_markets
//         var lastUpdated = data.last_updated

//         var totalMarketCapFormatted = 'Total market cap: ' + chalk.blueBright(formatNumeral(totalMarketCap))
//         var total24hVolumeFormatted = 'Total 24h Volume: ' + chalk.blueBright(formatNumeral(total24hVolume))
//         var btcPercentageFormatted = 'BTC Percentage: ' + chalk.blueBright(btcPercentage + '%')
//         var activeCurrenciesFormatted = 'Active Currencies: ' + chalk.blueBright(activeCurrencies)
//         var activeMarketsFormatted = 'Active Markets: ' + chalk.blueBright(activeMarkets)
//         var lastUpdatedFormatteed = 'Last Updated: ' + chalk.blueBright(timestamp.toDate(lastUpdated))

//         var table = new Table({
//           chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
//                  , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
//                  , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
//                  , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
//         })
//         table.push(
//           [totalMarketCapFormatted, total24hVolumeFormatted, btcPercentageFormatted],
//           [activeCurrenciesFormatted, activeMarketsFormatted, lastUpdatedFormatteed]
//         )
//         log(table.toString())
//         callback(response.statusCode, error)

//       } else {
//         log(error)
//       }
//     })
// }


// function tickerData() {
//   request({
//       url: url,
//       json: true
//   }, function (error, response, body) {

//       if (!error && response.statusCode === 200) {
//   		log(' ')

//       var table = new Table({
//           head: [' Rank', 'Sym', 'Usd', 'Btc', 'Hour', 'Day', 'Week', 'Marketcap', 'Volume', 'Name', 'Available','Total', 'Max']
//         , colWidths: [8, 8, 10, 13, 10, 10, 10, 15, 12, 20, 11, 11, 11]
//         , colAligns: ['right', 'left', 'right', 'left', 'right', 'right', 'right', 'right', 'right', 'left', 'right', 'right', 'right']
//         , style : {compact : true, 'padding-left' : 1, head: ['yellow']}
//       })
          
//     var data = sortObject(body)
//     var currencies = Object.keys(data)
    
//     currencies.forEach(function(key) {
//       var coin = data[key]
//       var test = coin.id
//       var name = coin.name
//       var rank =  coin.rank
//       var sym = coin.symbol
//       var usd = decimals(coin.quotes.USD.price, 2)
      
//       var btc = decimals(coin.quotes.BTC.price, 8)
      
//       /*
//       var btc = coin.quotes.BTC.price
//       if (typeof(btc) == 'undefined'){
//         btc = 'N/A'
//       } else {

//         btc = decimals(coin.quotes.BTC.price, 8)
//       }  
// */
//       var hour = decimals(coin.quotes.USD.percent_change_1h, 2)
//       var day = decimals(coin.quotes.USD.percent_change_24h, 2)
//       var week = decimals(coin.quotes.USD.percent_change_7d, 2)
//       var marketcap = formatNumeral(coin.quotes.USD.market_cap)
//       var volume = formatNumeral(coin.quotes.USD.volume_24h)
//       var availableSupply = formatNumeralUnits(coin.circulating_supply)
//       var totalSupply = formatNumeralUnits(coin.total_supply)
//       var maxSupply = formatNumeralUnits(coin.max_supply)
//       var tableData = [rank, sym, usd, btc, colorByPercent(hour), colorByPercent(day), colorByPercent(week),
//         colorByNumeral(marketcap), colorByNumeral(volume), name, colorByNumeral(availableSupply), colorByNumeral(totalSupply), colorByNumeral(maxSupply)]
//       var fixedData = replaceNull(tableData)
//       table.push(fixedData)
      
//     });
//       log(table.toString())
//       log(' ')
//       } else {
//   		log(error)
//   	}
//   })
// }

// function sortObject(o) {
//   return Object.keys(o.data)
//   .sort((a,b) => (o.data[a].rank - o.data[b].rank))
//   .reduce((acc,cur) => {
//     return(acc[o.data[cur].rank] = o.data[cur],acc)
//   },{})
// }
// function setUrl(ticker, lim) {
//   if (ticker) {
//     limit=1
//     return baseurl + '/' + ticker
//   } else if (lim) {
//     limit = lim
//     return baseurl + '&limit='+ lim.toString()
//   }
//   limit = 10
//   return baseurl + '&limit='+ limit.toString()
// }

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
  } else if (number.slice(-1) == 'm') {
    return chalk.magenta(number)
  } else {
    return chalk.whiteBright(number)
  }
}

function decimals(value, number){
  return Number(value).toFixed(number)
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
