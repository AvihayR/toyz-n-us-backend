import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    get,
    remove,
    save
}

function query(filterBy = {}) {
    console.log(filterBy)
    let toysToDisplay = toys
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToDisplay = toysToDisplay.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.inStock === 'true') {
        toysToDisplay = toysToDisplay.filter(toy => toy.inStock)
    }
    else if (filterBy.inStock === 'false')
        toysToDisplay = toysToDisplay.filter(toy => !toy.inStock)
    if (filterBy.sortBy === 'alphabet')
        toysToDisplay = toysToDisplay.sort((t1, t2) => { return t1.name.localeCompare(t2.name) })
    else if (filterBy.sortBy === 'price')
        toysToDisplay = toysToDisplay.sort((t1, t2) => { return t1.price - t2.price })
    return Promise.resolve(toysToDisplay)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    // if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
    toys.splice(idx, 1)
    return _saveToysToFile()

}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.inStock = toy.inStock
        // if (toyToUpdate.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
    } else {
        toy._id = _makeId()
        // toy.owner = loggedinUser
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const toysStr = JSON.stringify(toys, null, 4)

        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}
