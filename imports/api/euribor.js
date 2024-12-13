import { Meteor } from 'meteor/meteor';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

Meteor.methods({
  async 'euribor.get3M'() {
    try {
      console.log('1. Starting EURIBOR fetch from euribor-rates.eu...');
      
      const url = 'https://www.euribor-rates.eu/fr/taux-euribor-actuels/2/euribor-taux-3-mois/';
      console.log('2. Requesting URL:', url);

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      console.log('3. Making fetch request with headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        redirect: 'follow',
        timeout: 30000,
        agent: null
      });

      console.log('4. Response received');
      console.log('5. Response status:', response.status);
      console.log('6. Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      console.log('7. Content length:', content.length);

      if (!content) {
        throw new Error('No content in response');
      }

      console.log('8. Parsing HTML content');
      const $ = cheerio.load(content);
      console.log('9. HTML parsed successfully');
      console.log('10. Page title:', $('title').text());

      // First, let's log all tables found
      console.log('11. Looking for tables');
      $('table').each((i, table) => {
        console.log(`Table ${i} classes:`, $(table).attr('class'));
        console.log(`Table ${i} first row:`, $(table).find('tr').first().text());
      });

      // Look for the rate in the first table with class table-striped
      const rateCell = $('table.table-striped tr').find('td.text-right').first();
      if (rateCell.length) {
        const rateText = rateCell.text().trim();
        console.log('12. Found rate text:', rateText);
        
        // Parse the rate (format: "2,888 %")
        const rate = parseFloat(rateText.replace(',', '.').replace('%', '').trim());
        console.log('13. Parsed rate:', rate);
        
        if (!isNaN(rate)) {
          console.log('14. Found valid EURIBOR 3M rate:', rate);
          return rate;
        }
      }
      
      console.error('15. Could not parse rate from response');
      console.error('16. HTML content preview:', content.substring(0, 500));
      return 2.89;
    } catch (e) {
      console.error('Error fetching EURIBOR 3M:', e.message);
      console.error('Full error:', e);
      return 2.89;
    }
  }
}); 