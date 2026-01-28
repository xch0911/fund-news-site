const https = require('https');

function testStooq() {
    const symbols = ['^SHC', '^SHA', '000001.SS', '000300.SS', '^399001', '399001.SZ']; 
    // Trying variations for Shanghai / Shenzhen / CSI 300
    const csvUrl = `https://stooq.com/q/l/?s=${symbols.join('+')}&f=sd2t2ohlc&h&e=csv`;

    console.log(`Fetching: ${csvUrl}`);

    https.get(csvUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('--- Raw CSV Response ---');
            console.log(data);
            console.log('------------------------');
        });
    }).on('error', e => console.error("Error:", e.message));
}

testStooq();
