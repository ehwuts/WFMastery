WFMastery = (function (srcData) {
	var data = {};
	var categories = {};
	var o = {};
	var config_mastered = false;
	var config_founder = false;
	var show_code = false;
	var mastery_gained = 0;
	var can_save = false;
	var state = {};

	o.test = function () { console.log("config_mastered", config_mastered, "config_founder", config_founder, "can_save", can_save); }
	o.getState = () => { return state; }

	function toggle(e) {
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
		if (!classes.contains("config")) {
			var counter = t.parentElement.children[2];
			var counted = counter.innerText.split("/");
			counted[0] = (counted[0]|0) + (result ? 1 : -1);
			counter.innerText = counted[0] + "/" + counted[1];
			if (category) {
				let e = document.getElementById("mastery_gained");
				e.innerText = (e.innerText|0) + (result ? categories[category] : - categories[category]);
				state[category][ident[2]] = result ? 1 : 0;
			}
		}
		return result;
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

	function reset_entries() {
		let checked = document.getElementsByClassName("checked");
		for (let i = checked.length - 1; i >= 0; i--) {
			checked[i].click();
		}
	}
	function serialize_base() {
		let cache = {
			"config_mastered": config_mastered,
			"config_founder": config_founder,
			"items" : {}
		};
		
		//JSON stringify treats TypedArrays as objects which triples output size
		//so first, convert to generics
		let keys = Object.keys(state);
		let I = keys.length;
		for (let i = 0; i < I; i++) {
			cache.items[keys[i]] = Array.from(state[keys[i]]);
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
		let s = JSON.parse(input);
		
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
						e.click();
					}
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
	function create_category(category, length) {
		document.getElementById("listings").innerHTML += "<div class=\"category\" id=\"c_" + category + "\"><hr><strong class=\"category_name\">" + category + "</strong> - <span class=\"category_counter\">" + 0 + "/" + length + "</span><br></div>";
	}
	function initLayout() {
		var mastery_possible = 0;
		let I = data.categories.length;
		for (let i = 0; i < I; i++) {
			let category = data.categories[i].category;
			let items = data.categories[i].items;
			//bookkeeping helper
			categories[category] = data.categories[i].mastery;
			//alphabeticize the data
			items.sort();
			
			let J = items.length;			
			mastery_possible += data.categories[i].mastery * J;
			create_category(category, J);
			
			if (typeof state[category] !== "undefined") {
				console.log("Warning: Duplicate item category '" + category + "' during initialization. This WILL break things.");
			}
			//TypedArrays have the speed
			state[category] = new Int8Array(J).fill(0);
			
			for (let j = 0; j < J; j++) {
				create_button(category, items[j]);
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
	}

	function initData() {
		try {
			data = this.response;
			initLayout();
		} catch (e) {
			console.log("Failed to load item lists, panic!");
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