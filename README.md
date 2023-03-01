# houses-market-data

run in console npm start houses <url> to collect pricing data from olx site

sample urls:
- https://www.olx.pl/nieruchomosci/domy/sprzedaz/slupsk/?search%5Bdist%5D=10
- https://www.olx.pl/nieruchomosci/domy/sprzedaz/slupsk/?page=2&search%5Bdist%5D=10
- https://www.olx.pl/nieruchomosci/domy/sprzedaz/slupsk/?page=3&search%5Bdist%5D=10

KEEP IN MIND that script currently is based on html classes while retrieving data from pages, 
so classes can be changed on site and code will require modification to work properly.

