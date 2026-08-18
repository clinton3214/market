const https = require('https');

const countriesToCheck = ['united states', 'canada', 'united kingdom', 'sweden', 'germany', 'france', 'netherlands', 'spain', 'poland', 'italy', 'croatia', 'india', 'indonesia', 'malaysia', 'cambodia', 'mongolia', 'thailand', 'vietnam', 'nigeria', 'ivory coast', 'sierra leone', 'benin', 'ghana', 'other'];

https.get('https://5sim.net/v1/guest/prices', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const availableCountries = Object.keys(json);
      
      console.log('Available countries sample:', availableCountries.slice(0, 10));
      
      const mappedCountries = countriesToCheck.map(c => {
        // try some variants
        const clean = c.toLowerCase().replace(/[^a-z]/g, '');
        const snake = c.toLowerCase().replace(/ /g, '_');
        let match = availableCountries.find(x => x === c.toLowerCase() || x === clean || x === snake);
        if (!match && c === 'united states') match = 'usa';
        if (!match && c === 'united kingdom') match = 'england';
        if (!match && c === 'ivory coast') match = 'ivorycoast';
        return `${c} -> ${match || 'NOT FOUND'}`;
      });
      console.log('Countries Map:\n' + mappedCountries.join('\n'));
      
      const usaData = json['usa'] || json['russia']; // just to check products
      const availableProducts = Object.keys(usaData);
      console.log('Available products sample:', availableProducts.slice(0, 10));
    } catch(e) {
      console.error(e);
    }
  });
});
