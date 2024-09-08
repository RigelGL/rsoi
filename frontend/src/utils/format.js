function __unten(e) {
    return e < 10 ? '0' + e : e;
}

const __weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const __transliterationChars = {
    ' ': '-',
    '-': '-',
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': 'yo',
    'ж': 'zh',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'ts',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'sch',
    'ъ': '',
    'ы': 'i',
    'ь': '',
    'э': 'ae',
    'ю': 'yu',
    'я': 'ya',
};

const __engToRussian = {
    'q': 'й',
    'w': 'ц',
    'e': 'у',
    'r': 'к',
    't': 'е',
    'y': 'н',
    'u': 'г',
    'i': 'ш',
    'o': 'щ',
    'p': 'з',
    '[': 'х',
    ']': 'ъ',
    'a': 'ф',
    's': 'ы',
    'd': 'в',
    'f': 'а',
    'g': 'п',
    'h': 'р',
    'j': 'о',
    'k': 'л',
    'l': 'д',
    ';': 'ж',
    'z': 'я',
    'x': 'ч',
    'c': 'с',
    'v': 'м',
    'b': 'и',
    'n': 'т',
    'm': 'ь',
    ',': 'б',
    '.': 'ю',
    '`': 'ё',
};
const __regexpReplace = ['[', ']', '.', '(', ')'];
const __russianToEnd = {};

(() => Object.keys(__engToRussian).forEach(e => __russianToEnd[__engToRussian[e]] = e))();

export function formatTime(value, tpl = 'dd.MM.yyyy hh:mm', isUTC = true) {
    if(!value)
        return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    const utc = isUTC ? 'UTC' : '';
    const y = date['get' + utc + 'FullYear']();
    const M = date['get' + utc + 'Month']() + 1;
    const d = date['get' + utc + 'Date']();
    const h = date['get' + utc + 'Hours']();
    const m = date['get' + utc + 'Minutes']();
    const s = date['get' + utc + 'Seconds']();
    const S = date['get' + utc + 'Milliseconds']();

    tpl = tpl.replace('MM', __unten(M))
        .replace('M', M)
        .replace('yyyy', y)
        .replace('yy', y % 100)
        .replace('dd', __unten(d))
        .replace('d', d)
        .replace('hh', __unten(h))
        .replace('h', h)
        .replace('mm', __unten(m))
        .replace('m', m)
        .replace('ss', __unten(s))
        .replace('s', s);

    return tpl;
}


export function formatDatePickerTitle(date) {
    if (date.length === 1)
        return formatDate(date[0], true);
    else if (date.length === 2)
        return `${formatDate(date[date[0] < date[1] ? 0 : 1], true)} - ${formatDate(date[date[0] > date[1] ? 0 : 1], true)}`;
    else
        return '';
}

export function formatTime2Lines(t) {
    if (!t)
        return '';
    if (typeof t === 'string')
        t = new Date(t);
    const date = __unten(t.getUTCDate()) + "." + __unten(1 + t.getUTCMonth()) + "." + __unten(t.getUTCFullYear());
    const time = __unten(t.getUTCHours()) + ':' + __unten(t.getUTCMinutes());
    return `<span class="dt-time">${__weekdays[t.getUTCDay()]}, ${time}</span><br><span class="dt-date">${date}</span>`;
}

export function humanFileSize(bytes, dp = 2) {
    const thresh = 1024;

    if (Math.abs(bytes) < thresh)
        return bytes + ' B';

    const units = ['kB', 'MB', 'GB', 'TB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}

export function formatDate(t, year = false) {
    if (!t)
        return '';
    if (typeof t === 'string')
        t = new Date(t);
    return __unten(t.getUTCDate()) + "." + (__unten(t.getUTCMonth() + 1)) + (year ? `.${t.getUTCFullYear()}` : '');
}

export function formatDateWithInterval(t, min, max, year = false) {
    if (!t)
        return '';
    if (typeof t === 'string')
        t = new Date(t);

    let right = '';
    if (min !== '00:00:00' || max !== '00:00:00')
        right = ` ${min.substring(0, 5)}-${max.substring(0, 5)}`;

    return __unten(t.getUTCDate()) + "." + (__unten(t.getUTCMonth() + 1)) + (year ? `.${t.getUTCFullYear()}` : '') + right;
}

export function formatPrice(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}


export function transliteration(russian) {
    let t = '';
    for (const e of russian.toLowerCase()) {
        if (e >= 'a' && e <= 'z' || e >= '0' && e <= '9')
            t += e;
        else if (Object.hasOwn(__transliterationChars, e))
            t += __transliterationChars[e];
    }
    return t;
}

export function engToRussian(english) {
    let t = '';
    for (const e of english.toLowerCase()) {
        if (e >= '0' && e <= '9')
            t += e;
        else if (Object.hasOwn(__engToRussian, e))
            t += __engToRussian[e];
        else
            t += e;
    }
    return t;
}

export function getSearchRegExp(str) {
    const e = str?.trim()?.toLowerCase();
    if (!e)
        return null;

    let toRegExp = e;
    __regexpReplace.forEach(r => toRegExp = toRegExp.replaceAll(r, `\\${r}`));

    const alt = engToRussian(toRegExp);
    if (alt !== toRegExp)
        toRegExp = `(${toRegExp})|(${alt})`;

    return new RegExp(toRegExp, 'ig');
}


export default {
    formatDate,
    formatDateWithInterval,
    formatTime,
    formatDatePickerTitle,
    formatTime2Lines,
    humanFileSize,
    formatPrice,
    transliteration,
    engToRussian,
    getSearchRegExp,
}