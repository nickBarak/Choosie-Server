let bins = {
    ll: null,
    L1ghts: null,
    'test 123': {
      'https://www.imdb.com/title/tt0448115/': true,
      'https://www.imdb.com/title/tt6751668/': true
    }
  };

console.log(Object.entries(bins).find(bin => bin[0] === 'test 123'))