"use strict";
// This is the main class of trackr and it creates the trakr object
var trakr = (function () {

	return {
		// move a div (or whatever) to an x y location
		doc: document,
		enable: false,
		popBoxOn: false,
		chromeObj: chrome,
		selectedElement: null,
		createElements: function () {
			this.trakrBox = [];
			var d, i, s;
			 //we create a div that will move around to shouw the selection
			for (i=0; i<4; i++) {
				d = this.doc.createElement ("DIV");
				s = d.style;
				s.display = "none";
				s.overflow = "hidden";
				s.position = "absolute";
				s.height = "2px";
				s.width = "2px";
				s.top = "20px";
				s.left = "20px";
				s.zIndex = "5000000";
				d.isAardvark = true; // mark as ours
				this.trakrBox[i] = d;
				this.doc.body.appendChild(d);
			}
			var box = this.trakrBox;
			box[0].style.borderTopWidth = "2px";
			box[0].style.borderTopColor = "#00f";
			box[0].style.borderTopStyle = "solid";
			box[1].style.borderBottomWidth = "2px";
			box[1].style.borderBottomColor = "#00f";
			box[1].style.borderBottomStyle = "solid";
			box[2].style.borderLeftWidth = "2px";
			box[2].style.borderLeftColor = "#00f";
			box[2].style.borderLeftStyle = "solid";
			box[3].style.borderRightWidth = "2px";
			box[3].style.borderRightColor = "#00f";
			box[3].style.borderRightStyle = "solid";

			//this.createPopBox();
		},

		createPopBox : function () {
			//Creates the popup that modifies the database
			this.popBox = document.createElement("div");
			var popup = this.popBox;
			popup.style.position = "fixed";
			popup.style.backgroundColor = "#E5E5E5";
			popup.style.width = "100px";
			popup.style.height = "100px";
			popup.style.right = "0";
			popup.style.top = "0";
			popup.style.zIndex = "5000000";
			var text = document.createTextNode("Name:");
			popup.appendChild(text);
			popup.appendChild(document.createElement("br"));

			this.taggingName = document.createElement("input");
			var tagName = this.taggingName;
			tagName.type = "text";
			tagName.id = "tag_name_input_field";
			popup.appendChild(tagName);

			var tagButton = document.createElement("button");
			tagButton.textContent = "Track";
			//tagButton.fontSize = '1em'
			tagButton.onclick = trakr.modifyDatabase;

			var cancelButton = document.createElement("button");
			cancelButton.textContent = "Cancel";
			cancelButton.onclick = trakr.disappearBox;
			popup.appendChild(tagButton);
			popup.appendChild(cancelButton);

			document.body.appendChild(popup);
		},

		moveElem : function (o, x, y) {
			o = o.style;
			o.left=x + "px";
			o.top=y + "px";     
			
		},

		modifyDatabase : function () {
			var trakname = trakr.taggingName.value;
			var ref = new Firebase('https://trakrnotifications.firebaseio.com/traks');
			var urlText = document.URL;
			var className  = trakr.selectedElement.className;
			var id = trakr.selectedElement.id;
			var elementText = trakr.selectedElement.textContent;
			if (trakr.selectedElement != null) {
				ref.child("dcorrea").child(trakname).set({element_class:className,
											element_id:id,
											enabled:true,
											text:elementText,
											url:urlText});
				trakr.disappearBox();
			}
		},

		disappearBox : function () {
			trakr.popBox.remove();
			trakr.popBoxOn = false;
			trakr.enable = false;
			trakr.selectedElement = null;
		},

		displayBox: function (elem) {
			var pos = trakr.getPos(elem)
			var y = pos.y;

			trakr.moveElem (this.trakrBox[0], pos.x, y);
			this.trakrBox[0].style.width = elem.offsetWidth + "px";
			this.trakrBox[0].style.display = "";

			this.moveElem (this.trakrBox[1], pos.x, y+elem.offsetHeight-2);
			this.trakrBox[1].style.width = (elem.offsetWidth + 2)  + "px";
			this.trakrBox[1].style.display = "";

			this.moveElem (this.trakrBox[2], pos.x, y);
			this.trakrBox[2].style.height = elem.offsetHeight  + "px";
			this.trakrBox[2].style.display = "";

			this.moveElem (this.trakrBox[3], pos.x+elem.offsetWidth-2, y);
			this.trakrBox[3].style.height = elem.offsetHeight + "px";
			this.trakrBox[3].style.display = "";

		},
		//returns the positions of the object in the screen
		//allows us to create the box around the divs
		getPos : function (elem) {
			var pos = {};
			var originalElement = elem;
			var leftX = 0;
			var leftY = 0;
			if (elem.offsetParent) {
				while (elem.offsetParent) {
					leftX += elem.offsetLeft;
					leftY += elem.offsetTop;

					if (elem != originalElement && elem != document.body && elem != document.documentElement) {
						leftX -= elem.scrollLeft;
						leftY -= elem.scrollTop;
					}
						elem = elem.offsetParent;
					}
				}
				else if (elem.x) {
					leftX += elem.x;
					leftY += elem.y;
				}
					pos.x = leftX;
					pos.y = leftY;
				return pos;
		},
		validIfBlockElements : {
			SPAN: 1,
			A: 1
		},
		alwaysValidElements : {
			DIV: 1,
			BLOCKQUOTE: 1,
			H1: 1,
			H2: 1,
			H3: 1,
			P: 1,
			TD: 1, //elements of a table
			TH: 1, //elements of a table
			TR: 1, //elements of a table
			B: 1
		},

		findValidElement : function (elem) {
			while (elem) {
				//we tag if it is in a blog && has a way of tagging && has text since that is how we compare
				if (this.alwaysValidElements[elem.tagName] && ((elem.id !== "") || (trakr.onlyElementInClass(elem))) && (elem.textContent !== "")) {
			    	return elem;
			    }
			  	else if (this.validIfBlockElements[elem.tagName]) {
			  		if (this.doc.defaultView) {
			  			//we tag if it is in a blog && has a way of tagging && has text since that is how we compare
			      		if ((this.doc.defaultView.getComputedStyle(elem, null).getPropertyValue("display") == 'block') && ((elem.id !== "") || (trakr.onlyElementInClass(elem))) && (elem.textContent !== "")) {
			        		return elem;
			        	}
			      	}
			    }
			  	elem = elem.parentNode;
			}
			return elem;
		},

		mouseOver: function (event) {
			if (trakr.enable) {
				console.log("we are hovering");
				var element = event.target;
				if (element != null) {
					element = trakr.findValidElement(element);
					if (element == null) {
						return;
					}
					trakr.displayBox(element);
				}
			}
		},
		/*
		Checks to see if the elements in the array have the same text
		*/
		sameText: function (elems) {
			var len = elems.length;
			if (len > 5) {
				return false;
			} else {
				var text = elems[0].textContent;
				text = text.trim();
				for (var i = 0; i < len; i++) {
					if (text !== elems[i].textContent.trim()) {
						return false;
					}
				}
				return true;
			}
		},
		//returns true if there is only one element with the specific class
		//of the element.
		onlyElementInClass: function (elem) {
			//get the classes of an element
			var nodeClass = elem.className;
			var nodesWithClass = document.getElementsByClassName(nodeClass);
			if (nodesWithClass.length === 1) {
				return true;
			} else if (nodesWithClass.length === 0) {
				return false;
			} else if (trakr.sameText(nodesWithClass)) {
				return true;
			} else {
				return false;
			}
			
		},

		mouseDown: function (event) {
			if (trakr.enable) {
				var element =  event.target;
				if (trakr.popBoxOn == false && trakr.enable){
					trakr.createPopBox();
					trakr.popBoxOn = true;
				}
				element = trakr.findValidElement(element);
				trakr.selectedElement = element;
				trakr.enable = false;
			}
		},

		start: function () {
			//we first create the elements
			trakr.createElements();
		},
	};
	
}());


$(window).load(function() {
	trakr.start();
    document.addEventListener ("mouseover", trakr.mouseOver, false);
	document.addEventListener ("mousedown", trakr.mouseDown, false);
});