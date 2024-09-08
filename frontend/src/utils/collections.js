export function replace(arr, obj, name = null, replacer = null) {
    const index = arr.findIndex(name ? e => e[name] === obj[name] : e => e.id === obj.id);
    if (index >= 0) {
        if (replacer)
            replacer(arr[index], obj);
        else
            arr.splice(index, 1, obj);
    }
}

export function addOrReplace(arr, obj, name = null, replacer = null) {
    const index = arr.findIndex(name ? e => e[name] === obj[name] : e => e.id === obj.id);
    if (index >= 0) {
        if (replacer)
            replacer(arr[index], obj);
        else
            arr.splice(index, 1, obj);
    }
    else
        arr.push(obj)
    return arr;
}

export function addOrReplaceMany(arr, items, sub) {
    const copy = [...arr];
    for (const obj of toArray(items))
        addOrReplace(copy, obj, sub);
    return copy;
}

export function remove(arr, id, name = undefined) {
    const index = name === null ? arr.findIndex(e => e === id) : arr.findIndex(name ? e => e[name] === id : e => e.id === id);
    if (index >= 0)
        return arr.splice(index, 1)[0];
    return null;
}

export function toArray(e) {
    return e instanceof Array ? e : [e];
}

export function sortById(array, inverse = false) {
    return toArray(array).sort(inverse ? (a, b) => b.id - a.id : (a, b) => a.id - b.id);
}

export function sortByName(array, name = 'name', inverse = false) {
    return toArray(array).sort(inverse ? (a, b) => b[name].localeCompare(a[name]) : (a, b) => a[name].localeCompare(b[name]));
}

export function hasFlag(array, element) {
    return array.indexOf(element) !== -1;
}

export function simpleArraysCompare(a, b) {
    if(a.length !== b.length)
        return false;
    for(let i = 0; i < a.length; i++) {
        if(b.indexOf(a[i]) === -1)
            return false;
    }
    return true;
}

export default {
    replace,
    addOrReplace,
    addOrReplaceMany,
    remove,
    toArray,
    sortById,
    sortByName,
    hasFlag,
    simpleArraysCompare,
}