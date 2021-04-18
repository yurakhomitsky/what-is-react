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
                price: 16
              },
              {
                id: 2,
                name: 'Orange',
                description: 'Orange descriptions',
                price: 4
              }
            ]);
          }, 2000);
        });
      default:
        throw new Error('Unknown address');
    }
  }
};
