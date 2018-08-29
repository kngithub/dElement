/*!
	delement.js ö
	K345 2006-2018
*/

/* %% devel on %% */
/* eslint-disable */
/*global K345, document*/

/** @namespace */
var K345 = K345 || {};

'use strict';

if ('requireScript' in K345) {
	K345.requireScript('array16', 'function');
}
/* eslint-enable */
/* %% devel off %% */

/* @@CODESTART IEVER "Javascript" */
/* returns IE version number or »undefined« for real ;-) browsers */
K345.ieVer = K345.ieVer || (function () {
	var regX, res;
	if (navigator.appName === 'Microsoft Internet Explorer') {
		regX = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
		res = regX.exec(navigator.userAgent);
		if (res !== null && res.length > 1) {
			return parseFloat(res[1]);
		}
	}
	return undefined;
}());
/* @@CODEEND IEVER */

/* @@CODESTART DATTR "Javascript" */

/** conversion table for HTML-attribute names
	@type Object */
K345.attrNames = K345.attrNames || {
	'acceptcharset': 'acceptCharset', 'accesskey': 'accessKey', 'alink': 'aLink',
	'bgcolor': 'bgColor', 'cellindex': 'cellIndex', 'cellpadding': 'cellPadding',
	'cellspacing': 'cellSpacing', 'charoff': 'chOff', 'class': 'className',
	'codebase': 'codeBase', 'codetype': 'codeType', 'colspan': 'colSpan',
	'datetime': 'dateTime', 'for': 'htmlFor', 'frameborder': 'frameBorder',
	'framespacing': 'frameSpacing', 'ismap': 'isMap', 'longdesc': 'longDesc',
	'marginheight': 'marginHeight', 'marginwidth': 'marginWidth', 'maxlength': 'maxLength',
	'nohref': 'noHref', 'noresize': 'noResize', 'nowrap': 'noWrap',
	'readonly': 'readOnly', 'rowindex': 'rowIndex', 'rowspan': 'rowSpan',
	'tabindex': 'tabIndex', 'usemap': 'useMap', 'valign': 'vAlign', 'vlink': 'vLink'
};

/* @@CODEEND DATTR */

/** names of void HTML elements
	@type Array */
K345.voidElements = K345.voidElements || ['area', 'base', 'basefont', 'br', 'col',
	'command', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta',
	'param', 'source', 'track', 'wbr'];

/* @@CODESTART DELEM "Javascript" */
/*
	dElement / dAppend
	requires Array.isArray()
	requires Array.prototype.indexOf()
	requires Array.prototype.forEach()
	requires Array.prototype.map()
	requires Array.prototype.filter()
	requires K345.attrNames
	requires K345.voidElements
	requires K345.ieVer
*/
(function () {
	var ie, /* legacy stuff for IE 6-7*/

		/* internal vars */
		eventStack, refs, loopdepth, _hasOP, multiProps, objcreate,

		/* predefined data */
		skipProps, saveProps, formProps, boolProps, elParents,

		/* functions */
		createElem, isNode, isEl, isAppendable, isTextNode, shCopy, parseElemStr;

	if (
		!isMeth(Array, 'isArray') ||
		!isMeth(Function.prototype, 'bind') ||
		!isMeth(Array.prototype, 'indexOf') ||
		!isMeth(Array.prototype, 'forEach') ||
		!isMeth(Array.prototype, 'filter') ||
		!isMeth(Array.prototype, 'map') ||
		!isMeth(document, 'createDocumentFragment') ||
		!isObj(K345.attrNames) ||
		!Array.isArray(K345.voidElements)
	) {
		dError('A required methods/property is missing or an external value is of' +
			' wrong type.');
	}

	/* ==============  COMMON FUNCTIONS  ================= */

	/* test: object has own property */
	_hasOP = Object.prototype.hasOwnProperty;

	function hasOP(o, p) {
		return _hasOP.call(o, p);
	}

	/** test if el is a nodeElement and has a specific nodeType
		@this {Array} allowed nodeTypes to test against */
	function nodeTest(el) {
		/* 'nodeType' in el must not be replaced by call to hasOwnProperty! */
		return isObj(el) && 'nodeType' in el && this.indexOf(el.nodeType) > -1;
	}

	/**#@+
		@param {Node|Object} el
			Element to test
		@returns {Boolean}
			true, if nodetype matches.
		@function
	*/

	/** test: is 'el' a DOM element?
		returns true if 'el' is a nodeElement(1) */
	isEl = nodeTest.bind([1]);

	/** test: is 'el' a DOM element?
		returns true if 'el' is a nodeElement(1) or a documentFragment(11) */
	isNode = nodeTest.bind([1, 11]);

	/** test: can 'el' be appended to nodeElements?
		returns true if 'el' is a nodeElement(1), a documentFragment(11),
		a comment(8) or a textNode(3) */
	isAppendable = nodeTest.bind([1, 3, 8, 11]);

	/** test: is 'el' a text node?
		returns true if 'el' is a textNode(3) */
	isTextNode = nodeTest.bind([3]);

	/**#@- */

	function camelCase(str) {
		return str.replace(/\-./g, function (s) {
			return s.substr(1).toUpperCase();
		});
	}

	/** throw error */
	function dError(txt) {
		throw new Error('dElement Error:\n' + txt + '\n');
	}

	/** test: is type of item of type val */
	function is(item, val) {
		return typeof item === val;
	}

	/** test: is item a string */
	function isStr(item) {
		return typeof item === 'string';
	}

	/** test: is o an object and not null? (simple test) */
	function isObj(o) {
		return o !== null && is(o, 'object') && !Array.isArray(o);
	}

	/** test: is "m" a method of "o"? */
	function isMeth(o, m) {
		var t = typeof o[m];
		return ('function|unknown'.indexOf(t) > -1) || (t === 'object' && !!o[m]);
	}

	/** map property names */
	function mapNames(o, nmap) {
		var pr;
		for (pr in nmap) {
			if (hasOP(o, pr)) {
				o[nmap[pr]] = o[pr];
				delete o[pr];
			}
		}
		return o;
	}

	objcreate = 'create' in Object &&
		typeof Object.create === 'function' &&
		(Object.create({a: 3})).a === 3;

	/* create shallow copy of object. fallback to simplified Object.create */
	shCopy = (objcreate)
		? function (o) { return Object.create(o); }
		: function (o) { function F() {} F.prototype = o; return new F(); };

	/* ================  START OF IE 6-8 LEGACY SUPPORT ================= */

	/** IE legacy stuff
		@type object */
	ie = {};

	/** Flag: old (< 8) IE need different element creation approach
		@type Boolean */
	ie.legacy = (K345.ieVer < 8);

	/** these elements need special treatment in old IE
		@type Array */
	ie.elem = ['input', 'button', 'option'];

	/** older IE only: creates an HTML attribute string like ' foo="bar"'.
		expects declaration object as 'this', e.g. by calling it:
		ie.attrStr.call(declaration_object, att)
		if value s[att] is boolean true, the attribute name is set as attribute value
		e.g. checked: true --> checked="checked".

		@param {String} att name of attribute
		@returns {String} attribute string or empty string
		@this {Object} declaration_object
	*/
	ie.attrStr = function (att) {
		var r, v;
		if (att in this) {
			v = this[att];
			if (v !== false) {
				if (v === true) {
					v = att;
				}
				r = ' ' + att + '="' + v + '"';
			}
		}
		return r || '';
	};

	/*  IE <= 7 only: create certain problematic elements and attributes with
		special Microsoft notation for createElement() if necessary */
	ie.createElem = (function () {
		function thisHas(p) {
			return (p in this);
		}

		return function (s) {
			var el = s.element,
				pr = formProps.filter(thisHas, s);

			if (pr.length > 0 || ie.elem.indexOf(el) > -1) {
				el = '<' + el + pr.map(ie.attrStr, s).join('') + '>';
			}
			return document.createElement(el);
		};
	})();

	/* ================  END OF IE LEGACY SUPPORT ================= */

	/* ================  VARIABLES AND DATA  ================= */

	/** these properties are processed ahead of any remaining properties to avoid
		browser bugs (mainly IE of course). Retain order!
		@type Array */
	formProps = ['type', 'name', 'value', 'checked', 'selected'];

	/** skip the following internal properties in createTree() property loop
		@type Array */
	skipProps = ['element', 'elrefs', 'clone', 'clonetop'];

	/** multi-properties. These properties may appear multiple times inside a object
		declaration, postfixed by an underscore and an unique identifier
		@type array */
	multiProps = ['text', 'event', 'attribute', 'setif', 'html', 'child',
		'comment', 'collect'];

	/** save element reference if one of these props appears
		@type Array */
	saveProps = ['id', 'name'];

	/** collect events
		@type array */
	eventStack = null;

	/* recursion counter for variable replacement depth in loop */
	loopdepth = 0;

	/** define parent elements for some elements.
		This will be used only if template element is not available.
		@type Object */
	elParents = {
		'tr': 'tbody', 'tbody': 'table', 'thead': 'table', 'tfoot': 'table', 'td': 'tr',
		'th': 'tr', 'caption': 'table', 'option': 'select', 'optgroup': 'select',
		'li': 'ul', 'dd': 'dl', 'dt': 'dl', 'figcaption': 'figure', 'legend': 'fieldset',
		'summary': 'details', 'menuitem': 'menu'
	};

	/* attributes of 'boolean' type. value may be either empty or the attribute name*/
	boolProps = [
		'checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple',
		'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected'
	];

	/* ==============  EVENTS  ================= */

	/** handle events */
	function setEvent(evtDef) {
		var ix, fn,
			o = evtDef.val,
			el = evtDef.el;


		o = mapNames(o, {
			'function': 'func',
			'arguments': 'args'
		});

		if (!isObj(o) || !('args' in o)) {
			dError('Not a valid event declaration');
		}

		if (Array.isArray(o.args)) {
			/* call external, e.g. cross browser event handling
				o.func is a function reference */
			if (is(o.func, 'function')) {
				ix = o.args.indexOf('#el#');

				/* placeholder #el# not found, try to find #elp# */
				if (ix < 0) {
					ix = o.args.indexOf('#elp#');

					/* placeholder #elp# found */
					if (ix >= 0) {
						if (!el.parentNode) {
							return;
						}
						el = el.parentNode;
					}
					else {
						ix = o.args.indexOf('#elpp#');
						/* placeholder #elpp# found */
						if (ix >= 0) {
							if (!el.parentNode || !el.parentNode.parentNode) {
								return;
							}
							el = el.parentNode.parentNode;
						}
					}
				}

				if (ix < 0) {
					/* insert element reference as first argument */
					o.args.unshift(el);
				}
				else {
					/* insert element reference at defined position */
					o.args.splice(ix, 1, el);
				}

				/* call event set function */
				o.func.apply(el, o.args);
			}
			/* call method "o.func" of el (defaults to "addEventListener") */
			else {
				/* o.func is not defined or a string */
				o.func = o.func || 'addEventListener';
				fn = el[String(o.func)];
				if (is(fn, 'function')) {
					fn.apply(el, o.args);
				}
			}
		}
	}

	/* add event(s) to stack */
	function pushEvt(el, eo) {
		if (!Array.isArray(eo)) {
			eo = [eo];
		}
		eo.forEach(function (item) {
			eventStack.push({
				el: el,
				val: item
			});
		});
	}

	/* ==============  PROPERTIES  ================= */

	/** Set a property "prop" of el to "val".
		Falls back to setAttribute if prop set fails */
	function setProp(el, prop, val) {
		var rProp,
			lcProp = prop.toLowerCase();

		if (lcProp.indexOf('data-') === 0) {
			if (
				lcProp !== prop ||  /* has uppercase */
				lcProp.indexOf('data-xml') > -1 ||  /* starts with xml */
				lcProp.indexOf(';') > -1
			) {
				dError('data-* name may not start with "xml" or contain any semicolon' +
					' or uppercase chars');
			}
			/* dataset stores values as string, so it's best to do the same for all
				data attributes even if dataset api is n/a */
			val = String(val);

			/* always use 'in', hasOwnProperty returns false on elements */
			if ('dataset' in el && isObj(el.dataset)) {
				el.dataset[camelCase(lcProp.substring(5))] = val;
				return el;
			}
			rProp = lcProp;
		}
		else {
			/* some attribute names must be replaced, eg. for => htmlFor */
			rProp = replaceAttrName(prop);

			if (boolProps.indexOf(lcProp) > -1) {
				/*  replace "boolean true" value with attribute name,
					e.g. checked: true becomes checked="checked" */
				if (val === true) {
					val =  prop;
				}
				else {
					/* not a valid value if val is not any of prop, lcProp, rProp */
					if (val !== rProp && val !== lcProp && val !== prop) {
						return el;
					}
				}
			}
			else if (rProp === 'className' && val === '') {
				/* prevent empty "className" property or "class" attribute */
				return el;
			}
		}

		/* set a property, fallback to setAttribute if assignment fails
			some older browsers misbehave on "data-" attributes, even in bracket
			notation */
		try {
			el[rProp] = val;
			if (el[rProp] !== val) {
				dError('value mismatch');
			}
		}
		catch (ex) {
			el.setAttribute(rProp, val);
		}
		return el;
	}

	/* set property if condition is true */
	function setPropIf(el, pobj) {
		if (isObj(pobj) && 'name' in pobj && 'value' in pobj) {
			if ('condition' in pobj && !!pobj.condition) {
				if (pobj.name !== 'child') {
					setProp(el, pobj.name, pobj.value);
				}
				else if (isObj(pobj.value)) {
					appendTree.call(el, pobj.value);
				}
			}
		}
	}

	/** map property names. returns base name of 'multi' properties */
	function mapMultiProps(p) {
		var uscoPos = p.indexOf('_'),
			base;

		if (uscoPos > 0) { /* underscore found */
			base = p.substring(0, uscoPos);
			if (multiProps.indexOf(base) > -1) {
				p = base;
			}
		}
		return p;
	}

	/* ==============  MISC  ================= */

	/** set element styles */
	function setStyles(el, sty) {
		if (Array.isArray(sty)) {
			sty = sty.join(';');
		}
		/*  Prefer element.style.cssText if available. older IE (up to 7 AFAIK)
			sometimes might have problems when using "el.setAttribute('style', ...)" */
		if (el.style.cssText !== undefined) {
			el.style.cssText = sty;
		}
		else {
			el.setAttribute('style', sty);
		}
		return el;
	}

	/** create HTML comment node
		expects element reference as 'this'

		If document.createComment() is not available, this function adds comment nodes
		to node elements only
	*/
	function addComment(comm) {
		if (Array.isArray(comm)) {
			comm.forEach(addComment, this);
		}
		else {
			if (isMeth(document, 'createComment')) { /* node element and fragment */
				this.appendChild(document.createComment(' ' + comm + ' '));
			}
			else if (isEl(this)) { /* node element only, no fragment */
				this.insertAdjacentHTML('beforeEnd', '<!-- ' + String(comm) + ' -->');
			}
		}
	}

	/* ==============  LOOPS  ================= */

	/* loop element creation and replace placeholders */
	function loopdef(el, loopobj, decl, isdeep) {
		var step = 1,
			start = 0,
			cnt = 1,
			i, o;

		/* check if loopobj is either a valid object or a numeric value */
		if (isObj(loopobj) && 'count' in loopobj && !isNaN(loopobj.count)) {
			/* validate loop values count, step and start */
			cnt = Number(loopobj.count);
			if ('step' in loopobj && !isNaN(loopobj.step)) {
				step = Number(loopobj.step);
				if (step === 0) {
					step = 1;
				}
			}
			if ('start' in loopobj && !isNaN(loopobj.start)) {
				start = Number(loopobj.start);
			}
		}
		else if (!isNaN(loopobj)) {
			cnt =  Number(loopobj);
		}

		cnt = Math.abs(Math.round(cnt)); /* make count a positive integer */

		for (i = start; i < (start + (step * cnt)); i += step) {
			if (Math.floor(i) !== i) { /* float check */
				i = parseFloat(i.toFixed(8), 10); /* avoid rounding errors */
			}
			o = replaceCounter(decl, i, isdeep);
			appendTree.call(el, o);
		}
		return el;
	}

	/* find placeholders and call replace function */
	function replaceCounter(decl, i, isdeep) {
		var o = shCopy(decl),
			phreg = /\!\![^!\s]+\!\!/gi,
			p, mch, ph, op;

		for (p in o) {
			/* replace all placeholders in string */
			if (isStr(o[p])) {
				op = o[p];

				/* for each placeholder in string */
				while ((ph = phreg.exec(o[p])) !== null) {
					/* match counter, optional multiplicator and value to add */
					mch = ph[0].match(
						/\!\!(?:(\-?\d+(?:\.\d+)?)[•\*]?)?n([+-]\d+(?:\.\d+)?)?\!\!/i
						/* !!   |    number      | mul    n| add/sub  number |  !! */
					);
					if (Array.isArray(mch) && mch.length > 2) {
						op = loopreplace(op, i, mch);
					}
				}

				/* write replaced string back to object property */
				o[p] = op;
			}
			/* scan for placeholders in subdeclarations until a loop, loopstop or loopdeep
				property is found or loop depth exceeds 1 on loop property */
			else if (
				p === 'child' &&
				isObj(o.child) &&
				!('loop' in o.child) &&
				!('loopdeep' in o.child) &&
				!('loopstop' in o.child) &&
				(isdeep || loopdepth < 1)
			) {
				loopdepth++; /* increase depth counter */
				o.child = replaceCounter(o.child, i, isdeep);
				loopdepth--;
			}
		}
		return o;
	}

	/* calculate value of placeholder and replace it */
	function loopreplace(s, i, mch) {
		var mul = Number(mch[1]),
			add = Number(mch[2]);

		if (!isNaN(mul) && mul !== 0) {
			i *= mul;
		}
		if (!isNaN(add)) {
			i += add;
		}
		return s.replace(mch[0], i);
	}

	/* ==============  ELEMENT REFERENCES  ================= */

	/** add current element reference to collection */
	function collectElRef(sc, el) {
		if (Array.isArray(sc)) {
			sc.push(el);
		}
		else if (isObj(sc) && 'obj' in sc && 'name' in sc && isObj(sc.obj)) {
			if (sc.obj[sc.name] === undefined) {
				sc.obj[sc.name] = el;
			}
			else {
				dError('duplicate declaration of ' + sc.name +
					' in property "collect"');
			}
		}
	}

	/** save references of elements with name or id property */
	function saveRefs(sdata) {
		var pr = sdata.s[sdata.p];

		if (sdata.lp === 'id') {
			this.i[pr] = sdata.el;
		}
		else if (sdata.lp === 'name') {
			if (Array.isArray(this.n[pr])) {
				this.n[pr].push(sdata.el);
			}
			else {
				this.n[pr] = [sdata.el];
			}
		}
	}

	/* ==============  ATTRIBUTES  ================= */

	/** replace special property names */
	function replaceAttrName(atn) {
		var lcAtt = atn.toLowerCase();
		return (lcAtt in K345.attrNames)
			? K345.attrNames[lcAtt]
			: camelCase(atn);
	}

	/** set attributes with setAttribute(). will be used only when forced with property
		attr|attrib|attribute or with certain problematic properties

		value has to be either
			- an object containing properties value and name
				e.g.  attribute: {name: 'foo', value: 'bar'}
			- an array with objects as described above
	*/
	function setAttribs(att) {
		var el = this;
		if (Array.isArray(att)) {
			att.forEach(setAttribs, el);
		}
		else if (
			isNode(el) && isObj(att) && 'name' in att &&
			'value' in att && isStr(att.name)
		) {
			if (att.name.toLowerCase() === 'style') {
				/* setAttribute with "style" fails in some browsers, handle this*/
				setStyles(el, att.value);
			}
			else {
				el.setAttribute(att.name, att.value);
			}
		}
		return el;
	}

	/* ==============  PARSE EXTENDED SYNTAX  ================= */

	/* parseElemStr() */
	parseElemStr = (function () {
		var ETX = '\x03', /* 0x03 (ETX, end of text) */
			US  = '\x1F', /* 0x1F (US, unit separator) */
			WSP = ' \t\r\n\f\x0B\xA0', /* some whitespace */
			MODE_END     = ETX,
			MODE_TAGNAME = '!!',
			MODE_ID      = '#',
			MODE_CLASS   = '.',
			MODE_NAME    = '~',
			MODE_TYPE    = '@',
			MODE_VALUE   = '=',
			modeChars = {},
			moc = '',
			stopChars, pr;

		/* data for parse modes
			defaults are unique:true and stop:true
		*/
		modeChars[MODE_END]   = {};
		modeChars[MODE_CLASS] = {attrName: 'class', unique: false};
		modeChars[MODE_ID]    = {attrName: 'id'};
		modeChars[MODE_NAME]  = {attrName: 'name'};
		modeChars[MODE_TYPE]  = {attrName: 'type'};
		modeChars[MODE_VALUE] = {attrName: 'value', stop: false};

		for (pr in modeChars) {
			if (hasOP(modeChars, pr)) {
				moc += pr;
			}
		}

		/* mode and illegal chars.
			This is not a RegExp; multichar sequences like \s \b \w will not work  */
		stopChars = moc + US + WSP + '%<>*\'"/|\\?^!!!§$&()[]{}+:,;';

		/* wrapper for parser errors */
		function pError(str) {
			dError('parser: ' + str);
		}

		/* */
		function isStopMode(mo) {
			return !mo || !(mo in modeChars) || !('stop' in modeChars[mo]) ||
				modeChars[mo].stop !== false;
		}

		/** parseElemStr()
			parse element string for id, name, class names, value and type and create
			correlating properties

			@param def {Object}
				current element tree declaration object
			@returns {Object}
				altered element tree declaration object
			@function
			@name parseElemStr
		*/
		return function (def) {
			var mode = MODE_TAGNAME, /* default mode: string starts with tagname */
				str = def.element, /* string to parse */
				part = '', /* parsed word */
				clNames = [], /* collects class names */
				i = 0,
				cnt = {},
				stop = true, /* don't stop on stop chars if true */
				ch, /* current char */
				mcc, len;

			/* reset counters */
			for (ch in modeChars) {
				if (hasOP(modeChars, ch)) {
					cnt[ch] = 0;
				}
			}

			/* append parse end marker */
			str = str.replace(ETX, '') + ETX;
			len = str.length;

			while (mode !== MODE_END) {
				ch = str.charAt(i);
				i++;

				/* ignore whitespace unless it's within a no stop declaration */
				if (WSP.indexOf(ch) > -1 && isStopMode(mode)) {
					continue;
				}

				if (stop === false && (ch === US || ch === ETX || i >= len)) {
					stop = true;

					/* ignore all chars until the next mode changing char appears or
						the string ends */
					while (i < len && !(ch in modeChars)) {
						ch = str.charAt(i);
						i++;
					}
				}

				/* if "ch" is not a stopchar, append "ch" to "part" and do next loop */
				if (stopChars.indexOf(ch) < 0 || stop === false) {
					part += ch;
					continue;
				}

				/* if length of "part" is 0, "str" is not valid */
				if (part.length === 0) {
					pError('empty value in mode "' + mode + '" "' +
						str.slice(0, -1) + '"');
				}

				/* set property based on current parse mode and reset "part" to empty for
					for next string */
				switch (mode) {
				case MODE_TAGNAME:
					def.element = part; break;
				case MODE_CLASS:
					clNames.push(part); break;
				default:
					/* find matching attribute name, create property and set its value */
					if (mode in modeChars && 'attrName' in modeChars[mode]) {
						def[modeChars[mode].attrName] = part;
					}
					else {
						pError('mode not supported: »' + mode + '«');
					}
					break;
				}
				part = '';

				/* set new mode based on stop char or throw Error on illegal char */
				if (ch in modeChars) {
					mcc = modeChars[ch];

					/* count the usage of each attribute declaration. if 'unique' is set, the
						count may not exceed 1 */
					cnt[ch]++;
					if (cnt[ch] > 1 && (!('unique' in mcc) || mcc.unique !== false)) {
						pError('element may not have more than one ' + ch +
							mcc.attrName + '.\n\t"' + str + '"');
					}

					mode = ch;
					stop = !('stop' in mcc) || !!mcc.stop;
				}
				else {
					pError('Illegal char: "' + ch + '" (' + ch.charCodeAt(0) +
						') in »' + str.slice(0, -1) + '« at position ' + i);
				}
			}

			/* combine class names */
			if (clNames.length > 0) {
				def.className = clNames.join(' ');
			}
			return def;
		};
	}());

	/* ===================  NODE TREE FUNCTIONS ====================== */

	/** convert "txt" to DOM text node */
	function textNode(txt) {
		if (Array.isArray(txt)) {
			return document.createTextNode(txt.join(''));
		}
		return isTextNode(txt)
			? txt
			: document.createTextNode(txt);
	}

	/** convert HTML string (as used with innerHTML) to DOM node tree. */
	function strToNodes(str) {
		var frg = document.createDocumentFragment(),
			el = 'div', /* fallback element */
			txt = '',
			d, fc, m;

		/* use HTML <template> element if available */
		d = document.createElement('template');
		if ('content' in d) {
			el = 'template';
		}
		else {
			/* if HTML element 'template' is not available, determine best matching parent
				element or use 'div' otherwise */
			m = str.match(/\<\s*([a-z][a-z1-6]*)/i);
			if (m && m.length > 1 && m[1] in elParents) {
				el = elParents[m[1]];
			}
			d = document.createElement(el);
		}

		/* Sadly, applying innerHTML directly to an fragment doesn't work. Using a dummy
			element and then moving it's child nodes to the fragment does the trick.*/
		try {
			d.innerHTML = str;

			/* if 'el' is a <template> element, it's 'content' property already references
				a documentFragment, so we're done */
			if (el === 'template') {
				return d.content;
			}

			/* move all elements to fragment */
			while ((fc = d.firstChild)) {
				frg.appendChild(fc);
			}
		}
		catch (ex) {
			/*	assigning "str" with innerHTML will fail if content-type of document is
				application/xhtml+xml and either named entities other than &gt, &lt, &amp,
				&quot, &apos are used or if "str" contains illegal HTML
			*/
			if (ex.code === 12) {
				txt = 'ERROR.\nHTML string most likely contains illegal HTML or uses ' +
					' named entities (restricted when using content-type application/' +
					'xhtml+xml.\nuse numeric entities instead)\n\n';
			}
			dError(
				txt + 'Error code: ' + ex.code + '\nError message: ' + ex.message +
					'\nContent (leading 200 chars):\n»' + str.substring(0, 200) + '…«'
			);
		}
		return frg;
	}

	/** appends elements, DOM tree or HTML written as string to a given parent
		node element. */
	function addNodes(el, item) {
		if (isAppendable(item)) {
			el.appendChild(item);
		}
		else if (isStr(item)) {
			if (item === '') { return el; }
			if (isEl(el)) { /* a HTML element */
				el.insertAdjacentHTML('beforeend', item);
			}
			else if (isMeth(el, 'appendChild')) { /* a fragment, ... */
				el.appendChild(strToNodes(item));
			}
		}
		else if (Array.isArray(item)) {
			item.forEach(addNodes.bind(null, el));
		}
		else {
			dError('illegal type of property (' + item + ')');
		}
		return el;
	}

	/** create DOM tree and append to object
		expects parent element as 'this', e.g. by calling it:
		appendTree.call(el, def) */
	function appendTree(def) {
		var s = createTree(def);
		if (s) {
			this.appendChild(s);
		}
		return s;
	}

	/** append child nodes
		expects element reference as 'this'
	*/
	function appendChildNodes(sp) {
		if (Array.isArray(sp)) {
			sp.forEach(appendTree, this);
		}
		else if (isAppendable(sp)) {
			this.appendChild(sp);
		}
		else if (isObj(sp)) {
			appendTree.call(this, sp);
		}
		else {
			this.appendChild(textNode(sp));
		}
	}

	/** clone a node(tree) or a declaration */
	function cloneObject(s) {
		var scl, newEl;
		if ('clone' in s && 'clonetop' in s) {
			dError('only one of clone or clonetop may be used.');
		}
		scl = s.clone || s.clonetop;
		if (isAppendable(scl) && isMeth(scl, 'cloneNode')) {
			newEl = scl.cloneNode('clone' in s); /* clone: true, clonetop: false */
		}
		else if (isObj(scl)) {
			newEl = createTree(scl);
		}
		if (!isAppendable(newEl)) {
			dError('this object can\'t be cloned: ' +  scl);
		}
		return newEl;
	}

	/** create element (with some bugfixes)
		Bugs in older IEs (<=7): setting type / name / value properties *after*
		creating an element may lead to various problems eg. radio-buttons are
		not selectable in IE7. setting 'value' as attribute is important on
		button elements
		Bug in IE8 and Opera <= 12: If 'type' is not assigned as first property on
		«input» (and maybe other elements) the 'value' property might be lost

		@param {Object}  s    element declaration
		@returns {Node}       new node element
		@function
		@private
	*/
	createElem = (function (oldIE) {
		/* */
		function setProp_callback(pr) {
			if (pr in this.decl) {
				setProp(this.el, pr, this.decl[pr]);
			}
		}

		/* all other browsers */
		function createElemStd(s) {
			var el = document.createElement(s.element);

			/* set 'type', 'name, 'value', 'selected' and 'checked' before looping all
				properties in createTree() to avoid some strange browser bugs */
			formProps.forEach(setProp_callback, {el: el, decl: s});

			return el;
		}

		return (isObj(oldIE) && oldIE.legacy && is(oldIE.createElem, 'function'))
			? oldIE.createElem
			: createElemStd;
	}(ie));

	/** walk declaration object (recursive) and create element tree */
	function createTree(s) {
		var frg, newEl, prop, lcProp, sp, lobj, lprop, isdeep;

		/* array of element declarations without common parent element */
		if (Array.isArray(s)) {
			frg = document.createDocumentFragment();
			s.forEach(appendTree, frg);
			return frg;
		}

		/* s is a node element, fragment or text node */
		if (isAppendable(s)) {
			return s;
		}

		/* s is text string */
		if (isStr(s)) {
			return textNode(s);
		}

		/* return cloned node */
		if ('clone' in s || 'clonetop' in s) {
			return cloneObject(s);
		}

		/* duplicate elements n times and replace counter placeholder */
		if ('loop' in s || 'loopdeep' in s) {
			if ('loop' in s && 'loopdeep' in s) {
				dError('You may use only one of "loop" OR "loopdeep", not both.');
				return null;
			}
			isdeep = 'loopdeep' in s;
			lprop = (isdeep) ? 'loopdeep' : 'loop';
			lobj = s[lprop];
			delete s[lprop];
			frg = loopdef(document.createDocumentFragment(), lobj, s, isdeep);
			s[lprop] = lobj;
			return frg;
		}

		/* normalize shortcut keywords */
		s = mapNames(s, {
			'cond': 'condition',
			'comm': 'comment',
			'attrib': 'attribute',
			'attr': 'attribute'
		});

		/* stop processing if property 'condition' exist and it's value is falsy */
		if ('condition' in s && !s.condition) {
			return null;
		}

		/* init or unset reference declaration data */
		if (s.elrefs === null) {
			/** collect element references
				@type object */
			refs = null;
		}
		else if (isObj(s.elrefs)) {
			refs = s.elrefs;
			refs.i = refs.i || {}; /* collect elements with id */
			refs.n = refs.n || {}; /* collect elements with name */
		}
		delete s.elrefs;

		/*  if a declaration object doesn't include a property named 'element' then
			one of either 'text', 'html', 'comment', 'clone' or 'clonetop' MUST be defined.
			'clone' and 'clonetop' are processed above; this part takes care of
			'html', 'text', 'comment'. */
		if (!('element' in s)) {
			/* handle multi properties 'text', 'comment' and 'html' */
			frg = document.createDocumentFragment();
			/* eslint-disable guard-for-in, default-case */
			for (prop in s) {
					lcProp = mapMultiProps(prop.toLowerCase());
					switch (lcProp) {
					case 'text':
						frg.appendChild(textNode(s[prop]));
						break;
					case 'html':
						addNodes(frg, s[prop]);
						break;
					case 'comment':
						addComment.call(frg, s[prop]);
						break;
					}
			} /* eslint-enable guard-for-in, default-case */

			/*  return, if documentFragment has childNodes or if html property is empty.

				if 'html' is the only property of s and s.html is empty, addNodes()
				returns an empty fragment, which would fail the frg.hasChildNodes() test.
				this special case has to be handled separately
			*/
			if (frg.hasChildNodes() || ('html' in s && s.html === '')) {
				return frg;
			}

			/* no required property defined in s */
			dError('Every (sub)declaration object requires at least one of the following ' +
				'properties: "element", "text", "clone", "clonetop", "comment" or "html".');
		}

		/* s.element holds the name of the element to be created */
		if (!isStr(s.element)) {
			dError('type of property "element" must be string');
		}

		/* uses string parser if value of "s.element" contains chars other than a-z1-6 */
		if ((/[^a-z1-6]/i).test(s.element)) {
			s = parseElemStr(s);
		}

		/* disallow child nodes for empty content elements */
		if (K345.voidElements.indexOf(s.element) > -1) {
			/* eslint-disable guard-for-in, default-case */
			for (prop in s) {
					lcProp = mapMultiProps(prop.toLowerCase());
					switch (lcProp) {
					case 'text':
					case 'html':
					case 'child':
						dError('content model of element "' + s.element.toUpperCase() +
							'" is "empty". This element may not contain any child nodes');
						break;
					}
			}
			/* eslint-enable guard-for-in, default-case */
		}

		/* create element */
		newEl = createElem(s);
		if (!newEl) {
			dError('can\'t create element "' + s.element + '".');
		}

		/* loop all properties */
		/* eslint-disable guard-for-in */
		for (prop in s) {
			lcProp = prop.toLowerCase();

			/* save element reference if prop is in saveProps */
			if (isObj(refs) && saveProps.indexOf(lcProp) > -1) {
				saveRefs.call(refs, {
					s: s,
					el: newEl,
					p: prop,
					lp: lcProp
				});
			}

			/*  skip props 'element', 'elrefs', 'clone', 'clonetop' plus all properties
				already processed in createElem() */
			if (skipProps.indexOf(lcProp) > -1 || formProps.indexOf(lcProp) > -1) {
				continue;
			}

			/* handle name of a multi-property */
			lcProp = mapMultiProps(lcProp);

			sp = s[prop];

			/* handle property value according to property name */
			switch (lcProp) {

			/* if property name is 'collect' and value is an array/object, store
				reference to current element */
			case 'collect':
				collectElRef(sp, newEl);
				break;

			/* create a text node */
			case 'text':
				newEl.appendChild(textNode(sp));
				break;

			/* create a comment node */
			case 'comment':
				addComment.call(newEl, sp);
				break;

			/* process sub declaration object or declaration array */
			case 'child':
				appendChildNodes.call(newEl, sp);
				break;

			/* add eventhandler to current element */
			case 'event':
				pushEvt(newEl, sp);
				break;

			/* process html string */
			case 'html':
				addNodes(newEl, sp);
				break;

			/*  enforced usage of setAttribute() */
			case 'attribute':
				setAttribs.call(newEl, sp);
				break;

			/* css styles */
			case 'style':
				setStyles(newEl, sp);
				break;

			/* set property on condition */
			case 'setif':
				setPropIf(newEl, sp);
				break;

			/* anything else */
			default:
				setProp(newEl, prop, sp);
				break;
			}
		}
		/* eslint-enable guard-for-in */
		return newEl;
	}

	/**#@- */

	/* ==============  dElement() & dAppend()  ================= */

	/** create node tree from declaration
		@param   {object} decl
			element declaration
		@returns {nodes|null}
			node tree or fragment or null
	*/
	K345.dElement = function (decl) {
		var dtree;
		if (!Array.isArray(decl) && !isObj(decl)) {
			dError('Parameter has been omitted or is not an object/array');
		}
		eventStack = [];
		refs = null;
		dtree = createTree(decl);
		if (dtree) {
			eventStack.forEach(setEvent);
		}
		return dtree || null;
	};

	/** dAppend: create node tree and append it to an existing element

		@param {node|string} elem
			element reference or id as string

		@param {object} def
			element declaration object (see dElement)

		@param {number} [mode=K345.DAPPEND_APPEND]
			possible values for mode:<br>
		'beforeend' or<br>
		K345.DAPPEND_LAST or<br>
		K345.DAPPEND_APPEND  -> append to elem (default)<br>
		'beforebegin' or<br>
		K345.DAPPEND_BEFORE  -> insert before elem<br>
		'afterend' or<br>
		K345.DAPPEND_AFTER   -> insert after elem<br>
		'replace' or<br>
		K345.DAPPEND_REPLACE -> replace existing element<br>
		'afterbegin' or<br>
		K345.DAPPEND_FIRST   -> append as first child of element<br>
		'wipe' or<br>
		K345.DAPPEND_WIPE    -> wipe existing child elements and append as child of element<br><br>

		mode values may *not* be combined (wouldn't make sense anyway)

		@returns {object|null}
			node tree or null

	*/
	K345.dAppend = function (elem, def, mode) {
		var nodes = null,
			elc;

		if (isStr(elem)) {
			elem = document.getElementById(elem);
		}

		if (isNode(elem)) {
			nodes = K345.dElement(def);
			if (!nodes) {
				return null;
			}

			if (isStr(mode)) {
				mode = mode.toLowerCase();
			}

			switch (mode) {

			case 'beforebegin':
			case K345.DAPPEND_BEFORE:
				elem.parentNode.insertBefore(nodes, elem);
				break;

			case 'afterend':
			case K345.DAPPEND_AFTER:
				elem.parentNode.insertBefore(nodes, elem.nextSibling);
				break;

			case 'replace':
			case K345.DAPPEND_REPLACE:
				elem.parentNode.replaceChild(nodes, elem);
				break;

			case 'afterbegin':
			case K345.DAPPEND_FIRST:
				elem.insertBefore(nodes, elem.firstChild);
				break;

			case 'wipe':
			case K345.DAPPEND_WIPE:
				while ((elc = elem.lastChild)) {
					elem.removeChild(elc);
				}
				/*jsl:fallthru*/ /* eslint-disable-next-line no-fallthrough */

			case 'beforeend':
			case K345.DAPPEND_APPEND:
			case K345.DAPPEND_LAST:
			default:
				elem.appendChild(nodes);
				break;
			}
		}
		return nodes;
	};

	/**#@+
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	/** append as last child of element (default) */
	K345.DAPPEND_APPEND  = 0;
	K345.DAPPEND_LAST    = 0;

	/** insert before element */
	K345.DAPPEND_BEFORE  = 1;

	/** insert after element */
	K345.DAPPEND_AFTER   = 2;

	/** replace element */
	K345.DAPPEND_REPLACE = 3;

	/** append as first child */
	K345.DAPPEND_FIRST   = 4;

	/** wipe all existing child nodes and append */
	K345.DAPPEND_WIPE    = 5;
	/**#@- */

}());

/* @@CODEEND DELEM */

/* %% devel on %% */
if ('registerScript' in K345) {
	K345.registerScript('delement');
}
/* %% devel off %% */

/* EOF */
