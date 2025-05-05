

// Audio Commands Setup
if (annyang) {
    var commands = {
        'hello': function() {
            alert('Hello World');
        },
        'change the color to :color': function(color) {
            document.body.style.backgroundColor = color;
        },
        'navigate to :page': function(page) {
            var pageLower = page.toLowerCase();
            if (pageLower === 'home') window.location.href = 'index.html';
            else if (pageLower === 'stocks') window.location.href = 'stocks.html';
            else if (pageLower === 'dogs') window.location.href = 'dogs.html';
        }
    };
    annyang.addCommands(commands);
}

document.getElementById('start-audio').addEventListener('click', function() {
    if (annyang) annyang.start();
});

document.getElementById('stop-audio').addEventListener('click', function() {
    if (annyang) annyang.abort();
});

// Home Page
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    fetch('https://zenquotes.io/api/random')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Quote data:', data); 
            if (data && data.length > 0) {
                const quote = data[0].q;
                const author = data[0].a;
                document.getElementById('quote').textContent = `"${quote}" — ${author}`;
            } else {
                document.getElementById('quote').textContent = 'No quote available.';
            }
        })
        .catch(error => {
            console.error('Error fetching quote:', error);
            document.getElementById('quote').textContent = 'Failed to load quote.';
        });
}

// Stocks Page
if (window.location.pathname.endsWith('stocks.html')) {
    let stockChart;
    // Stock Lookup
    document.getElementById('lookup-stock').addEventListener('click', function() {
        var ticker = document.getElementById('stock-ticker').value.toUpperCase();
        var days = document.getElementById('days').value;
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        var startDateStr = startDate.toISOString().split('T')[0];
        var endDateStr = endDate.toISOString().split('T')[0];
        const apiKey = 'your_actual_api_key_here';
        var url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDateStr}/${endDateStr}?apiKey=${apiKey}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    var labels = data.results.map(result => new Date(result.t).toLocaleDateString());
                    var values = data.results.map(result => result.c);
                    var ctx = document.getElementById('stock-chart').getContext('2d');
                    if (stockChart) {
                        stockChart.destroy(); // Destroy existing chart
                    }
                    stockChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: `${ticker} Closing Price`,
                                data: values,
                                borderColor: '#007bff',
                                fill: false
                            }]
                        },
                        options: {
                            scales: {
                                x: { title: { display: true, text: 'Date' } },
                                y: { title: { display: true, text: 'Price ($)' } }
                            }
                        }
                    });
                } else {
                    alert('No data for this ticker.');
                }
            })
            .catch(error => console.log('Error fetching stock data:', error));
    });

    // Top 5 Stocks
    fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03')
        .then(response => response.json())
        .then(data => {
            var top5 = data.slice(0, 5);
            var tbody = document.getElementById('top-stocks').querySelector('tbody');
            top5.forEach(stock => {
                var row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
                    <td>${stock.no_of_comments}</td>
                    <td>${stock.sentiment === 'Bullish' ? '🐂' : '🐻'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.log('Error fetching top stocks:', error));

    // Voice Command 
    if (annyang) {
        annyang.addCommands({
            'lookup :stock': function(stock) {
                document.getElementById('stock-ticker').value = stock.toUpperCase();
                document.getElementById('days').value = '30';
                document.getElementById('lookup-stock').click();
            }
        });
    }
}

// Dogs Page
if (window.location.pathname.endsWith('dogs.html')) {
    // Dog Carousel
    var dogImages = [];
    function fetchDogImage() {
        fetch('https://dog.ceo/api/breeds/image/random')
            .then(response => response.json())
            .then(data => {
                dogImages.push(data.message);
                if (dogImages.length === 10) {
                    var carousel = document.getElementById('dog-carousel');
                    dogImages.forEach(img => {
                        var imgElement = document.createElement('img');
                        imgElement.src = img;
                        imgElement.alt = 'Dog';
                        carousel.appendChild(imgElement);
                    });
                    $(carousel).slick({
                        arrows: true,
                        dots: true,
                        infinite: true,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    });
                } else {
                    fetchDogImage();
                }
            })
            .catch(error => console.log('Error fetching dog image:', error));
    }
    fetchDogImage();

    // Dog Breeds
    fetch('https://dog.ceo/api/breeds/list/all')
        .then(response => response.json())
        .then(data => {
            var breeds = Object.keys(data.message);
            var buttonsDiv = document.getElementById('breed-buttons');
            breeds.forEach(breed => {
                var button = document.createElement('button');
                button.setAttribute('class', 'custom-button');
                button.textContent = breed;
                button.addEventListener('click', function() {
                    fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breed}`)
                        .then(response => response.json())
                        .then(breedData => {
                            if (breedData.length > 0) {
                                var info = breedData[0];
                                document.getElementById('breed-name').textContent = info.name;
                                document.getElementById('breed-description').textContent = info.temperament || 'No description available.';
                                document.getElementById('breed-min-life').textContent = info.life_span.split(' - ')[0];
                                document.getElementById('breed-max-life').textContent = info.life_span.split(' - ')[1] || info.life_span;
                                document.getElementById('breed-info').style.display = 'block';
                            }
                        })
                        .catch(error => console.log('Error fetching breed info:', error));
                });
                buttonsDiv.appendChild(button);
            });
        })
        .catch(error => console.log('Error fetching breeds:', error));

    // Voice Command 
    if (annyang) {
        annyang.addCommands({
            'load dog breed :breed': function(breed) {
                var buttons = document.querySelectorAll('#breed-buttons button');
                buttons.forEach(button => {
                    if (button.textContent.toLowerCase() === breed.toLowerCase()) {
                        button.click();
                    }
                });
            }
        });
    }
}