var enter_panel = document.getElementById('enter_panel');
var input = document.getElementById('input');
var main_board = document.getElementById('main_board');
var new_intent = document.getElementById('new_intent');
var delete_intent = document.getElementById('delete_intent');
var preproc = document.getElementById('preproc');
var delete_preproc = document.getElementById('delete_preproc');
var branch = document.getElementById('branch');
var delete_branch = document.getElementById('delete_branch');
var make_launch = document.getElementById('make_launch');
var submit = document.getElementById('submit');

var slotName = document.getElementById('slotName');
var slotType = document.getElementById('slotType');
var slotValue = document.getElementById('slotValue');
var addSlotValue = document.getElementById('addSlotValue');

var intent_panel = document.getElementById('intent_panel');
var utt_panel = document.getElementById('utt_panel');
var preproc_panel = document.getElementById('preproc_panel');
var branches_panel = document.getElementById('branches_panel');
var utt_text = null, preproc_text = null;

var canvas = document.getElementById('canvas');

function build() {
	var screenw = window.innerWidth;
	var screenh = window.innerHeight;

	enter_panel.setAttribute("style",
		"width: 10%;"
		+ "height: 100%;");

	main_board.setAttribute("style",
		"width: 90%;"
		+ "height: 100%;");

	new_intent.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: lightblue;");

	delete_intent.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: pink;");

	preproc.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: lightblue;");

	delete_preproc.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: pink;");

	branch.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: lightblue;");

	delete_branch.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: pink;");

	make_launch.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: lightblue;");

	submit.setAttribute("style",
		"width: 80%;"
		+ "height: 2%;"
		+ "background-color: pink;");

	canvas.width = screenw * 0.80;
	canvas.height = screenh * 0.80;
}

window.onresize = () => {

	build();

	resetCanvas();

	draw();
};

build();

/*
intents: width = 26 * unit_width
		height = 15 * unit_height
		{x, y} = {width index * unit_width, height index * unit_height}
		input socket is a 2*2 unit box above 5
		output socket is a 2*2 unit box below 7

wires: 	output: index
		input: index
		if not connected: {x, y} = {width index * unit_width, height index * unit_height}

preprocs: 0 or 1

branches: number of branches

slots: [{name: name, values: []}, ...]

intent_infos: [{utt: "", preproc: "", branches: ["", ...]}, ...]
*/

var ctx = canvas.getContext('2d');

var canvas_width = canvas.width;
var canvas_height = canvas.height;

var unit_width = canvas_width / 190;
var unit_height = canvas_height / 100;

var intents = [];
var wires = [];
var preprocs = [];
var branches = [];

var launchRequestIntent = 0;

var slots = [];
var intent_infos = [];

var xhr;
var finalData = {};

var boxHover = -1;
var wireHover = -1;
var boxLockHover = -1;
var wireLockHover = -1;

var isHolding = -1;
var withNewBox = 0;
var intoCanvas = 0;
var withNewWire = 0;

var mouseOrigin = {x: 0, y: 0};
var boxOrigin = {x: 0, y: 0};

let design =

										"          	_                            	\
		input							___________1_1___________           		\
	intent head							|_______________________|      				\
										            |                         		\
		preproc bus						            |                        		\
										          __|__                        		\
	preprocessor						          |   |             				\
												  |___|                  			\
												    ||								\
			branches bus						  |    |							\
											   __|__  __|__               			\
		branches							   |   |  |   |        					\
											   |___|  |___|                         \
			output bus						     |______|                           \
		output									    1_1                             \
										";

var input_width = 2;
var input_height = 2;
var preproc_bus = 5;
var preproc_rad = 2; //radius
var branch_bus = 5
var branch_width = 4;
var branch_height = 4;
var branch_gap = 2;
var output_bus = 3;
var intent_width = 20;
var intent_height = 5;

//hardcoding test

function resetCanvas() {
	canvas_width = canvas.width;
	canvas_height = canvas.height;

	unit_width = canvas_width / 190;
	unit_height = canvas_height / 100;
}

function draw() {

	ctx.clearRect(0, 0, canvas_width, canvas_height);

	//draw the grid
	ctx.globalAlpha = 1;
	ctx.fillStyle = '#e6ebf4';
	ctx.fillRect(0, 0, canvas_width, canvas_height);
	ctx.beginPath();
	ctx.lineWidth = 1;
	for (var i = 0; i < canvas_width; i += unit_width) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, canvas_height);
	}
	for (var j = 0; j < canvas_height; j += unit_height) {
		ctx.moveTo(0, j);
		ctx.lineTo(canvas_width, j);
		//console.log('here1');
	}
	ctx.strokeStyle = '#c5cddb';
	ctx.stroke();

	//draw the box
	for (i = 0; i < intents.length; i++) {
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = '#8edbce';
		ctx.fillRect(intents[i].x * unit_width, intents[i].y * unit_height, intent_width * unit_width, intent_height * unit_height);
		ctx.fillStyle = '#4563e8';
		ctx.fillRect(getInSocket(i).x * unit_width, getInSocket(i).y * unit_height, 2 * unit_width, 2 * unit_height);
		//draw without preprocessor
		if (preprocs[i] == 0) {
			if (branches[i] == 0) {
				ctx.fillStyle = '#d83c5e';
				ctx.fillRect(getOutSocket(i).x * unit_width, getOutSocket(i).y * unit_height, 2 * unit_width, 2 * unit_height);
			}
			else {
				var endPoint1 = {x: 0, y: 0}, endPoint2 = {x: 0, y: 0};
				var branches_space_width = branches[i] * (branch_width + branch_gap) - branch_gap;
				var nextPoint = {x: intents[i].x + intent_width / 2 - branches_space_width / 2, y: intents[i].y + intent_height + branch_bus};
				ctx.beginPath();
				ctx.fillStyle = '#8edbce';
				ctx.strokeStyle = '#000000';
				ctx.lineWidth = 2;
				for (var j = 0; j < branches[i]; j++) {
					ctx.fillRect(nextPoint.x * unit_width, nextPoint.y * unit_height, branch_width * unit_width, branch_height * unit_height);
					ctx.moveTo((intents[i].x + intent_width / 2) * unit_width, (intents[i].y + intent_height) * unit_height);
					ctx.lineTo((nextPoint.x + branch_width / 2) * unit_width, nextPoint.y * unit_height);
					ctx.moveTo((nextPoint.x + branch_width / 2) * unit_width, (nextPoint.y + branch_height) * unit_height);
					ctx.lineTo((nextPoint.x + branch_width / 2) * unit_width, (nextPoint.y + branch_height + output_bus) * unit_height);
					if (j == 0) {
						endPoint1.x = nextPoint.x + branch_width / 2;
						endPoint1.y = nextPoint.y + branch_height + output_bus;
					}
					if (j == branches[i] - 1) {
						endPoint2.x = nextPoint.x + branch_width / 2;
						endPoint2.y = nextPoint.y + branch_height + output_bus;
					}
					ctx.stroke();
					nextPoint.x += branch_width + branch_gap;
				}
				ctx.beginPath();
				ctx.moveTo(endPoint1.x * unit_width, endPoint1.y * unit_height);
				ctx.lineTo(endPoint2.x * unit_width, endPoint2.y * unit_height);
				ctx.stroke();
				ctx.fillStyle = '#d83c5e';
				ctx.fillRect((endPoint1.x + (endPoint2.x - endPoint1.x) / 2 - input_width / 2) * unit_width, endPoint1.y * unit_height,
					input_width * unit_width, input_height * unit_height);
			}
		}
		//draw with preprocessor
		else if (preprocs[i] == 1) {
			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 2;
			ctx.moveTo((intents[i].x + intent_width / 2) * unit_width, (intents[i].y + intent_height) * unit_height);
			ctx.lineTo((intents[i].x + intent_width / 2) * unit_width, (intents[i].y + intent_height + preproc_bus) * unit_height);
			ctx.stroke();
			ctx.arc((intents[i].x + intent_width / 2) * unit_width, (intents[i].y + intent_height * 2 + 2) * unit_height, preproc_rad * unit_width, 0 - Math.PI / 2, Math.PI * 2);
			ctx.fillStyle = '#8edbce';
			ctx.globalAlpha = 0.8;
			ctx.fill();

			var endPoint1 = {x: 0, y: 0}, endPoint2 = {x: 0, y: 0};
			var branches_space_width = branches[i] * (branch_width + branch_gap) - branch_gap;
			var nextPoint = {x: intents[i].x + intent_width / 2 - branches_space_width / 2, y: intents[i].y + intent_height + preproc_bus + preproc_rad * 2 + branch_bus};
			ctx.beginPath();
			ctx.fillStyle = '#8edbce';
			for (var j = 0; j < branches[i]; j++) {
				ctx.fillRect(nextPoint.x * unit_width, nextPoint.y * unit_height, branch_width * unit_width, branch_height * unit_height);
				ctx.moveTo((intents[i].x + intent_width / 2) * unit_width, (intents[i].y + intent_height + preproc_bus + preproc_rad * 2) * unit_height);
				ctx.lineTo((nextPoint.x + branch_width / 2) * unit_width, nextPoint.y * unit_height);
				ctx.moveTo((nextPoint.x + branch_width / 2) * unit_width, (nextPoint.y + branch_height) * unit_height);
				ctx.lineTo((nextPoint.x + branch_width / 2) * unit_width, (nextPoint.y + branch_height + output_bus) * unit_height);
				if (j == 0) {
					endPoint1.x = nextPoint.x + branch_width / 2;
					endPoint1.y = nextPoint.y + branch_height + output_bus;
				}
				if (j == branches[i] - 1) {
					endPoint2.x = nextPoint.x + branch_width / 2;
					endPoint2.y = nextPoint.y + branch_height + output_bus;
				}
				ctx.stroke();
				nextPoint.x += branch_width + branch_gap;
			}
			ctx.beginPath();
			ctx.moveTo(endPoint1.x * unit_width, endPoint1.y * unit_height);
			ctx.lineTo(endPoint2.x * unit_width, endPoint2.y * unit_height);
			ctx.stroke();
			ctx.fillStyle = '#d83c5e';
			ctx.fillRect((endPoint1.x + (endPoint2.x - endPoint1.x) / 2 - input_width / 2) * unit_width, endPoint1.y * unit_height,
				input_width * unit_width, input_height * unit_height);
		}
		if (i == boxHover || i == boxLockHover) {
			ctx.beginPath();
			let x = intents[i].x * unit_width;
			let y = intents[i].y * unit_height;
			ctx.moveTo(x, y);
			ctx.lineTo(x + intent_width * unit_width, y);
			ctx.lineTo(x + intent_width * unit_width, y + intent_height * unit_height);
			ctx.lineTo(x, y + intent_height * unit_height);
			ctx.lineTo(x, y);
			ctx.strokeStyle = '#ffff00';
			ctx.stroke();
		}
	}

	//draw the wires
	ctx.globalAlpha = 0.4;
	ctx.lineWidth = 3;
	for (i = 0; i < wires.length; i++) {
		ctx.beginPath();
		if (i == wireHover || i == wireLockHover)
			ctx.strokeStyle = '#ffff00';
		else
			ctx.strokeStyle = '#e80000';
		let wire = wires[i];
		let inputX, inputY;
		if (wire.input > -1) {
			inputX = getInSocket(wire.input).x + 1;
			inputY = getInSocket(wire.input).y + 1;
		}
		else {
			inputX = wire.x;
			inputY = wire.y;
		}
		let outputX = getOutSocket(wire.output).x + 1;
		let outputY = getOutSocket(wire.output).y + 1;
		let middleX = outputX + (inputX - outputX) / 2;
		let middleY = outputY + (inputY - outputY) / 2;
		ctx.moveTo(outputX * unit_width, outputY * unit_height);
		ctx.quadraticCurveTo(outputX * unit_width, (outputY + 5) * unit_height, middleX * unit_width, middleY * unit_height);
		ctx.quadraticCurveTo(inputX * unit_width, (inputY - 5) * unit_height, inputX * unit_width, inputY * unit_height);
		ctx.stroke();
	}
}

canvas.addEventListener('mousedown', function(e) {
	withNewBox = 0;
	intoCanvas = 0;
	mouseOrigin = getMouse(e);
	let mouseUnitX = mouseOrigin.x / unit_width;
	let mouseUnitY = mouseOrigin.y / unit_height;
	let i = 0;
	//drag part
	for (i = 0; i < intents.length; i++) {
		let intent = intents[i];
		//drag a box
		if (mouseUnitX >= intent.x && mouseUnitX <= intent.x + intent_width
			&& mouseUnitY >= intent.y && mouseUnitY <= intent.y + intent_height) {
			isHolding = i;
			break;
		}
		//drag a wire
		else if (mouseUnitX >= getOutSocket(i).x && mouseUnitX <= getOutSocket(i).x + 2
			&& mouseUnitY >= getOutSocket(i).y && mouseUnitY <= getOutSocket(i).y + 2) {
			withNewWire = 1;
			wires.push({output: i, input: -1, x: mouseUnitX, y: mouseUnitY});
			break;
		}
	}
	if (isHolding > -1) {
	    boxOrigin.x = intents[isHolding].x;
	    boxOrigin.y = intents[isHolding].y;
	}

	//hover part
	if (boxHover > -1) {
		boxLockHover = boxHover;
		wireLockHover = -1;
		draw();
		setPanel(boxLockHover);
	}
	if (wireHover > -1) {
		wireLockHover = wireHover;
		boxLockHover = -1;
		draw();
	}
});

canvas.addEventListener('mouseup', function(e) {
    isHolding = -1;

    //set wire
    if (withNewWire) {
    	mouseOrigin = getMouse(e);
		let mouseUnitX = mouseOrigin.x / unit_width;
		let mouseUnitY = mouseOrigin.y / unit_height;
		let i = 0;
    	for (i = 0; i < intents.length; i++) {
			let intent = intents[i];
			if (mouseUnitX >= getInSocket(i).x && mouseUnitX <= getInSocket(i).x + 2
				&& mouseUnitY >= getInSocket(i).y && mouseUnitY <= getInSocket(i).y + 2) {
				wires[wires.length - 1].input = i;
				withNewWire = 0;
				draw();
				break;
			}
		}
		if (i == intents.length) {
			wires.pop();
			withNewWire = 0;
			draw();
		}
    }
});

canvas.addEventListener('mousemove', function(e) {
    let {x, y} = getMouse(e);
    if (isHolding > -1) {
    	if (x - mouseOrigin.x > unit_width || y - mouseOrigin.y > unit_height
    		|| mouseOrigin.x - x > unit_width || mouseOrigin.y - y > unit_height) {
    		intents[isHolding].x = Math.floor((x - mouseOrigin.x) / unit_width) + boxOrigin.x;
    		intents[isHolding].y = Math.floor((y - mouseOrigin.y) / unit_height) + boxOrigin.y;
    		draw();
    	}
    }
    else if (withNewBox) {
    	if (intoCanvas == 0) {
    		intents.push({x: x - intent_width / 2, y: y - intent_height / 2});
    		preprocs.push(0);
    		branches.push(1);
    		let temp = [""];
    		intent_infos.push({utt: "", preproc: "", branches: temp});
    		intoCanvas = 1;
    		draw();
    	}
    	else {
    		intents[intents.length - 1].x = Math.floor(x / unit_width) - intent_width / 2;
    		intents[intents.length - 1].y = Math.floor(y / unit_height) - intent_height / 2;
    		draw();
    	}
    }
    else if (withNewWire) {
    	wires[wires.length - 1].x = Math.floor(x / unit_width);
    	wires[wires.length - 1].y = Math.floor(y / unit_height);
    	draw();
    }
    else {
    	let i;
    	for (i = 0; i < wires.length; i++) {
    		ctx.beginPath();
    		let wire = wires[i];
			let inputX = getInSocket(wire.input).x + 1;
			let inputY = getInSocket(wire.input).y + 1;;
			let outputX = getOutSocket(wire.output).x + 1;
			let outputY = getOutSocket(wire.output).y + 1;
			let middleX = outputX + (inputX - outputX) / 2;
			let middleY = outputY + (inputY - outputY) / 2;
			ctx.moveTo(outputX * unit_width, outputY * unit_height);
			ctx.quadraticCurveTo(outputX * unit_width, (outputY + 5) * unit_height, middleX * unit_width, middleY * unit_height);
			ctx.quadraticCurveTo(inputX * unit_width, (inputY - 5) * unit_height, inputX * unit_width, inputY * unit_height);
			if (ctx.isPointInStroke(x, y)) {
				wireHover = i;
				boxHover = -1;
				break;
			}
    	}
    	if (i == wires.length)
    		wireHover = -1;
    	if (wireHover == -1) {
	    	for (i = 0; i < intents.length; i++) {
	    		let _x = intents[i].x;
	    		let _y = intents[i].y;
	    		if (x > _x * unit_width && x < _x * unit_width + intent_width * unit_width
	    			&& y > _y * unit_height && y < _y  * unit_height + intent_height * unit_height) {
	    			boxHover = i;
	    			break;
	    		}
	    	}
	    	if (i == intents.length)
	    		boxHover = -1;
	    }
	    draw();
    }
});



new_intent.onclick = (e) => {
	withNewBox = 1;
};

delete_intent.onclick = (e) => {
	if (boxLockHover > -1) {
		intents.splice(boxLockHover, 1);
		intent_infos.splice(boxLockHover, 1);
		preprocs.splice(boxLockHover, 1);
		branches.splice(boxLockHover, 1);
		let i;
		for (i = 0; i < wires.length; i++) {
			if (wires[i].input == boxLockHover || wires[i].output == boxLockHover) {
				wires.splice(i, 1);
				i--;
			}
			else if (wires[i].input > boxLockHover || wires[i].output > boxLockHover) {
				if (wires[i].input > boxLockHover) {
					wires[i].input--;
				}
				if (wires[i].output > boxLockHover) {
					wires[i].output--;
				}
			}
		}
		boxLockHover = -1;
		clearPanel();
	}
	else if (wireLockHover > -1) {
		wires.splice(wireLockHover, 1);
		wireLockHover = -1;
	}
	draw();
};

preproc.onclick = (e) => {
	if (boxLockHover > -1) {
		preprocs[boxLockHover] = 1;
		setPanel(boxLockHover);
		draw();
	}
}

delete_preproc.onclick = (e) => {
	if (boxLockHover > -1) {
		preprocs[boxLockHover] = 0;
		intent_infos[boxLockHover].preproc = "";
		setPanel(boxLockHover);
		draw();
	}
}

branch.onclick = (e) => {
	if (boxLockHover > -1) {
		branches[boxLockHover]++;
		intent_infos[boxLockHover].branches.push("");
		setPanel(boxLockHover);
		draw();
	}
}

delete_branch.onclick = (e) => {
	if (boxLockHover > -1 && branches[boxLockHover] > 1) {
		branches[boxLockHover]--;
		intent_infos[boxLockHover].branches.pop();
		setPanel(boxLockHover);
		draw();
	}
}

make_launch.onclick = (e) => {
	if (boxLockHover > -1)
		launchRequestIntent = boxLockHover;
}

//get relative coordinate in canvas
function getMouse(e) {
	var rect = canvas.getBoundingClientRect();
	// console.log(e.clientX - rect.left);
	// console.log(e.clientY - rect.top);
	return {
	  x: e.clientX - rect.left,
	  y: e.clientY - rect.top
	};
}

function getOutSocket(i) {
	let x = intents[i].x + intent_width / 2 - 1;
	let y;
	if (preprocs[i] == 0 && branches[i] == 0) {
		y = intents[i].y + intent_height;
	}
	else if (preprocs[i] == 0) {
		y = intents[i].y + intent_height + branch_bus + branch_height + output_bus;
	}
	else {
		y = intents[i].y + intent_height + preproc_bus + preproc_rad * 2 + branch_bus + branch_height + output_bus;
	}
	return {x: x, y: y};
}

function getInSocket(i) {
	let x = intents[i].x + intent_width / 2 - 1;
	let y = intents[i].y - 2;
	return {x: x, y: y};
}

draw();

addSlotValue.onclick = (e) => {
	let name = slotName.value;
	let type = slotType.value;
	let value = slotValue.value;
	if (name == '' || value == '' || type == '')
		return;
	var i;
	for (i = 0; i < slots.length; i++) {
		if (slots[i].name == name) {
			var j;
			for (j = 0; j < slots[i].values.length; j++) {
				if (slots[i].values[j] == value)
					break;
			}
			if (j == slots[i].values.length) {
				slots[i].values.push(value);
			}
			break;
		}
	}
	if (i == slots.length) {
		let values = [];
		values.push(value);
		slots.push({name: name, type: type, values: values});
	}

	console.log(slots);
};

function setPanel(i) {
	if (utt_text == null) {
		utt_text = document.createElement("TEXTAREA");
		utt_text.id = "utt_text";
		utt_panel.parentNode.insertBefore(utt_text, utt_panel.nextSibling);
	}
	utt_text.value = intent_infos[i].utt;
	utt_text.oninput = (e) => {
		intent_infos[i].utt = utt_text.value;
		//console.log(intent_infos[i].utt);
	};

	if (preproc_text == null && preprocs[i] == 1) {
		preproc_text = document.createElement("TEXTAREA");
		preproc_text.id = "preproc_text";
		preproc_panel.parentNode.insertBefore(preproc_text, preproc_panel.nextSibling);
	}
	if (preproc_text != null && preprocs[i] == 1) {
		preproc_text.value = intent_infos[i].preproc;
		preproc_text.oninput = (e) => {
			intent_infos[i].preproc = preproc_text.value;
			//console.log(intent_infos[i].utt);
		};
	}

	if (preproc_text != null && preprocs[i] == 0) {
		preproc_text.parentNode.removeChild(preproc_text);
		preproc_text = null;
	}
	let branch_regex = /branches_panel_[0-9]+/;
	//console.log(branch_regex.test("branches_panel_0"));
	var all = intent_panel.childNodes;
	var temp = [];

	for (let k = 0; k < all.length; k++) {
		temp.push(all[k]);
	}

	let j;

	for (j = 0; j < temp.length; j++) {
		//console.log("find ", temp[j].id);
	     if (branch_regex.test(temp[j].id)) {
	     	//console.log("remove ", temp[j].id);
	     	temp[j].parentNode.removeChild(temp[j]);
	     	//console.log(temp);
	     }
	}

	let k = intent_infos[i].branches.length - 1;

	//console.log(k);

	for (j = 0; j < branches[i]; j++) {
		let id = "branches_panel_" + j;
		let branch_text = document.createElement("TEXTAREA");
		branch_text.id = id;
		//console.log(intent_infos[i].branches);
		branch_text.value = intent_infos[i].branches[k];
		//console.log("added ", id);
		branches_panel.parentNode.insertBefore(branch_text, branches_panel.nextSibling);
		let _k = k;
		branch_text.oninput = (e) => {
			intent_infos[i].branches[_k] = branch_text.value;
			//console.log(intent_infos[i].branches);
		};
		k--;
	}
}

function clearPanel() {
	if (utt_text != null) {
		utt_text.parentNode.removeChild(utt_text);
		utt_text = null;
	}
	if (preproc_text != null) {
		preproc_text.parentNode.removeChild(preproc_text);
		preproc_text = null;
	}
	let branch_regex = /branches_panel_[0-9]+/;
	//console.log(branch_regex.test("branches_panel_0"));
	var all = intent_panel.childNodes;
	var temp = [];

	for (let k = 0; k < all.length; k++) {
		temp.push(all[k]);
	}

	let j;

	for (j = 0; j < temp.length; j++) {
		//console.log("find ", temp[j].id);
	     if (branch_regex.test(temp[j].id)) {
	     	//console.log("remove ", temp[j].id);
	     	temp[j].parentNode.removeChild(temp[j]);
	     	//console.log(temp);
	     }
	}
}

submit.onclick = (e) => {
	finalProcess();
};

/*
	finalData = {
		intents: [{stage: int, parentStages: [], utt: [], preproc: "", branches: []}, ...],
		slots: [{name: "", values: []}, ...],
		launchRequest: int
	}
*/

function finalProcess() {
	//finalData = {a: 1};
	finalData = { intents: [], slots: slots, launchRequest: launchRequestIntent, gintents: intents, gwires: wires, gpreprocs: preprocs, gbranches: branches, gintent_infos: intent_infos };
	let i;
	for (i = 0; i < intents.length; i++) {
		finalData.intents.push({ stage: i, parentStages: [], utt: [], preproc: intent_infos[i].preproc, branches: [] });
	}
	for (i = 0; i < wires.length; i++) {
		finalData.intents[wires[i].input].parentStages.push(wires[i].output);
	}
	for (i = 0; i < intents.length; i++) {
		finalData.intents[i].utt = intent_infos[i].utt.split("\n");
		finalData.intents[i].branches = intent_infos[i].branches;
	}
	console.log(finalData);
	send();
}

function send() {
	submit_value.value = JSON.stringify(finalData);
	submit.submit();
}
