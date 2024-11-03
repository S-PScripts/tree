
function genPos(id, fetchData, k) {
	let queue = [id];

	let queueHead;

	let status = fetchData[id].visibility == 'visible'
		&& (fetchData[id].moderation_status == 'safe'
			|| fetchData[id].moderation_status == 'notreviewed'
			|| fetchData[id].moderation_status == 'notsafe');

	let pos = [{
		"id": id,
		"name": fetchData[id].title,
		"date": fetchData[id].datetime_shared,
		"user": fetchData[id].username,
		"visible": status,
		"x": k + '',
		"y": 0,
		"offbranch": 0,
		"end": fetchData[id].children.length
	}];

	while (queue.length > 0) {
		queueHead = queue[0];

		let lastPosI = pos.findIndex(function (posEntry) {
			return posEntry.id == queueHead;
		});

		let children = fetchData[queueHead].children;
		queue.shift();
		if (!children || children.length == 0) continue;

		let lastPos;
		if (lastPosI > -1) {
			lastPos = pos[lastPosI];
		} else {
			continue;
		}

		children.forEach(function (child, i) {
			queue.push(child);

			let status = fetchData[child].visibility == 'visible'
				&& (fetchData[child].moderation_status == 'safe'
					|| fetchData[child].moderation_status == 'notreviewed'
					|| fetchData[child].moderation_status == 'notsafe');

			console.log(fetchData[child].moderation_status);

			pos.push({
				"id": child,
				"name": fetchData[child].title,
				"date": fetchData[child].datetime_shared,
				"user": fetchData[child].username,
				"visible": status,
				"x": lastPos.x + '|' + i,
				"y": lastPos.y + 1,
				"offbranch": 0,
				"end": (fetchData[child].children) ? fetchData[child].children.length : 0
			})

		});
	}

	return pos;
}

function sortPos(a, b) {
	let aSplit = [];
	let bSplit = [];

	a[0].split('|').forEach(function (x) {
		aSplit.push(Number(x))
	});
	b[0].split('|').forEach(function (x) {
		bSplit.push(Number(x))
	});

	let h = 0;
	aSplit.forEach(function (x, i) {
		if (h == 0 && x - bSplit[i] != 0) {
			h = x - bSplit[i];
		}
	})

	if (h == 0) {
		return (aSplit.length > bSplit.length) ? 1 : -1;
	}

	return h;
}


async function main(fetchData) {
	//let rootId = fetchData['root_id'];

	let pos = [];
	
	let filteredFetch = Object.keys(fetchData).filter(x => {
		let a = fetchData[fetchData[x].parent_id];
		if (a && a.children.length < 1) a.children = [x]
		return x != 'root_id' && !a
	}).sort((a,b) => a - b);
	for (let rootId in filteredFetch) {
		pos = [...pos,...genPos(filteredFetch[rootId], fetchData, rootId)];
	}


	let posX = [];

	pos.forEach(function (posEntry) {
		posX.push([posEntry.x, posEntry.end]);
	})

	let posReduc = posX.reduce(function (a, b) {
		if (a.indexOf(b[0]) < 0) a.push(b);
		return a;
	}, []);


	posReduc.sort(sortPos);

	let i = 0;
	posReduc.forEach(function (posEntry, j) {
		posReduc[j] = [posEntry[0], i, posEntry[1]];
		let splitty = posEntry[0].split('|');
		let lastSplitty = splitty.pop();

		if (lastSplitty != '0') {
			i++;
			posReduc[j][1] = i;
		}
	});

	pos.forEach(function (posEntry, j) {
		let i = posReduc.findIndex(function (x) {
			return x[0] == posEntry.x
		});
		if (i != -1) {
			pos[j].x = posReduc[i][1];
			let extended = posReduc[i][0] + '|' + (posReduc[i][2] - 1);
			let indexB = posReduc.findIndex(function (x) {
				return x[0] == extended
			});
			if (indexB > -1) {
				pos[j].offbranch = (posReduc[indexB][1] - posReduc[i][1]);
			}
		}
	})

	return pos;
}