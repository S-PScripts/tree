let area = document.querySelector('#area-main');
const treeWidth = 2;
const treeHeight = 120;
const magConst = 150;

const itemWidth = 120;
const itemHeight = 90;

let cache = '';

function escapeHtml(unsafe) {
    return (unsafe + '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function genElement(type, area, content, attribs, open = false) {

    var directAttribs = attribs.direct || {};
    var styleAttribs = attribs.style || {};

    var fullStyle = "";

    Object.keys(styleAttribs).forEach(function (attrib) {
        fullStyle += `${attrib}: ${styleAttribs[attrib]};`
    });

    directAttribs.style = fullStyle;

    var elem = '';

    Object.keys(directAttribs).forEach(function (attrib) {
        elem += `${escapeHtml(attrib)}="${escapeHtml(directAttribs[attrib])}" `;
    });

    if (open) {

    elem = `<${type} ${elem}>${content}`
    } else {

    elem = `<${type} ${elem}>${content}</${type}>`
    }

    cache += elem;

    return elem;
}

function genEntry(posEntry, area, fetchData) {
    var data = fetchData[posEntry.id] || {};

    var x = posEntry.x * magConst;
    var y = posEntry.y * treeHeight;

    var x2 = x * zoom + mpos[0];
    var y2 = y * zoom + mpos[1];

    if (y2 < -1000 || y2 > area2.clientHeight+ 1000) return;

    if (y > 0) {
        genElement('path', area, '', {
            'direct': {
                'class': 'line',
                'd': `M ${x + (itemWidth / 2)} ${y - treeHeight + itemHeight / 2} v ${itemHeight} z`
            }
        });
    }

    if (posEntry.offbranch >= 0) {
        genElement('path', area, '', {
            'direct': {
                'class': 'line',
                'd': `M ${x + (itemWidth / 2)} ${y + itemHeight / 2} h ${magConst * (posEntry.offbranch)} z`
            }
        });
    }

    let a = genElement('a', area, '', {
        'direct': {
            'href': `https://scratch.mit.edu/projects/${posEntry.id}`,
            'class': `${posEntry.visible ? '' : 'red'}`,
        }
    }, true);

    genElement('image', a, '', {
        'direct': {
            'href': `https://uploads.scratch.mit.edu/get_image/project/${posEntry.id}_1920x1080.png`,
            'x': x - 10,
            'y': y - 15,
            'width': '100'
        }
    });

    cache += '</a>';

    let text = [
        `${posEntry.name}`,
        `${posEntry.y} proj. deep`,
        `${(posEntry.date) ? (new Date(posEntry.date.$date) + '').split('GMT')[0] : 'Date not available'}`,
        `${posEntry.user}`
    ];

    for (let i in text) {

        genElement('text', a, text[i], {
            'direct': {
                'x': x + 75,
                'y': y + 75 + 8 * i
            }
        });
    }
}


async function genTree(id) {
    let params = new URLSearchParams(window.location.search);

    let treeId = params.get("id").replace(/[^0-9]/g, '');
    if (id) treeId = id;

    let fetchData = await fetch(`https://scratch.mit.edu/projects/${treeId}/remixtree/bare`)
        .then(x => x.json());

    let keys = Object.keys(fetchData);

    let r = fetchData[fetchData.root_id];

    let i = 0;
    for (let id of keys) {
        if (id == fetchData.root_id || id == 'root_id') continue;

        if (!fetchData[id].parent_id && keys.findIndex(x => fetchData[x].children && fetchData[x].children.indexOf(id) != -1) == -1) {
            r.children.push(id);
        }
        i++;
        console.log(i)
    };

    let pos = await main(fetchData);

    setInterval(function () {
        cache = '';
        for (let posEntry of pos) {
            genEntry(posEntry, area, fetchData);
        }
        area.innerHTML = cache;
    }, 300)

    return pos;
}