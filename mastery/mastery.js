WFMastery = (function (srcData) {
	var data = {};
	var categories = {};
	var o = {};
	var element_completion_gained = null;
	var config_mastered = false;
	var config_founder = false;
	var show_code = false;
	var mastery_possible = 0;
	var mastery_gained = 0;
	var completion_possible = 0;
	var completion_gained = 0;
	var can_save = false;
	var state_sliders = {};
	var state_categories = {};
	var state = {};

	o.test = function () { console.log("config_mastered", config_mastered, "config_founder", config_founder, "can_save", can_save); }
	o.getState = () => { return state; }

	function toggle(e, redraw = true) {
		var result = false;
		var t = e.target;
		var ident = t.id.split("_");
		var category = ident[1];
		var classes = t.classList;
		if (classes.contains("checked")) {
			classes.remove("checked");
			classes.remove("hide");
		} else {
			classes.add("checked");
			if (config_mastered && !classes.contains("config") && !(config_founder && classes.contains("founder"))) {
				classes.add("hide");
			}
			result = true;
		}
		if (!classes.contains("config") && category) {
			let direction = (result ? 1 : -1);
			completion_gained += direction;
			state_categories[category].current += direction;
			state[category][ident[2]] = result ? 1 : 0;
			
			let delta = result ? categories[category] : - categories[category];
			if (classes.contains("r40")) {
				delta *= 4 / 3;
			}
			mastery_gained += delta;
			
			if (redraw) {
				update_mastery_display();
				element_completion_gained.innerText = completion_gained;
				document.getElementById("category_" + category + "_gained").innerText = state_categories[category].current;
			}
		}
		return result;
	}
	function update_all_summaries() {
		element_completion_gained.innerText = completion_gained;
		update_mastery_display();
		
		let keys = Object.keys(state_categories);
		let I = keys.length;
		for (let i = 0; i < I; i++) {
			document.getElementById("category_" + keys[i] + "_gained").innerText = state_categories[keys[i]].current;
		}
	}

	//whee code duplication
	function toggle_founder(e) {
		config_founder = toggle(e);
		let founded = document.getElementsByClassName("founder");
		let I = founded.length;
		for (let i = 0; i < I; i++) {
			if (config_founder && !founded[i].classList.contains("config")) {
				founded[i].classList.add("hide");
			} else if (!(config_mastered && founded[i].classList.contains("checked"))) {
				founded[i].classList.remove("hide");
			}
		}
	}
	function toggle_mastered(e) {
		config_mastered = toggle(e);
		let mastered = document.getElementsByClassName("checked");
		let I = mastered.length;
		for (let i = 0; i < I; i++) {
			if (config_mastered && !mastered[i].classList.contains("config")) {
				mastered[i].classList.add("hide");
			} else if (!(config_founder && mastered[i].classList.contains("founder"))) {
				mastered[i].classList.remove("hide");
			}
		}
	}
	function toggle_show_code(e) {
		show_code = toggle(e);
		classes = document.getElementById("wrap_code").classList;
		if (show_code) {
			classes.remove("hide");
		} else {
			classes.add("hide");
		}
	}
	function select_all(e) {
		let t = e.target;
		let category = t.id.split("_")[2];
		let category_contents = document.getElementById("c_" + category).children;
		let I = category_contents.length;
		for (let i = 2; i < I; i++) {
			let classes= category_contents[i].classList;
			if (!classes.contains("checked") && (!config_founder || !classes.contains("founder"))) {
				toggle({ "target": category_contents[i] }, false);
			}
		}
		update_all_summaries();
	}
	//wheee code duplication
	function invert_all(e) {
		let t = e.target;
		let category = t.id.split("_")[2];
		let category_contents = document.getElementById("c_" + category).children;
		let I = category_contents.length;
		for (let i = 2; i < I; i++) {
			if (!config_founder || !category_contents[i].classList.contains("founder")) {
				toggle({ "target": category_contents[i] }, false);
			}
		}
		update_all_summaries();
	}
	function update_slider(e) {
		let t = e.target;
		let parts = t.id.split("_");
		let counter = document.getElementById("slider_amount_" + parts[1]);
		counter.innerText = "" + t.value + "/" + counter.innerText.split("/")[1];
		
		let slider = data.sliders[state_sliders[parts[1]].id];
		
		if (slider.total) {
			var points_old = state_sliders[parts[1]].value;
			points_old = Math.round(slider.total * points_old / slider.count);
			var points_new = Math.round(slider.total * t.value / slider.count);
		} else {
			var points_old = state_sliders[parts[1]].value * slider.value;
			var points_new = t.value * slider.value;
		}
		
		state_sliders[parts[1]].value = t.value;
		mastery_gained += (points_new - points_old);
		update_mastery_display();
	}
	function fudge_slider(name, value) {
		let t = document.getElementById("slider_" + name);
		t.value = value;
		update_slider({ "target": t });
	}
	function update_mastery_display() {
		document.getElementById("mastery_gained").innerText = mastery_gained;
		let rank_gained = rank_from_mastery(mastery_gained);
		let rank_need = mastery_from_rank(rank_gained + 1) - mastery_gained;
		let estimate = Math.ceil(rank_need / 3000);
		document.getElementById("rank_gained").innerText = rank_gained;
		document.getElementById("rank_need").innerText = "(" + rank_need + " points until MR" + (rank_gained + 1) + ", roughly " + estimate + " weapon" +(estimate == 1 ? "" : "s")+")";
		
	}
	
	function rank_from_mastery(x) {
		return Math.floor(Math.sqrt(x / 2500));
	}
	function mastery_from_rank(x) {
		return 2500 * x * x;
	}
	function sort_items(a, b) {
		a = a[0].toLowerCase();
		b = b[0].toLowerCase();
		if (a == b) {
			return 0;
		} else if (a.startsWith(b) || b < a) {
			return 1;
		} else {
			return -1;
		}
	}

	function reset_entries() {
		let checked = document.getElementsByClassName("checked");
		for (let i = checked.length - 1; i >= 0; i--) {
			toggle({ "target": checked[i] }, false);
		}
		update_all_summaries();
		let keys = Object.keys(state_sliders);
		let I = keys.length;
		for (let i = 0; i < I; i++) {
			fudge_slider(keys[i], 0);
		}
	}
	function serialize_base() {
		let cache = {
			"config_mastered": config_mastered,
			"config_founder": config_founder,
			"items": {},
			"sliders": {}
		};
		
		//JSON stringify treats TypedArrays as objects which triples output size
		//so first, convert to generics
		let keys = Object.keys(state);
		let I = keys.length;
		for (let i = 0; i < I; i++) {
			cache.items[keys[i]] = Array.from(state[keys[i]]);
		}
		keys = Object.keys(state_sliders);
		I = keys.length;
		for (let i = 0; i < I; i++) {
			cache.sliders[keys[i]] = state_sliders[keys[i]].value;
		}
		
		return JSON.stringify(cache);
	}
	function save() {
		if (can_save) {
			window.localStorage.setItem("state", serialize_base());
		} else {
			console.log("wutrudoin callin save() after init failed to find localStorage and disabled the button");
		}
	}
	function deserialize_base(input) {
		if (!input) {
			//input = "{\"items\":{}}";
			return;
		}
		try {
			var s = JSON.parse(input);
		} catch (e) {
			console.log("Failed parse save data.");
			console.log(e);
			return;
		}
		
		document.getElementById("config_reset").click();
		
		if (s.config_mastered) {
			document.getElementById("config_mastered").click();
		}
		if (s.config_founder) {
			document.getElementById("config_founder").click();
		}
		
		let keys = Object.keys(s.items);
		let I = keys.length;
		for (let i = 0; i < I; i++) {
			let category = s.items[keys[i]];
			let J = category.length;
			for (let j = 0; j < J; j++) {
				if (category[j]) {
					let e = document.getElementById("i_" + keys[i] + "_" + j);
					if (e) {
						toggle({ "target": e }, false);
					}
				}
			}
		}
		update_all_summaries();
		if (s.sliders) {
			keys = Object.keys(s.sliders);
			I = keys.length;
			for (let i = 0; i < I; i++) {
				if (state_sliders[keys[i]]) {
					fudge_slider(keys[i], s.sliders[keys[i]]);
				}
			}
		}
	}
	function load() {
		if (can_save) {
			deserialize_base(window.localStorage.getItem("state"));
		} else {
			console.log("wutrudoin callin load() after init failed to find localStorage and disabled the button");
		}
	}
	function export_state() {
		document.getElementById("config_code").value = serialize_base();
	}
	function import_state() {
		deserialize_base(document.getElementById("config_code").value);
	}

	function create_button(category, item) {
		var e = document.getElementById("c_" + category);
		var id = "i_" + category + "_" + item[1];
		var classes = "button";
		if (item[2]) {
			classes += " " + item[2].join(" ");
		}
		e.innerHTML += "<div class=\"" + classes + "\" id=\"" + id + "\">" + item[0] + "</div>";
	}
	function create_category(category) {
		document.getElementById("listings").innerHTML += "<div class=\"category\" id=\"c_" + category + "\"><hr><div class=\"category_header\"><strong class=\"category_name\">" + category + "</strong> - <span id=\"category_" + category + "_gained\">" + 0 + "</span>/<span id=\"category_"+ category +"_possible\">" + state_categories[category].max + "</span> <div class=\"button config\" id=\"config_all_" + category + "\">Select All</div><div class=\"button config\" id=\"config_invert_" + category + "\">Invert Selections</div></div></div>";
	}
	function create_slider(slider, id) {
		state_sliders[slider.name] = { "value" : 0, "id" : id };
		document.getElementById("sliders").innerHTML += 
		"<div>" + slider.name + " - <span id=\"slider_amount_" + slider.name + "\">0/" + slider.count + "</span><br><input type=\"range\" class=\"slider\" id=\"slider_" + slider.name + "\" value=\"0\" min=\"0\" max=\"" + slider.count + "\"></div>";
	}
	function initLayout() {
		document.getElementById("patch").innerText = data.patch;
		mastery_possible = 0;
		let I = data.categories.length;
		for (let i = 0; i < I; i++) {
			let category = data.categories[i].category;
			let items = data.categories[i].items;
			//bookkeeping helper
			categories[category] = data.categories[i].mastery;
			//alphabeticize the data
			items.sort(sort_items);
			
			let J = items.length;			
			mastery_possible += data.categories[i].mastery * J;
			state_categories[category] = { "current": 0, "max": J };
			create_category(category);
			
			if (typeof state[category] !== "undefined") {
				console.log("Warning: Duplicate item category '" + category + "' during initialization. This WILL break things.");
			}
			//TypedArrays have the speed
			state[category] = new Int8Array(J).fill(0);
			
			for (let j = 0; j < J; j++) {
				if (items[j][2] && items[j][2].indexOf("r40") !== -1) {
					mastery_possible += data.categories[i].mastery / 3;
				}
				create_button(category, items[j]);
				completion_possible ++;
			}
		}
		document.getElementById("completion_possible").innerText = completion_possible;
		
		I = data.sliders.length;
		for (let i = 0; i < I; i++) {
			let slider = data.sliders[i];
			create_slider(slider, i);
			if (slider.total) {
				mastery_possible += slider.total;
			} else {
				mastery_possible += slider.count * slider.value;
			}
		}
		
		document.getElementById("mastery_possible").innerText = mastery_possible;
		
		//blanket assign generic toggle then overwrite configs with their customs
		//because other assignment orders were mysteriously broken
		var buttons = document.getElementsByClassName("button");
		I = buttons.length;
		for (let i = 0; i < I; i++) {
			buttons[i].onclick = toggle;
		}
		document.getElementById("config_founder").onclick = toggle_founder;
		document.getElementById("config_mastered").onclick = toggle_mastered;
		document.getElementById("config_reset").onclick = reset_entries;
		document.getElementById("config_export").onclick = export_state;
		document.getElementById("config_import").onclick = import_state;
		document.getElementById("config_show_code").onclick = toggle_show_code;
		
		let keys = Object.keys(state);
		I = keys.length;
		for (let i = 0; i < I; i++) {
			document.getElementById("config_all_" + keys[i]).onclick = select_all;
			document.getElementById("config_invert_" + keys[i]).onclick = invert_all;
		}
		
		var sliders = document.getElementsByClassName("slider");
		I = sliders.length;
		for (let i = 0; i < I; i++) {
			sliders[i].onchange = update_slider;
			sliders[i].oninput = update_slider;
		}
		
		//check that localstorage is even a thing for local persistance
		if (!!window.localStorage) {
			can_save = true;
			document.getElementById("config_save").onclick = save;
			document.getElementById("config_load").onclick = load;
		} else {
			let e = document.getElementById("config_save");
			e.onclick = undefined;
			e.classList.add("hide");
			e = document.getElementById("config_load");
			e.onclick = undefined;
			e.classList.add("hide");
		}
		
		//cache this element since profiling showed its lookup was devouring time
		element_completion_gained = document.getElementById("completion_gained");
	}

	function initData() {
		try {
			data = this.response;
			initLayout();
		} catch (e) {
			console.log("Error during initialization, panic!");
			console.log(e);
		}
	}

	o.init = function () {
		var request = new XMLHttpRequest();
		request.open("GET", srcData);
		request.responseType = "json";
		request.onload = initData;
		request.send();
	}

	return o;
})("mastery/mastery_data.json");


window.addEventListener("load", () => { WFMastery.init(); });