export const Api = {
  get(url) {
    switch (url) {
      case '/lots':
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([
              {
                id: 1,
                name: 'Apple',
                description: 'Apple description',
                price: 16,
                isFavorite: true
              },
              {
                id: 2,
                name: 'Orange',
                description: 'Orange descriptions',
                price: 4,
                isFavorite: false
              }
            ]);
          }, 2000);
        });
      default:
        throw new Error('Unknown address');
    }
  },
  post(url) {
    if (/^\/lots\/(\d+)\/favorite$/.exec(url)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 500);
      });
    }
    if (/^\/lots\/(\d+)\/unfavorite$/.exec(url)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 500);
      });
    }
    throw new Error('Unknown adress');
  }
};
