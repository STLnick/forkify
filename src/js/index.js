// Had to explicitly import to get rid of 'regeneratorRuntime not defined' error
import "regenerator-runtime/runtime";

import Search from './models/Search';

const search = new Search('pizza');
console.log(search);
search.getResults();
