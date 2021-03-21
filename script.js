const state = {
  time: new Date(),
  lots: [
    {
      id: 1,
      name: 'Apple',
      description: 'Apple description',
      price: 16
    },
    {
      id: 2,
      name: 'Orange',
      description: 'Orange descriptions',
      price: 4
    }
  ]
};

const app = document.createElement('div');
app.className = 'app';

const header = document.createElement('header');
header.className = 'header';

const logo = document.createElement('img');
logo.className = 'logo';
logo.src = 'logo.png';

header.append(logo);

const clock = document.createElement('div');
clock.className = 'clock';
clock.innerText = state.time.toLocaleTimeString();

const lots = document.createElement('div');
lots.className = 'lots';

state.lots.forEach((lot) => {
  const article = document.createElement('article');
  article.className = 'lot';

  const price = document.createElement('div');
  price.className = 'price';
  price.innerText = lot.price;
  article.append(price);

  const name = document.createElement('h1');
  name.innerText = lot.name;
  article.append(name);

  const description = document.createElement('p');
  description.innerText = lot.description;
  article.append(description);

  lots.append(article);
});

const domRoot = document.getElementById('root');
app.append(header);
app.append(clock);
app.append(lots);

domRoot.append(app);
