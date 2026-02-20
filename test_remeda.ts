import * as R from 'remeda';

console.log(R.pipe([1, 5, 3], R.firstBy([(x: number) => x, 'desc'])));
