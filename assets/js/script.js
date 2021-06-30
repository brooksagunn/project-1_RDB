var queryEl = document.getElementById('autocomplete-input');
var searchFormEl = document.getElementById('search-form');
var coins = null;
var activeCoins = [];

const paprikaCoinList = [];
const coinGeckoList = [];

// data for search autocomplete
var data = { };

var chartCount;


function init() {
    chartCount = 0;
    getCoinList();
    makeTermGlossary();
}

init();


// look into adding symbol link instead of 'null'
function getCoinList() {
    fetch('https://api.coinpaprika.com/v1/tickers').then(function(response) {
        return response.json();
    }).then(function(info) {
        coins = info;
        info.forEach(coin => {
            data[coin.name] = null;
            data[coin.symbol] = null;
        });

    })
}


// would be good to have the alphabetized
function makeTermGlossary() {
    fetch('https://api.coinpaprika.com/v1/tags').then(function(response) {
        return response.json();
    }).then(function(info) {
        // console.log(info);
        info.forEach(term => {
            let termItem = document.createElement('li');
            let itemHeadCollapse = document.createElement('div');
            let itemBodyCollapse = document.createElement('div');
            // let itemBodyCollapseSpan = document.createElement('span');

            itemHeadCollapse.textContent = term.name;
            termItem.classList.add('collapsible-header');
            termItem.append(itemHeadCollapse);

            itemBodyCollapse.classList.add('collapsible-body');

            itemBodyCollapse.textContent = term.description;
            // itemBodyCollapse.append(itemBodyCollapseSpan);
            termItem.append(itemBodyCollapse);

            $('#term-glossary').append(termItem);
        });
    })
}


function genCoinCard(coin){
    //------ chart addition ----//
    // this may cause issues when deleting chart from page, but not sure...
    chartCount++;
    var chartTargetId = 'chart-target' + chartCount;
    // ------- end chart addition ------//

    var coinsArea = document.getElementById('card-space');

    var name = coin.name;

    var coinString = "<p><b>Name:</b> "+coin.name+"</p>"+
                    "<p><b>Symbol:</b> "+coin.symbol+"</p>"+
                    "<p><b>Price:</b> $"+(Math.round(coin.price * 100)/100)+"</p>"+
                    "<p><b>Market Cap:</b> $ "+(Math.round(coin.mktcap * 100)/100)+"</p>"+
                    "<p><b>All time high ($):</b> "+(Math.round(coin.ath * 100)/100)+"</p>"+
                    "<p><b>24H Volume ($):</b> "+(Math.round(coin.volume * 100)/100)+"</p>"+
                    "<p><b>Rank:</b> "+coin.rank+"</p>"+
                    "<p><b>Supply:</b> "+coin.supply;

    var newCoin = document.createElement('div');
    newCoin.classList.add('coin-card')
    newCoin.innerHTML = "<div class=\"card\"><div class=\"card-image\"><div id="+ chartTargetId +"></div><a class=\"btn-floating halfway-fab waves-effect waves-light red\"><i class=\"material-icons\">add</i></a></div><div class=\"card-content amber lighten-3\"><p>"+coinString+"</p></div></div>";

    coinsArea.appendChild(newCoin);

    //------ chart addition ----//
    var chartWrapper = document.createElement('div');
    chartWrapper.classList.add('canvas-wrapper', 'grey'); //  'darken-3'
    var coinChart = document.createElement('canvas');
    coinChart.classList.add('grey');
    coinChartId = coin.name + '-chart';
    coinChart.setAttribute('id', coinChartId);
    chartWrapper.append(coinChart);
    
    var chartTarget = document.getElementById(chartTargetId);
    chartTarget.append(chartWrapper);
    getChartData(coin.name.toLowerCase(), coinChartId);
    // ------- end chart addition ------//


}



searchFormEl.addEventListener("submit", function(event){
    console.log('activated')
    event.preventDefault();


    if(coins){
        var query = queryEl.value.toLowerCase();
        
        var coin = {
            name: 'placeholder',
            symbol: 'placeholder',
            price: 'placeholder',
            mktcap: 'placeholder',
            ath: 'placeholder',
            volume: 'placeholder',
            rank: 'placeholder',
            supply: 'placeholder'
        }

        for(i=0; i<coins.length; i++){
            if(coins[i].name.toLowerCase() === query || coins[i].symbol.toLowerCase() === query){
                if(!activeCoins.includes(coins[i].name)){
                    

                    coin.name = coins[i].name;
                    coin.symbol = coins[i].symbol;
                    coin.price = coins[i].quotes.USD.price;
                    coin.mktcap = coins[i].quotes.USD.market_cap;
                    coin.ath = coins[i].quotes.USD.ath_price;
                    coin.volume = coins[i].quotes.USD.volume_24h;
                    coin.rank = coins[i].rank;
                    coin.supply = coins[i].circulating_supply;
                    
                    
                    activeCoins.push(coin.name);
                    console.log(activeCoins);
                    genCoinCard(coin);
                    break;
                }
                
            }
        }

        

        // return coin;
        console.log(coin); 
        queryEl.value = '';
        
    }
    
})
// ------- Chart data and Make chart ----------- //
function getChartData(coinName, chartId) {
    
    var price = [];
    var day = [];

    fetch('https://api.coingecko.com/api/v3/coins/'+ coinName + '/market_chart?vs_currency=usd&days=30&interval=daily').then(function(response) {
        return response.json();
    }).then(function(info) {
        console.log(info);
        for (i = 0; i < info.prices.length; i++){
            day.push(info.prices[i][0]);
            price.push(info.prices[i][1]);
           
        };
        return [price, day, (coinName[0].toUpperCase()+coinName.substring(1))];
    }).then(function(chartData){
        makeChart(chartData[0], chartData[1], chartData[2], chartId);
    })
    
    
}


function makeChart(price, day, coinName, chartId){
    var ctx = document.getElementById(chartId);
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: day,
            datasets: [{
                label: coinName + ' price (last 30 days)',
                data: price,
                backgroundColor: '#27DA1B',
                borderColor: '#27DA1B'
                }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: coinName + ' price (last 30 days)',
                }
            },
            scales: {
                x: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        // borderColor: '#FFFFFF',
                        // color: '#FFFFFF'
                    }
                },
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return '$' + value;
                        },
                        color: '#FFFFFF'
                    },
                    grid: {
                        // borderColor: '#FFFFFF',
                        // color: '#FFFFFF'
                    }
                }
            }    
        }
    }
    )
}

// ------- END Chart data and Make chart ----------- //


// ------- jQuery initializations for Materialize components ---------- //

// M.AutoInit();

$(document).ready(function(){
    $('.sidenav').sidenav({
        menuWidth: 300,
        closeOnClick: true,
        // edge: 'right',
    });
  });


$(document).ready(function(){
$('input.autocomplete').autocomplete({
   data,
});
});

$(document).ready(function(){
    $('.collapsible').collapsible();
  });

// -------------------------------------------------- TWITTER CARD ------------------------------------------------ //

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Card Generation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
var tweetBar = document.querySelector("#tweet-bar");
var tweetDataContainer = [];

var matTwitBlock = "";

function generateTwitCard() {
    matTwitBlock +=     '<div class="row">'
    matTwitBlock +=         '<div class="col s12 m12 l12">'
    matTwitBlock +=             '<div class="card blue-grey darken-1">'
    matTwitBlock +=                 '<div class="card-content white-text">'
    matTwitBlock +=                     '<span class="card-title">Card Title</span>' // USERNAME HERE
    matTwitBlock +=                     '<p></p>' // tweetDataContainer TEXT HERE
    matTwitBlock +=                 '<div>'
    matTwitBlock +=                     '<a href="#">This is a link</a>' // TWEET LINK HERE
    matTwitBlock +=                 '</div>'
    matTwitBlock +=             '<div class="card-action">'
    matTwitBlock +=         '</div>'
    matTwitBlock +=     '</div>'
    matTwitBlock += '</div>'

    tweetBar.innerHTML += matTwitBlock;
}

generateTwitCard();

console.log(tweetBar.innerHTML);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Twitter API Fetcher ~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// MONTH ABBREVIATION CONVERSION
var monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthConverter(month) {
    for (i = 0; i < monthAbbr.length; i++) {
        if (monthAbbr[i] == month) {
            return '0' + String(i + 1);
        }
    }
}

// ENDPOINT DATE DATA OBJECT
var endPointDateData = {
    startData: {
        startYear: getDates()[2],
        startMonth: monthConverter(getDates()[0]),
        startDay: getDates()[1]
    },
    endData: {
        endYear: getDates()[5],
        endMonth: monthConverter(getDates()[3]),
        endDay: getDates()[4]
    }
}

// ENDPOINT DATA OBJECT
var endPointData = {
    hashtag: 'doge',
    startDate: endPointDateData.startData.startYear + "-" + endPointDateData.startData.startMonth + "-" + endPointDateData.startData.startDay,
    endDate: endPointDateData.endData.endYear + "-" + endPointDateData.endData.endMonth + "-" + endPointDateData.endData.endDay
}

var endPoint = "/getSearch?" + "hashtag=" + endPointData.hashtag + "&start_date=" + endPointData.startDate + "&end_date=" + endPointData.endDate;

// TWEET FETCHER
function twitterfetch() {
    fetch("https://twitter32.p.rapidapi.com" + endPoint, {
    method: "GET",
    "headers": {
        "x-rapidapi-key": "9ce9da8239mshfdc240a5706e6dbp1a372ajsnf408cd27ddc9",
		"x-rapidapi-host": "twitter32.p.rapidapi.com"
    }
})
    .then(response => {
        return response.json();
    })
    .then(data => {
        var tweetData = data.data.tweets;

        Object.keys(tweetData).forEach(key => {
            tweetDataContainer.push(tweetData[key]);
        });
    })
}

twitterfetch();
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Generate Start/End Dates for Twitter URL ~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// DATE GENERATOR
function getDates() {
    var today = new Date(); // Makes new date object for today
    var tomorrow = new Date(today); 
    tomorrow.setDate(tomorrow.getDate() + 1); // Makes new date object for tomorrow

    function slicify(day) {
        var stringifyDay = String(day); // Saves day object parsed as a string
        var splitDay = stringifyDay.split(" "); // Saves split string in an array
        var sliceDay = splitDay.slice(1, 4); // Saves month day and year in that order for today in an array
        return sliceDay;
    }

    days = slicify(today).concat(slicify(tomorrow)); // Joins respective date arrays
    return days; // Returns joined dates array
}

//Add Event listener for twitterFetch function

