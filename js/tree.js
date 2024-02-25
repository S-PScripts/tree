let area = document.querySelector('#area-main');
const treeWidth = 2;
const treeHeight = 120;
const magConst = 150;

const itemWidth = 120;
const itemHeight = 90;

function genElement(type, area, content, attribs) {
    var elem = document.createElementNS("http://www.w3.org/2000/svg",type);

    var directAttribs = attribs.direct || {};
    var styleAttribs = attribs.style || {};

    var fullStyle = "";

    Object.keys(styleAttribs).forEach(function (attrib) {
        fullStyle += `${attrib}: ${styleAttribs[attrib]};`
    });

    directAttribs.style = fullStyle;

    Object.keys(directAttribs).forEach(function (attrib) {
        elem.setAttribute(attrib, directAttribs[attrib]);
    });

    elem.textContent = content;

    area.appendChild(elem);

    return elem;
}

function genEntry(posEntry, area, fetchData) {
    var data = fetchData[posEntry.id] || {};

    var x = posEntry.x * magConst;
    var y = posEntry.y * treeHeight;

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
        },
        'style': {
            'transform': `translate(${x}px, ${y}px)`
        }
    });   

    genElement('image', a, '', {
        'direct': {
            'href': `https://uploads.scratch.mit.edu/get_image/project/${posEntry.id}_1920x1080.png`,
            'x': '10',
            'y': '-15',
            'width': '100'
        }
    });

    let text = [
        `${posEntry.name}`,
        `${posEntry.y} proj. deep`,
        `${(posEntry.date) ? (new Date(posEntry.date.$date) + '').split('GMT')[0] : 'Date not available'}`,
        `${posEntry.user}`
    ];

    for (let i in text) {

        genElement('text', a, text[i], {
            'direct': {
                'x': '75',
                'y': 75 + 8 * i
            }
        });   
    }

    
    /*
    {#if Math.abs((mpos[0] + elem.x * zoom) - width/2) < width/2 * 1.2 && Math.abs((mpos[1] + elem.y  * zoom) - height/2) < height/2 * 1.2 }
                        <image href='https://uploads.scratch.mit.edu/get_image/project/{elem.id}_1920x1080.png' x='10' y='-15' width='100' />
                    {:else}
                        <circle r="25" cx="60" cy="40"></circle>
                    {/if}                   
                    <text x='75' y='75'>{elem.name}</text>
                    <text x='75' y='83'>{elem.y / treeHeight} proj. deep</text>
                    <text x='75' y='91'>{(elem.date) ? (new Date(elem.date.$date) + '').split('GMT')[0] : 'Date not available'}</text>
                    <text x='75' y='99'>{elem.user}</text>

                    */
}


async function genTree(id) {
    let params = new URLSearchParams(window.location.search);

    let treeId = params.get("id").replace(/[^0-9]/g, '');
    if (id) treeId = id;

    let fetchData = await fetch(`https://scratch.mit.edu/projects/${treeId}/remixtree/bare`)
        .then(x => x.json());

    let keys = Object.keys(fetchData);

    keys.forEach(id => {
        if (id == fetchData.root_id || id == 'root_id') return;

        let allChild = keys.map(x => fetchData[x].children).flat();

        if (allChild.indexOf(id) == -1) {
            fetchData[fetchData.root_id].children.push(id);
        }

    });

    let pos = await main(fetchData);

    pos.forEach(function (posEntry) {
        genEntry(posEntry, area, fetchData);
    })

    return pos;
}