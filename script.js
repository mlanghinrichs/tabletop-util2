$(document).ready(function() {
	//fix main page bg width & height
	$("#mainbg").css("width", screen.width);
	$("#bg").load(function() {
		$("#main").css("height", $(this).height());
	});
	
	//on clicking a selection in regiongen, make it 'selected'
	$(".typeselect").click(function() {
		if (!($(this).hasClass("selected"))) {
			$(".typeselect").removeClass("selected");
		}
		$(this).toggleClass("selected");
		});
	$(".techselect").click(function() {
		if (!($(this).hasClass("selected"))) {
			$(".techselect").removeClass("selected");
		}
		$(this).toggleClass("selected");
		});
	//whenever you change a regiongen field, make sure the rest are still legal
	$("input").change(function() { 
		regiongen.checkFields();
		});
	//toggle rows of utilities
	/*$(".toggler").click(function() {
		$($(this).next()).slideToggle("slow"); //NB: toggles divs WITHIN subdiv for aesthetics
		});*/
	//make utility linkblocks fade in/out
	$(".linkblock").hover(
		function() {
			$(this).fadeTo("fast", 1);
			},
		function() {
			$(this).fadeTo("fast", 0.75);
			});
	});

var random = {
	roll: function(quantity, type, modifier) { //Returns the result of a die roll as a number
		if (typeof quantity === "string") {							//if the input is of the format "XdX+/-X":
			var type;													//initialize...
			var modifier;
            if (quantity.search(/[\+]/)) {								//if it finds a '+':
                type = Number(quantity.split("d")[1].split("+")[0])			//the type is what's after the d, before the +
				modifier = Number(quantity.split("+")[1]);					//the modifier is what's after the +
            } else if (quantity.search(/[\-]/)) {						//if it finds a '-':
                modifier = Number(quantity.split("-")[1]);					//the modifier is what's after the -...
                modifier = 0 - modifier;									//made negative
				type = Number(quantity.split("d")[1].split("-")[0])			//and the type is after the d, before the -
            } else {
                alert("invalid string.");
            }
			var quantity = Number(quantity.split("d")[0]);				//Finally, quantity is before d no matter what
		}
		
		var total = modifier; 										//(so we don't have to add at the end)
		for (var c = 0; c < quantity; c++) {						//'num' times,
			total += Math.floor(Math.random() * (type) + 1); 		//add an individual die roll to total
		}
		return total; 												//And return the sum
	},
	rollToArray: function(quantity, type, modifier, numberRolls) { //Returns an array with [numberRolls] number of die rolls
		var arr = [];
		for (var c = 0; c < numberRolls; c++) {
			arr = arr.concat(this.roll(quantity, type, modifier));
		}
		return arr;
	},
	arrayValue: function(array) { //returns a random value from an array
		return array[Math.floor(Math.random() * array.length)];
	}
};
var html = {
	toggler: function(titleText, id, whereToPend, apOrPre, linkblock) {
		var txt = "<span id='" + id + "' class='toggler' onClick=\"$($(this).next()).slideToggle(\'slow\')\"><br><h2>" + titleText.charAt(0).toUpperCase() + titleText.slice(1) + "</h2></span>";
		txt += "<div id='" + id + "subdiv'>"
			if (linkblock) {
				txt += "<div class='linkblockholder'></div>"
			}
		txt += "</div>";
		if (apOrPre === "prepend") {
			$(whereToPend).prepend(txt);
		} else {
			$(whereToPend).append(txt);
		}
	},
	linkBox: function(obj) { //link, title, text, holderIdentifier, id, bgimg
		var txt = "<a href='" + obj.id + ".htm'>";
			txt += "<div class='linkblock' id='" + obj.id + "'>";
				txt += "<h3>" + obj.title + "</h3>";
				txt += "<p>" + obj.text + "</p>";
			txt += "</div></a>";
		$(obj.holderIdentifier + "subdiv .linkblockholder").append(txt);
		$("#" + obj.id).css("background-image", "url('resources/" + obj.id + ".jpg')");
	},
	regiondiv: function(type, regObj, containerIdentifier, hiddenOrBlank, apOrPre) { //NOTE: appends by default, prepends if specified
		
		if (type === "default") {
			var txt = "<div class='regionoutput' id='regDefault'>";
					txt += "<br><br><br><br><br><br><br><br><br><br><br><br>";
					txt += "[ Select a type to begin. ]";
				txt += "</div>";
			$(containerIdentifier).append(txt);
			return;
		}
		
		var txt = "<div class='regionoutput " + hiddenOrBlank + "'>";
		txt += "<div class='outputheader'>";
			txt += "<h2>" + regObj.type + "</h2>";
			txt += "<h3 style='text-align: center; width: 50%; margin: auto; font-size: 25px;'>" + regObj.description + "</h3>";
		txt += "</div>";
		
		switch (type) {
			case "city":
				txt += "<div id='" + regObj.id + "stats'>";
					txt += "<table id='" + regObj.id + "statoutput' class='statoutput'>";
					txt += "<tr>";
						var THs = ["Food Service", "Clothiers", "Personal Service", "Artisans", "Cultural", "Maintenance"];
						for (var c = 0; c < THs.length; c++) {
							txt += "<th>" + THs[c] + "</th>";
						}
					txt += "</tr><tr>";
						var occs = ["Food Service", "Clothiers", "Personal Service", "Artisans", "Cultural", "Maintenance"];
						for (var c = 0; c < occs.length; c++) {
							txt += "<td>";
							var occ = occs[c];
							var subtxt = "<div style='height: 100%;'>";
							for (var d in regObj[occ]) {
								if (regObj[occ][d]) {
									subtxt += "<div style='display: inline-block; float: right; width: 60px; text-align: center;'>" + regObj[occ][d] + "</div><div style='display: inline-block; float: right;'>" + d + ":</div><br>"; //NOTE: this divs are backwards of how they display since they're floating right
								}
							}
							subtxt += "</div></td>";
							txt += subtxt;
						}
						
					txt += "</tr>";
					txt += "</table>";
				txt += "</div>";
				break;
			}
		txt += "</div>";
		
		html.toggler(type + " (" + regObj.name + ")", regObj.id, containerIdentifier, apOrPre);
		
		if (apOrPre === "prepend") {
			$("#" + regObj.id + "subdiv").prepend(txt);
		} else {
			$("#" + regObj.id + "subdiv").append(txt);		
		}
	}
}

var regiongen = {
	counter: 0,

	//Functions for each button on the page (button name, type or tech)
	button: function(buttonName, typeortech) { 
		var type;
		var tech;
		
		//(grab the currently selected type and tech if possible)
		if ($(".typeselect.selected").html() && $(".techselect.selected").html()) {
			var currentType = $(".typeselect.selected").html().toLowerCase();
			var currentTech = $(".techselect.selected").html().toLowerCase();
		}
		
		//Generate
		if (buttonName === "generate") {
			if (currentType && currentTech) {
				$("#regionoutput").empty();
				var region = this[currentType].generate(currentTech);
				this[currentType].populateFields(region);
				html.regiondiv(currentType, region, "#regionoutput");
			} else {
				alert("Please select a region type and technology level to generate.");
			}
			
		//Clear
		} else if (buttonName === "clear") {
			this.field("*input", "liberate");					//clear input fields
			$("#regionoutput").empty();							//empty div area
			html.regiondiv("default", {}, "#regionoutput");		//refill div area w/ default
			$(".techselect.selected").removeClass("selected");	//unselect tech buttons
			$(".typeselect.selected").removeClass("selected");	//unselect type buttons
			
		//Selector (being selected)
		} else if (!($("button:contains('" + buttonName.charAt(0).toUpperCase() + buttonName.slice(1) + "')").hasClass("selected"))) {//if button is being selected...
			//TYPES
			if (typeortech === "type") { 									//if it's a type button
				type = buttonName; 											//set the type to the button name
				$("#regionoutput").empty();											//empty div area
				html.regiondiv(type, regiongen[type].def, "#regionoutput", type);	//refill div area w/ type
				regiongen[type].fieldPrep("set"); 							//then make field labels match this type & close some fields
				if ($(".techselect").hasClass("selected")) { 				//if a tech button is selected is also selected
					tech = $(".techselect.selected").html().toLowerCase(); 	//grab what that tech is from the button lists
					regiongen[type].popDens("set", tech); 					//and fill fields fully!
				}
			//TECHS
			} else if (typeortech === "tech") { 							//if it's a tech button
				tech = buttonName; 											//set the tech to the button name
				if ($(".typeselect").hasClass("selected")) { 				//if a type button is selected is also selected
					type = $(".typeselect.selected").html().toLowerCase(); 	//grab that type from the button lists
					regiongen[type].popDens("set", tech); 					//and fill fields fully!
				}																//NB: if no type is selected, do nothing!
			}
		
		//Selector (being unselected)
		} else if ($("button:contains('" + buttonName.charAt(0).toUpperCase() + buttonName.slice(1) + "')").hasClass("selected")) {//if button is being unselected...
			//TYPES - resets input field labels, statistics headers
			if (typeortech === "type") {
				type = buttonName;
				regiongen[type].fieldPrep("reset");					//reset input fields & names
				$("#regionoutput").empty();							//empty div area
				html.regiondiv("default", {}, "#regionoutput");		//refill div area w/ default
			//TECHS
			} else if (typeortech === "tech") {
				tech = buttonName;
				if ($(".typeselect").hasClass("selected")) {									//if a type button is selected
					type = $(".typeselect.selected").html().toLowerCase();
					this[type].popDens("reset");
				}
			}
		}
	},
	
	//Open, close, or change value of <input> by name attribute or selector
	field: function(inputName, mode, val) {
		var input;
		if (inputName[0] === "*") { 					//if we have a wildcard, it's a proper jQuery selector
			input = inputName.slice(1);					//so chop off the asterisk
		} else { 										//otherwise, it's an input name
			input = "input[name=" + inputName + "]";	//so we wrap it properly
		}
		//modes
		switch(mode) {
			case "close": 							//'close' makes field readonly & grey
				$(input).attr("readonly", true);		//r-o
				$(input).addClass("greyed");			//grey
				break;
			case "open": 							//'open' undoes 'close'
				$(input).removeClass("greyed");			//grey
				$(input).removeAttr("readonly");		//r-o
				break;
			case "clear":							//'clear' wipes the field
				$(input).val("");						//wipe
				break;
				
			case "liberate":						//'liberate' both wipes & opens the field
				$(input).removeClass("greyed");			//ungrey
				$(input).removeAttr("readonly");		//unr-o
				$(input).val("");						//wipe
				break;	
			case "eradicate":						//'eradicate' both wipes & closes the field
				$(input).addClass("greyed");			//grey
				$(input).attr("readonly", true);		//r-o
				$(input).val("");						//wipe				
				break;
				
			case "change":							//'change' sets the input's value to val
				$(input).val(val);						//val set
				break;
		}
	},
	
	//Area / Pop / Pop Density value fixer
	changePopDensOn: true,
	checkFields: function() {
		var area = $("input[name='area']").val();
		var pop = $("input[name='pop']").val();
		var pop_dens = $("input[name='pop_dens']").val();
		var age = $("input[name='age']").val();
		var lsarea = $("input[name='lsarea']").val();
		var lspop = $("input[name='lspop']").val();
		
		//greying (only if 2 are filled, the third is empty, and the third isn't closed)
		if (area && pop && !pop_dens && !($("input").hasClass("greyed"))) {
			this.field("pop_dens", "close")
		} else if (area && pop_dens && !pop && !($("input").hasClass("greyed"))) {
			this.field("pop", "close")
		} else if (pop && pop_dens && !area && !($("input").hasClass("greyed"))) {
			this.field("area", "close")
		}
		//changing vals (only done once field is closed & only if )
		if (area && pop && $("input[name='pop_dens']").hasClass("greyed") && this.changePopDensOn) {
			this.field("pop_dens", "change", (pop / area));
		} else if (area && pop_dens && $("input[name='pop']").hasClass("greyed")) {
			this.field("pop", "change", (area * pop_dens));
		} else if (pop && pop_dens && $("input[name='area']").hasClass("greyed")) {
			this.field("area", "change", (pop / pop_dens));
		}
		//clearing (if something is closed/grey and there is any empty field - that is, if the user has cleared one of the fields they can edit)
		if (!($("input[name='area']").val() && $("input[name='pop']").val() && $("input[name='pop_dens']").val()) && $("input").hasClass("greyed")) {
			$("input.greyed").val("");
			$("input").removeClass("greyed");
			$("input").removeAttr("readonly");
		}
	},
	
	//Change input labels in Known Data section
	setInputNames: function(area, pop, popDens, age, lsArea, lsPop) {
		if (area === "default") {
			var arguments = ["* Area (sq. mi.):", "* Population:", "Pop. Density:", "Age (years):", "Largest Subregion (mi.):", "Largest Subregion Pop:"];
		}
		for (var c = 0; c < arguments.length; c++) { //for each arg, dump it into div 'c' within inputnames
			if (c !== undefined) {
				$("#inputnames div:eq(" + c + ")").html(arguments[c]);
			}
		}
	},

	//TYPE OBJECTS
	settlement: {
		outputDivID: "#regSettlement",
		fields: function(mode) {
			if (mode === "set") {
				regiongen.setInputNames("* Area (sq. mi.):", "* Population:", "Pop. Density:", "Age (years):", "Largest Holding (acr.):", "Largest Family:");
			} else {
				regiongen.setInputNames("default");
			}
		}
	},
	city: {
		outputDivID: "#regCity",
		def: {
			id: "default",
			type: "[City Type]",
			description: "[description]",
			name: "blank"
		},
		popDens: function(mode, tech) {
			if (mode === "set") {
				regiongen.field("pop_dens", "change", this[tech].pop_dens);
			} else {
				regiongen.field("pop_dens", "change", "");
			}
		},
		fieldPrep: function(mode) { //set or reset
			var fieldNames = ["area", "pop_dens", "lsarea", "lspop"];
			regiongen.field("*input", "open");
			
			if (mode === "set") {
				regiongen.setInputNames("Area (sq. mi.):", "* Population:", "Pop. Density:", "Age (years):", "Largest District (mi.):", "Largest District Pop.:");					
				for (var c=0; c<fieldNames.length; c++) { //eradicate each required field
					regiongen.field(fieldNames[c], "eradicate");
				}
			} else if (mode === "reset") {
				for (var c=0; c<fieldNames.length; c++) { //liberate each required field
					regiongen.field(fieldNames[c], "liberate");
				}
			}
		},
		populateFields: function(cityObject) {
			regiongen.changePopDensOn = false;
			var fieldNames = ["area", "pop", "pop_dens", "age", "lsarea", "lspop"];
			for (var c = 0; c < fieldNames.length; c++) {			//Set value for all input fields
				regiongen.field(fieldNames[c], "change", cityObject[fieldNames[c]]);
			}			
		},
		generate: function(tech, area, pop, pop_dens, age) {
			if (!($("input[name='pop']").val() || pop)) {
					alert("Please enter or pass a population value.");
					return;
			}
			
			var output = { archetype: "city" };
			
			//fill in the major stats
			if (!arguments[1]) {
				output.area = Number($("input[name='area']").val());
				output.pop = Number($("input[name='pop']").val());
				output.pop_dens = Number($("input[name='pop_dens']").val());
				output.age = ($("input[name='age']").val()) ? Number($("input[name='age']").val()):(random.roll(this[tech].ageDice) * 10);
			} else {
				output.area = area;
				output.pop = pop;
				output.pop_dens = pop_dens;
				output.age = age;
			};
			
			//get other misc stats
			output.lsarea = Math.round(100 * $("input[name='area']").val() * (random.roll(this[tech].lsareaDice) / 100)) / 100; //20% - 47% of whole, then round to 2 decimals
			output.lspop = output.lsarea ? Math.round(output.lsarea * $("input[name='pop_dens']").val()):0; //only make a pop if there's a region size
			output.livestock = Math.round(pop / (5/11)); //get livestock number
			
			var desc = this[tech].description(output.pop);
			output.type = desc.type;
			output.description = desc.description;
			
			output.id = output.type.replace(" ","") + regiongen.counter;
			output.name = String(regiongen.counter);
				regiongen.counter++;
			
			//get occupation data & dump it into named objects within output
			var occupations = ["Food Service", "Clothiers", "Personal Service", "Artisans", "Cultural", "Maintenance"];
				for (var c = 0; c < occupations.length; c++) { 	//for each of the 6 designations
					var occ = occupations[c];
					var object = {};
					for (var d in this[tech][occ]) {				//for each key in the obj for this occupation block...
						var num = output.pop / this[tech][occ][d];
						if (Math.random() <= (num - Math.floor(num))) {
							num++;
						}
						object[d] = Math.floor(num);
					}
					output[occ] = object;
				}
			
			//Finally, round every number in 'output' to 2 decimals...
			for (var c in output) {
					if (typeof output[c] === "number") {
						output[c] = Math.round(100 * output[c]) / 100;
					}
				}
			//And...
			return output;
		},
		
		//TECH OBJECTS
		primitive: { //needs better descriptions
			pop_dens: 10300,
			ageDice: "5d20+0",
			lsareaDice: "3d10+17",
			description: function(population) {
				var type;
				var description;
				if (population < 100) {
					type = "Small Village";
					description = "A tiny hamlet. The miniscule population keep only a few animals as livestock.";
				} else if (population < 600) {
					type = "Village";
					description = "Villages are agrarian communities within the safe folds of civilization. They provide the basic source of food and land-stability in a feudal system. Usually, a village that supports orchards (instead of grainfields) is called a hamlet.";
				} else if (population < 3000) {
					type = "Town";
					description = "Culturally, these are the equivalent to the smaller American cities that line the interstates. Cities and towns tend to have walls only if they are frequently threatened.";
				} else if (population < 7000) {
					type = "City";
					description = "A typical large kingdom will have only a few cities in this population range. Centers of culture and art tend to be in cities of this size.";
				} else if (population < 10000) {
					type = "Big City";
					description = "A city the size of the largest ancient settlements. Usually located at centers of travel and trade, and would leave behind a site of great cultural heritage.";
				} else {
					type = "Huge City";
					description = "A truly, obscenely large city for the era. An exceptional population center. Dobrovdy, the largest city in the world in the 4000s BC, had only 10,000 citizens.";
				}
				
				return {type: type, description: description};
			},
			
			//Occupation Statistics
			"Food Service": {
				"Bakers": 800,
				"Watercarriers": 850,
				"Wine-Sellers": 900,
				"Butchers": 1200,
				"Fishmongers": 1200,
				"Beer-Sellers": 1400,
				"Hay Merchants": 2300
			},
			"Clothiers": {
				"Shoemakers": 150,
				"Furriers": 250,
				"Weavers": 600,
				"Mercers": 700
			},
			"Personal Service": {
				"Healers": 1700,
				"Servants": 250,
			},
			"Artisans": {
				"Blacksmiths": 1500, 
				"Carpenters": 550,
				"Masons": 500,
				"Jewelers": 400,
				"Tanners": 2000,
				"Ropemakers": 1900,
				"Rugmakers": 2000,
				"Chandlers": 700
			},
			"Cultural": {
				"Herbalists": 2800,
				"Record Keepers": 3000,
				"Sculptors": 2000,
			},
			"Maintenance": {
				"Peacekeepers": 125,
				"Holy Men": 40,
				"Priests": 25 * 40,
				"Woodsellers": 2400,
				"Roofers": 1800,
				"Potters": 700
			}
		},
		fantasy: { //needs better descriptions
			pop_dens: 15000, //city of london ~1300
			ageDice: "5d20+0",
			lsareaDice: "3d10+17",
			description: function(population) {
				var type;
				var description;
				if (population < 20) {
					type = "Unrealistically Small Village";
					description = "A tiny hamlet, hardly even a settlement. The miniscule population keep only X animals as livestock.";
				} else if (population < 1000) {
					type = "Village";
					description = "Villages are agrarian communities within the safe folds of civilization. They provide the basic source of food and land-stability in a feudal system. Usually, a village that supports orchards (instead of grainfields) is called a hamlet.";
				} else if (population < 8000) {
					type = "Town";
					description = "Culturally, these are the equivalent to the smaller American cities that line the interstates. Cities and towns tend to have walls only if they are frequently threatened.";
				} else if (population < 12000) {
					type = "City";
					description = "A typical large kingdom will have only a few cities in this population range. Centers of scholarly pursuits tend to be in cities of this size.";
				} else if (population < 100000) {
					type = "Big City";
					description = "A city the size of the largest medieval capitols. Usually located at centers of travel and trade. Houses an obscene amount of livestock. Think of all the excrement.";
				} else {
					type = "Veritable Metropolis";
					description = "A truly, obscenely large city. An exceptional population center. The largest such medieval city was Moscow, with roughly 200,000 inhabitants.";
				}
				
				return {type: type, description: description};
			},
			//Occupation Statistics
			"Food Service": {
				"Taverns": 400,
				"Pastrycooks": 500,
				"Bakers": 800,
				"Watercarriers": 850,
				"Wine-Sellers": 900,
				"Chicker Butchers": 1000,
				"Butchers": 1200,
				"Fishmongers": 1200,
				"Beer-Sellers": 1400,
				"Spice Merchants": 1400,
				"Hay Merchants": 2300
			},
			"Clothiers": {
				"Shoemakers": 150,
				"Furriers": 250,
				"Tailors": 250,
				"Old-Clothes": 400,
				"Weavers": 600,
				"Mercers": 700,
				"Hatmakers": 950,
				"Pursemakers": 1100,
				"Glovemakers": 2400
			},
			"Personal Service": {
				"Inns": 2000,
				"Doctors": 1700,
				"Bathers": 1900,
				"Maidservants": 250,
				"Barbers": 350
			},
			"Artisans": {
				"Blacksmiths": 1500, 
				"Carpenters": 550,
				"Masons": 500,
				"Jewelers": 400,
				"Harness-Makers": 2000,
				"Bleachers": 2100,
				"Cutlers": 2300,
				"Woodcarvers": 2400,
				"Tanners": 2000,
				"Ropemakers": 1900,
				"Scabbardmakers": 850, 
				"Saddlers": 1000,
				"Buckle makers": 1400,
				"Rugmakers": 2000,
				"Chandlers": 700
			},
			"Cultural": {
				"Magic-shops": 2800,
				"Bookbinders": 3000,
				"Illuminators": 3900,
				"Booksellers": 6300,
				"Sculptors": 2000,
				"Copyists": 2000
			},
			"Maintenance": {
				"Lawkeepers": 125,
				"Nobles": 200,
				"Lawyers": 650,
				"Clergymen": 40,
				"Priests": 25 * 40,
				"Woodsellers": 2400,
				"Painters": 1500,
				"Roofers": 1800,
				"Plasterers": 1400,
				"Locksmiths": 1900,
				"Coopers": 700
			}
		},
		industrial: { //needs descriptions & occupation stats
			pop_dens: 19100, //manhattan 1855
			ageDice: "2d20+0",
			lsareaDice: "2d10+8",
			description: function(population) {
				var type;
				var description;
				if (population < 20) {
					type = "Unrealistically Small Village";
					description = "A tiny hamlet, hardly even a settlement. The miniscule population keep only animals as livestock.";
				} else if (population <= 1000) {
					type = "Village";
					description = "Villages are agrarian communities within the safe folds of civilization. They provide the basic source of food and land-stability in a feudal system. Usually, a village that supports orchards (instead of grainfields) is called a hamlet.";
				} else if (population <= 8000) {
					type = "Town";
					description = "Culturally, these are the equivalent to the smaller American cities that line the interstates. Cities and towns tend to have walls only if they are frequently threatened.";
				} else if (population <= 12000) {
					type = "City";
					description = "A typical large kingdom will have only a few cities in this population range. Centers of scholarly pursuits tend to be in cities of this size.";
				} else if (population <= 100000) {
					type = "Big City";
					description = "A city the size of the largest medieval capitols. Usually located at centers of travel and trade.";
				} else {
					type = "Veritable Metropolis";
					description = "A truly, obscenely large city. An exceptional population center. The largest such medieval city was Moscow, with roughly 200,000 inhabitants.";
				}
				
				return {type: type, description: description};
			},
			
			//Occupation Statistics
			"Food Service": {
				"Taverns": 400,
				"Pastrycooks": 500,
				"Bakers": 800,
				"Watercarriers": 850,
				"Wine-Sellers": 900,
				"Chicker Butchers": 1000,
				"Butchers": 1200,
				"Fishmongers": 1200,
				"Beer-Sellers": 1400,
				"Spice Merchants": 1400,
				"Hay Merchants": 2300
			},
			"Clothiers": {
				"Shoemakers": 150,
				"Furriers": 250,
				"Tailors": 250,
				"Old-Clothes": 400,
				"Weavers": 600,
				"Mercers": 700,
				"Hatmakers": 950,
				"Pursemakers": 1100,
				"Glovemakers": 2400
			},
			"Personal Service": {
				"Inns": 2000,
				"Doctors": 1700,
				"Bathers": 1900,
				"Maidservants": 250,
				"Barbers": 350
			},
			"Artisans": {
				"Blacksmiths": 1500, 
				"Carpenters": 550,
				"Masons": 500,
				"Jewelers": 400,
				"Harness-Makers": 2000,
				"Bleachers": 2100,
				"Cutlers": 2300,
				"Woodcarvers": 2400,
				"Tanners": 2000,
				"Ropemakers": 1900,
				"Scabbardmakers": 850, 
				"Saddlers": 1000,
				"Buckle makers": 1400,
				"Rugmakers": 2000,
				"Chandlers": 700
			},
			"Cultural": {
				"Magic-shops": 2800,
				"Bookbinders": 3000,
				"Illuminators": 3900,
				"Booksellers": 6300,
				"Sculptors": 2000,
				"Copyists": 2000
			},
			"Maintenance": {
				"Lawkeepers": 125,
				"Nobles": 200,
				"Lawyers": 650,
				"Clergymen": 40,
				"Priests": 25 * 40,
				"Woodsellers": 2400,
				"Painters": 1500,
				"Roofers": 1800,
				"Plasterers": 1400,
				"Locksmiths": 1900,
				"Coopers": 700
			}
		},
		modern: { //needs better occupation stats
			pop_dens: 27000, //nyc
			ageDice: "2d10+3",
			lsareaDice: "2d11+8",
			description: function(population) {
				var type;
				var description;
				if (population < 1600) {
					type = "Unincorporated Town";
					description = "A tiny town not officially recognized by the federal government. The locals are most likely uneducated, racist, and/or highly religious.";
				} else if (population < 5000) {
					type = "Village";
					description = "Villages are the smallest federally recognized population centers. Usually close communities who know each other well and try to deal with local problems themselves.";
				} else if (population < 100000) {
					type = "Town";
					description = "Akin to the smaller American cities that line the interstates. Usually have municipal government and enough retail to keep the place running or amuse tourists.";
				} else if (population < 10000000) {
					type = "City";
					description = "A typical large country will have only a few cities in this population range. Major universities, museums, and businesses are located in these cities.";
				} else if (population < 36000000) {
					type = "Megacity";
					description = "The largest centers of global trade and cultural development. Capitol cities of major nations are generally this size. Corporal HQs, major museums, and political/monetary centers are generally located in cities this size.";
				} else {
					type = "Unrealistic Metropolis";
					description = "A truly, obscenely huge population center, larger than any extant city on earth.";
				}
				
				return {type: type, description: description};
			},
			
			//Occupation Statistics
			"Food Service": {
				"Restaurants": 5700,
				"Bars": 9400,
				"Fast Food": 1200,
				"Food Processing": 6900
			},
			"Clothiers": {
				"Shopping Cent.": 4000,
				"Shopping Malls": 10900,
				"Drug Stores": 16400,
				"General Stores": 5400,
				"Other Stores": 3400
			},
			"Personal Service": {
				"Hotels": 1700,
				"Financial Offices": 10200,
				"Auto Sales": 16900,
				"Auto Service": 9100,
				"Parking Garages": 20700,
				"Airports": 2000000,
				"Hospitals": 2700,
				"Doctors' Offices": 5400,
				"Specialists": 6500
			},
			"Artisans": {
				"Hardware Stores": 10600,
				"Warehouses": 1900,
				"Textile Factory": 66700,
				"Wood Factory": 57000,
				"Print Factory": 32500,
				"Tech. Factory": 4300,
				"Rubber Factory": 16700
			},
			"Cultural": {
				"Preschools": 35800,
				"Elementary Sch.": 9300,
				"College Halls": 9000,
				"College Dorms": 20300,
				"Museums": 29900,
				"Churches &c.": 4900,
				"Parks": 36900,
				"Sports Centers": 25800,
				"Fitness Centers": 23900,
				"Meeting Centers": 37600,
				"Movie Theaters": 18800
			},
			"Maintenance": {
				"Police Stations": 65100,
				"Apartments": 100,
				"Houses": 1200,
				"Electric Station": 1200,
				"Gas Power St.": 5600,
				"Oil Power St.": 27400,
				"Waste Disposal": 54200,
				"Water Supply": 38600,
				"Power Plant": 21900,
				"Chemical Fact.": 7200,
				"Offices": 600,
				"Storage Places": 21800
			}
		},
		scifi: { //needs descriptions & occupation stats
			pop_dens: 63500,  //manhattan projected to 50-100 yrs
			ageDice: "1d10+5",
			lsareaDice: "2d11+8",
			description: function(population) {
				var type;
				var description;
				if (population < 20) {
					type = "Unrealistically Small Village";
					description = "A tiny hamlet, hardly even a settlement. The miniscule population keep only animals as livestock.";
				} else if (population <= 1000) {
					type = "Village";
					description = "Villages are agrarian communities within the safe folds of civilization. They provide the basic source of food and land-stability in a feudal system. Usually, a village that supports orchards (instead of grainfields) is called a hamlet.";
				} else if (population <= 8000) {
					type = "Town";
					description = "Culturally, these are the equivalent to the smaller American cities that line the interstates. Cities and towns tend to have walls only if they are frequently threatened.";
				} else if (population <= 12000) {
					type = "City";
					description = "A typical large kingdom will have only a few cities in this population range. Centers of scholarly pursuits tend to be in cities of this size.";
				} else if (population <= 100000) {
					type = "Big City";
					description = "A city the size of the largest medieval capitols. Usually located at centers of travel and trade.";
				} else {
					type = "Veritable Metropolis";
					description = "A truly, obscenely large city. An exceptional population center. The largest such medieval city was Moscow, with roughly 200,000 inhabitants.";
				}
				
				return {type: type, description: description};
			},
			
			//Occupation Statistics
			"Food Service": {
				"Taverns": 400,
				"Pastrycooks": 500,
				"Bakers": 800,
				"Watercarriers": 850,
				"Wine-Sellers": 900,
				"Chicker Butchers": 1000,
				"Butchers": 1200,
				"Fishmongers": 1200,
				"Beer-Sellers": 1400,
				"Spice Merchants": 1400,
				"Hay Merchants": 2300
			},
			"Clothiers": {
				"Shoemakers": 150,
				"Furriers": 250,
				"Tailors": 250,
				"Old-Clothes": 400,
				"Weavers": 600,
				"Mercers": 700,
				"Hatmakers": 950,
				"Pursemakers": 1100,
				"Glovemakers": 2400
			},
			"Personal Service": {
				"Inns": 2000,
				"Doctors": 1700,
				"Bathers": 1900,
				"Maidservants": 250,
				"Barbers": 350
			},
			"Artisans": {
				"Blacksmiths": 1500, 
				"Carpenters": 550,
				"Masons": 500,
				"Jewelers": 400,
				"Harness-Makers": 2000,
				"Bleachers": 2100,
				"Cutlers": 2300,
				"Woodcarvers": 2400,
				"Tanners": 2000,
				"Ropemakers": 1900,
				"Scabbardmakers": 850, 
				"Saddlers": 1000,
				"Buckle makers": 1400,
				"Rugmakers": 2000,
				"Chandlers": 700
			},
			"Cultural": {
				"Magic-shops": 2800,
				"Bookbinders": 3000,
				"Illuminators": 3900,
				"Booksellers": 6300,
				"Sculptors": 2000,
				"Copyists": 2000
			},
			"Maintenance": {
				"Lawkeepers": 125,
				"Nobles": 200,
				"Lawyers": 650,
				"Clergymen": 40,
				"Priests": 25 * 40,
				"Woodsellers": 2400,
				"Painters": 1500,
				"Roofers": 1800,
				"Plasterers": 1400,
				"Locksmiths": 1900,
				"Coopers": 700
			}
		},
		"post-scarcity": { //needs descriptions & occupation stats
			pop_dens: 80000,  //blatant guessing
			ageDice: "1d10+5",
			lsareaDice: "2d11+8",
			description: function(population) {
				var type;
				var description;
				if (population < 20) {
					type = "Unrealistically Small Village";
					description = "A tiny hamlet, hardly even a settlement. The miniscule population keep only animals as livestock.";
				} else if (population <= 1000) {
					type = "Village";
					description = "Villages are agrarian communities within the safe folds of civilization. They provide the basic source of food and land-stability in a feudal system. Usually, a village that supports orchards (instead of grainfields) is called a hamlet.";
				} else if (population <= 8000) {
					type = "Town";
					description = "Culturally, these are the equivalent to the smaller American cities that line the interstates. Cities and towns tend to have walls only if they are frequently threatened.";
				} else if (population <= 12000) {
					type = "City";
					description = "A typical large kingdom will have only a few cities in this population range. Centers of scholarly pursuits tend to be in cities of this size.";
				} else if (population <= 100000) {
					type = "Big City";
					description = "A city the size of the largest medieval capitols. Usually located at centers of travel and trade.";
				} else {
					type = "Veritable Metropolis";
					description = "A truly, obscenely large city. An exceptional population center. The largest such medieval city was Moscow, with roughly 200,000 inhabitants.";
				}
				
				return {type: type, description: description};
			},
			
			//Occupation Statistics
			"Food Service": {
				"Taverns": 400,
				"Pastrycooks": 500,
				"Bakers": 800,
				"Watercarriers": 850,
				"Wine-Sellers": 900,
				"Chicker Butchers": 1000,
				"Butchers": 1200,
				"Fishmongers": 1200,
				"Beer-Sellers": 1400,
				"Spice Merchants": 1400,
				"Hay Merchants": 2300
			},
			"Clothiers": {
				"Shoemakers": 150,
				"Furriers": 250,
				"Tailors": 250,
				"Old-Clothes": 400,
				"Weavers": 600,
				"Mercers": 700,
				"Hatmakers": 950,
				"Pursemakers": 1100,
				"Glovemakers": 2400
			},
			"Personal Service": {
				"Inns": 2000,
				"Doctors": 1700,
				"Bathers": 1900,
				"Maidservants": 250,
				"Barbers": 350
			},
			"Artisans": {
				"Blacksmiths": 1500, 
				"Carpenters": 550,
				"Masons": 500,
				"Jewelers": 400,
				"Harness-Makers": 2000,
				"Bleachers": 2100,
				"Cutlers": 2300,
				"Woodcarvers": 2400,
				"Tanners": 2000,
				"Ropemakers": 1900,
				"Scabbardmakers": 850, 
				"Saddlers": 1000,
				"Buckle makers": 1400,
				"Rugmakers": 2000,
				"Chandlers": 700
			},
			"Cultural": {
				"Magic-shops": 2800,
				"Bookbinders": 3000,
				"Illuminators": 3900,
				"Booksellers": 6300,
				"Sculptors": 2000,
				"Copyists": 2000
			},
			"Maintenance": {
				"Lawkeepers": 125,
				"Nobles": 200,
				"Lawyers": 650,
				"Clergymen": 40,
				"Priests": 25 * 40,
				"Woodsellers": 2400,
				"Painters": 1500,
				"Roofers": 1800,
				"Plasterers": 1400,
				"Locksmiths": 1900,
				"Coopers": 700
			}
		}
	},
	country: {
		outputDivID: "#regCountry",
		fields: function(mode) { //set or reset
			if (mode === "set") {
				regiongen.setInputNames("default");
			} else if (mode === "reset") {
			
			}
		}
	},
	planet: {
		outputDivID: "#regPlanet",
		fields: function(mode) { //set or reset
			if (mode === "set") {
				regiongen.setInputNames("*Surface Area (sq. mi.):", "* Population:", "Pop. Density:", "Age of Life (Earth years):", "Largest Continent (mi.):", "Largest Continent Pop.:");
			} else if (mode === "reset") {
			
			}
		}
	},
	system: {
		outputDivID: "#regSystem",
		fields: function(mode) { //set or reset
			if (mode === "set") {
				regiongen.setInputNames("* Planets:", "* Population:", "Avg. Population:", "Colonized for (years):", "Largest Planet Rad.:", "Largest Planet Pop.:");
			} else if (mode === "reset") {
			
			}
		}
	
	},
	sector: {
		outputDivID: "#regCountry",
		fields: function(mode) { //set or reset
			if (mode === "set") {
				regiongen.setInputNames("* Systems:", "* Population:", "Avg. Density:", "Controlled for (years):", "Largest System (plan.):", "Largest System Pop.:");
			} else if (mode === "reset") {
			
			}
		}
	}
};
var namegen = {
	red: 0
};




var place = {
	name: function(country, region, townType) {
		var txt = "";
		var ending = random.arrayValue(nameElements.endings[townType]);
		return txt;
	}
};
var nameElements = {
	astor: {
		malan: ["Tac(i)s", "Crass(an)", "Pent(ea)", "Ar(i)n", "Cyn(ing)", "Aesc", "Leit", "Sneg(h)", "Sar(in)", "Aster", "Sol", "Aelf", "Wulf", "Stan", "Nor", "Rowan", "Ward(en)", "El(ann)", "Pallas", "Lann"],
		crayson: [],
		hipast: []
	},
	endings: {
		plains: [],
		river: [],
		fort: []
	}
}
var tavern = {
	argumentTopic: function() {
		var modifier = ["whether or not", "how exactly", "how long ago", "why", "how many times"];
		var statement = ["one of them got laid", "a great hero died", "a country has been at war", ""];
		
		var txt = random.arrayValue(modifier) + " " + random.arrayValue(statement);
		return txt.charAt(0).toUpperCase() + txt.slice(1);
	}
};