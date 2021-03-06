/*!
	delement.js ö
	K345 2006-2018
*/

/* %% devel on %% */
	/* eslint-disable */
	/*global K345, document*/

	/** @namespace */
	var K345 = K345 || {};

	if ('requireScript' in K345) {
		K345.requireScript('array16', 'function');
	}
	/* eslint-enable */
/* %% devel off %% */

/* @@CODESTART DATTR "Javascript" */

/** conversion table for HTML-attribute names
	@type Object */
K345.attrNames = K345.attrNames || {
	acceptcharset: 'acceptCharset', accesskey: 'accessKey', alink: 'aLink',
	bgcolor: 'bgColor', cellindex: 'cellIndex', cellpadding: 'cellPadding',
	cellspacing: 'cellSpacing', charoff: 'chOff', 'class': 'className',
	codebase: 'codeBase', codetype: 'codeType', colspan: 'colSpan',
	datetime: 'dateTime', 'for': 'htmlFor', frameborder: 'frameBorder',
	framespacing: 'frameSpacing', ismap: 'isMap', longdesc: 'longDesc',
	marginheight: 'marginHeight', marginwidth: 'marginWidth', maxlength: 'maxLength',
	nohref: 'noHref', noresize: 'noResize', nowrap: 'noWrap',
	readonly: 'readOnly', rowindex: 'rowIndex', rowspan: 'rowSpan',
	tabindex: 'tabIndex', usemap: 'useMap', valign: 'vAlign', vlink: 'vLink'
};

/* @@CODEEND DATTR */

/** names of HTML elements with content type "void"
	@type Array */
K345.voidElements = K345.voidElements || ['area', 'base', 'basefont', 'br', 'col',
	'command', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta',
	'param', 'source', 'track', 'wbr'];

/* @@CODESTART DELEM "Javascript" */
/**
	dElement / dAppend
	requires Array.isArray()
	requires Array.prototype.filter()
	requires Array.prototype.forEach()
	requires Array.prototype.indexOf()
	requires Array.prototype.some()
	requires Function.prototype.bind()
	requires K345.attrNames
	requires K345.voidElements
*/
(function () {
	''; 'use strict';

		/* internal vars */
	var _hasOP = Object.prototype.hasOwnProperty,
		_slice = Array.prototype.slice,
		eventStack, initStack, refs, loopdepth,

		/* predefined data */
		skipProps, saveProps, formProps, boolProps, multiProps,

		/* functions */
		dError, isNode, isEl, isAppendable, isTextNode, parseElemStr, strToNodes;

	if (
		!isMeth(Array, 'isArray') ||
		!isMeth(Array.prototype, 'filter') ||
		!isMeth(Array.prototype, 'forEach') ||
		!isMeth(Array.prototype, 'indexOf') ||
		!isMeth(Array.prototype, 'some') ||
		!isMeth(Function.prototype, 'bind') ||
		!isMeth(document, 'createDocumentFragment') ||
		!isObj(K345.attrNames) ||
		!Array.isArray(K345.voidElements)
	) {
		throw new dError('A required methods/property is missing or an external value' +
			' is of wrong type.');
	}

	/* ==============  COMMON FUNCTIONS  ================= */

	/** test: object o has own property p
		@param {object} o
			Object to test
		@param {string} p
			Property which must be in o
		@returns {boolean}
			true, if p is a native property of o
		@function
	*/
	function hasOP(o, p) {
		return _hasOP.call(o, p);
	}

	/**#@+
		@param {Element|object} el
			Element to test
		@returns {boolean}
			true, if nodetype matches.
		@function
	*/

	/** test if el is a nodeElement and has a specific nodeType
		@this {Array} allowed nodeTypes to test against */
	function nodeTest(el) {
		/* "nodeType" in el must NOT be replaced by call to hasOwnProperty! */
		return isObj(el) && 'nodeType' in el && this.indexOf(el.nodeType) > -1;
	}

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

	/* remove dash from string and convert following char to uppercase */
	function camelCase(str) {
		return str.replace(/\-./g, function (s) {
			return s.substr(1).toUpperCase();
		});
	}

	/** test: is item a string */
	function isStr(item) {
		return typeof item === 'string';
	}

	/** test: is o an object and not null? (simple test) */
	function isObj(o) {
		return o !== null && typeof o === 'object' && !Array.isArray(o);
	}

	/** test: is "m" a method of "o"? */
	function isMeth(o, m) {
		var t = typeof o[m];

		return ('function|unknown'.indexOf(t) > -1) || (t === 'object' && !!o[m]);
	}

	/* create copy of object.
		Simplified, because it will only be used for dElement declaration objects */
	function oCpy(o) {
		var no = {},
			p, op;

		for (p in o) {
			if (hasOP(o, p)) {
				op = o[p];
				if (Array.isArray(op)) {
					no[p] = _slice.call(op, 0);
				}
				else if (isObj(op)) {
					no[p] = oCpy(op);
				}
				else {
					no[p] = op;
				}
			}
		}
		return no;
	}

	/** throw error
		@param {string} message error message
		@constructor
		@name dError */
	dError = (function () {
		var cons = isMeth(console, 'error'),
			F;

		/* throw error */
		function dErr(message) {
			var err;

			if (!this || !(this instanceof Error)) {
				throw new dError(message);
			}

			this.message = 'dElement Error:\n' + message + '\n';
			this.name = 'dError';
			err = new Error(this.message);
			err.name = this.name;
			this.stack = err.stack;
			if (cons) {
				console.error(this.message);
			}
		}

		if (isMeth(Object, 'create')) {
			dErr.prototype = Object.create(Error.prototype);
		}
		else {
			F = function () {};
			F.prototype = Error.prototype;
			dErr.prototype = new F();
		}
		return dErr;
	})();

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
		@type Array */
	multiProps = ['text', 'event', 'attribute', 'setif', 'html', 'child',
		'comment', 'collect'];

	/** save element reference if one of these props appears
		@type Array */
	saveProps = ['id', 'name'];

	/** recursion counter for variable replacement depth in loop
		@type number */
	loopdepth = 0;

	/** attributes of 'boolean' type. value may be either empty or the attribute name
		@type Array */
	boolProps = [
		'checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple',
		'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected'
	];

	/* ==============  EVENTS  ================= */

	/** handle events */
	function setEvent(evtDcl) {
		var ix, fn,
			o = evtDcl.val,
			el = evtDcl.el;

		o = mapNames(o, {
			'function': 'func',
			'arguments': 'args'
		});

		if (!isObj(o) || !hasOP(o, 'args')) {
			throw new dError('Not a valid event declaration');
		}

		if (Array.isArray(o.args)) {
			/* call external, e.g. cross browser event handling
				o.func is a function reference */
			if (typeof o.func === 'function') {
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
				if (typeof fn === 'function') {
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
		var lcProp = prop.toLowerCase(),
			rProp;

		if (lcProp.indexOf('data-') === 0) {
			/* throw error if data attribute starts with 'data-xml' or contains
				uppercase letters or semicolon */
			if (
				lcProp !== prop ||  /* has uppercase */
				lcProp.indexOf('data-xml') > -1 ||  /* starts with xml */
				lcProp.indexOf(';') > -1
			) {
				throw new dError('data-* property/attribute name may not start with "xml" or' +
					' contain any semicolon or uppercase chars');
			}

			/* dataset stores values as string, so it's best to do the same for all
				data attributes even if dataset API is n/a */
			val = String(val);

			/* set value in dataset API if available.
				ALWAYS use "in" operator, "hasOwnProperty" returns false on elements */
			if ('dataset' in el && isObj(el.dataset)) {
				el.dataset[camelCase(lcProp.substring(5))] = val;
				return el;
			}
			rProp = lcProp;
		}
		else if (boolProps.indexOf(lcProp) > -1) {
			/* handle attributes which work as a switch (either have no value in HTML or
			self reference their name as value (e.g. checked="checked")) */
			if (val === true || (isStr(val) && val.toLowerCase() === lcProp)) {
				val = true;
			}
			else if (val === false || val === '') {
				return el;
			}
			else { /* not a valid value for boolProps */
				throw new dError(
					'switch attribute "' + prop + '" has an invalid value of "' + val +
					'".\nValue may be the attribute\'s name or boolean true only.'
				);
			}
			rProp = lcProp;
		}
		else {
			/* some attribute names must be replaced, eg. for => htmlFor */
			rProp = replaceAttrName(prop);

			if (
				(rProp === 'className' && val === '') || /* prevent empty "className" */
				(typeof val === 'boolean' && !val)
			) {
				return el;
			}
		}

		/* set a property, fallback to setAttribute if assignment fails.
			some old browsers misbehave on "data-" attributes, even in bracket
			notation */
		try {
			el[rProp] = val;
			if (el[rProp] !== val && lcProp !== 'href') {
				/* throw error to apply 'catch' branch */
				throw new Error('value type mismatch in property ' + prop);
			}
		}
		catch (ex) {
			setAttribs(el, {name: rProp, value: val});
		}
		return el;
	}

	/* set property if condition is true */
	function setPropIf(el, pobj) {
		if (isObj(pobj) && hasOP(pobj, 'name') && hasOP(pobj, 'value')) {
			if (hasOP(pobj, 'condition') && !!pobj.condition) {
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

		If document.createComment() is not available, this function adds comment nodes
		to node elements only
	*/
	function addComment(el, comm) {
		if (Array.isArray(comm)) {
			comm.forEach(addComment.bind(null, el));
		}
		else {
			comm = ' ' + comm + ' ';
			if (isMeth(document, 'createComment')) { /* node element and fragment */
				el.appendChild(document.createComment(comm));
			}
			else if (isMeth(el, 'insertAdjacentHTML')) { /* node element only, no fragment */
				el.insertAdjacentHTML('beforeEnd', '<!--' + comm + '-->');
			}
		}
	}

	/** push function reference from init property and element reference to init stack */
	function pushInit(el, val) {
		if (typeof val === 'function') {
			initStack.push({
				el: el,
				func: val
			});
		}
	}

	/** call all init functions in stack
		'this' is a reference to the created element tree
	*/
	function callInit(fobj) {
		fobj.func.call(fobj.el, this);
	}

	/* ==============  LOOPS  ================= */

	/* loop element creation and replace placeholders */
	function loopDecl(s) {
		var step = 1,
			start = 0,
			cnt = 1,
			parr = ['chk', 'sel'],
			isdeep = hasOP(s, 'loopdeep'),
			frg, i, o, lprop, lobj, lcnt;

		if (hasOP(s, 'loop') && isdeep) {
			throw new dError('You may use only one of "loop" OR "loopdeep", not both.');
		}
		lprop = (isdeep) ? 'loopdeep' : 'loop';
		lobj = s[lprop];
		delete s[lprop];

		/* check if lobj is either a valid object or a numeric value */
		if (isObj(lobj) && hasOP(lobj, 'count') && !isNaN(lobj.count)) {

			/* validate loop values count, step and start */
			cnt = Number(lobj.count);
			if (hasOP(lobj, 'step') && !isNaN(lobj.step)) {
				step = Number(lobj.step);
				if (step === 0) {
					step = 1;
				}
			}
			if (hasOP(lobj, 'start') && !isNaN(lobj.start)) {
				start = Number(lobj.start);
			}

			/* validate 'values' array (for "v" placeholder) */
			if (hasOP(lobj, 'values')) {
				if (!Array.isArray(lobj.values)) {
					throw new dError('loop property "values" has to be an array');
				}

				if (!hasOP(lobj, 'valuesrepeat') && lobj.values.length < lobj.count) {
					throw new dError(
						'"values" array has less elements (' + lobj.values.length +
						') than loop count (' + lobj.count + ')'
					);
				}
			}

			/* validate chk/sel properties (checked or selected elements) */
			parr.forEach(function (item) {
				if (hasOP(lobj, item)) {
					if (!Array.isArray(lobj[item]) && isNaN(lobj[item])) {
						throw new dError(
							'type of loop property "' + item + '" must be array or number'
						);
					}
				}
			});
		}
		else if (!isNaN(lobj)) {
			cnt = Number(lobj);
		}
		cnt = Math.abs(Math.round(cnt)); /* make count a positive integer */

		frg = document.createDocumentFragment();

		/* element loop */
		lcnt = 0;
		for (i = start; i < (start + (step * cnt)); i += step) {
			if (Math.floor(i) !== i) { /* float check */
				i = parseFloat(i.toFixed(8), 10); /* avoid rounding errors */
			}

			/* replace placeholders with current values */
			o = replaceCounter(s, i, lcnt, isdeep, lobj);

			/* set checked/selected if one of the properties from "parr" exists */
			if (parr.some(hasOP.bind(null, lobj))) {
				o = setCSFlags(o, lobj, lcnt, parr);
			}

			/* create element tree and append to fragment */
			appendTree.call(frg, o);
			lcnt++;
		}
		//s[lprop] = lobj;
		return frg;
	}

	/**
		find placeholders and replace them with committed values

		@param decl   {object}    dElement declaration object
		@param i      {number}    calculated value
		@param c      {integer}   loop counter
		@param isdeep {boolean}   recursive replace in subdeclarations
		@param lobj   {object}    loop configuration object
		@returns      {object}    declaration with replaced values
	*/
	function replaceCounter(decl, i, c, isdeep, lobj) {
		var o, phreg, p, cc, v;

		/* create copy of declaration */
		o = oCpy(decl);

		/* RegExp to match all parts of "n" and "c" placeholders */
		phreg = /\!\!(?:(\-?\d+(?:\.\d+)?)[•\*]?)?(n|c)([+-]\d+(?:\.\d+)?)?\!\!/gi;
				/*  !!  |   mul number   |mul sign| nc | add/sub number  |  !!  */
				/*      |      [1]       |        | [2]|       [3]       |      */

		/* handle array index if "values" propery is an array */
		if (hasOP(lobj, 'values')) {
			v = lobj.values;
			cc = (hasOP(lobj, 'valuesrepeat'))
				? c % v.length
				: c;
		}

		for (p in o) {
			/* replace all placeholders in string */
			if (isStr(o[p])) {
				/* replace each "v" placeholder with array value */
				if (Array.isArray(v) && o[p].indexOf('!!v!!') > -1) {
					o[p] = o[p].replace(
						/\!\!v\!\!/gi,
						v[cc]
					);
				}

				/* replace each "n" or "c" placeholder with its calculated value */
				o[p] = o[p].replace(
					phreg,
					loopReplace.bind({c: c, i: i})
				);
			}
			else if (
				/* scan for placeholders in subdeclarations until a loop, loopstop or
					loopdeep property is found or loop depth exceeds 1 on loop property
					(but always replace placeholders in first child declaration
					[loopdepth = 0])
				*/
				p === 'child' &&
				isObj(o.child) &&
				!hasOP(o.child, 'loop') &&
				!hasOP(o.child, 'loopdeep') &&
				!hasOP(o.child, 'loopstop') &&
				(isdeep || loopdepth < 1)
			) {
				loopdepth++; /* increase depth counter */
				o.child = replaceCounter(o.child, i, c, isdeep, lobj);
				loopdepth--;
			}
		}
		return o;
	}

	/* callback for op.replace in function replaceCounter:
		calculate value of placeholder and replace it */
	function loopReplace(mch, mul, ty, add) {
		var cv = (ty === 'c')
			? this.c
			: this.i;

		mul = Number(mul);
		if (!isNaN(mul)) {
			cv *= mul;
		}

		add = Number(add);
		if (!isNaN(add)) {
			cv += add;
		}
		return cv;
	}

	/**
		set checked or selected property
		@param o    {object}    original dElement declaration object
		@param lobj {object}    loop configuration object
		@param lc   {Integer}   loop counter
		@param arr  {Array}     array of property names to process
		@returns    {object}    declaration object with replaced values
	*/
	function setCSFlags(o, lobj, lc, arr) {
		var i = arr.length,
			c = lc + 1,
			item, prp;

		while (i--) {
			item = arr[i];
			if (hasOP(lobj, item) && (
				c === lobj[item] ||
				(Array.isArray(lobj[item]) && lobj[item].indexOf(c) > -1)
			)) {
				prp = (item === 'sel') ? 'selected' : 'checked';
				o[prp] = true;
			}
		}
		return o;
	}

	/* ==============  ELEMENT REFERENCES  ================= */

	/** add current element reference to collection */
	function collectElRef(sc, el) {
		if (Array.isArray(sc)) {
			sc.push(el);
		}
		else if (isObj(sc) && hasOP(sc, 'obj') && hasOP(sc, 'name') && isObj(sc.obj)) {
			if (sc.obj[sc.name] === undefined) {
				sc.obj[sc.name] = el;
			}
			else {
				throw new dError(
					'duplicate declaration of ' + sc.name + ' in property "collect"'
				);
			}
		}
		else {
			throw new dError('Value of property "collect" must be an array or an object' +
				' containing the properties "obj" and "name".');
		}
	}

	/** save references of elements with name or id property */
	function saveRefs(rObj, sdata) {
		var pr = sdata.s[sdata.p];

		if (sdata.lp === 'id') {
			rObj.i[pr] = sdata.el;
		}
		else if (sdata.lp === 'name') {
			if (Array.isArray(rObj.n[pr])) {
				rObj.n[pr].push(sdata.el);
			}
			else {
				rObj.n[pr] = [sdata.el];
			}
		}
		return rObj;
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
	function setAttribs(el, att) {
		if (Array.isArray(att)) {
			att.forEach(setAttribs.bind(null, el));
		}
		else if (
			isNode(el) && isObj(att) && hasOP(att, 'name') &&
			hasOP(att, 'value') && isStr(att.name)
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

	/* parseElemStr() */ /*eslint-disable no-multi-spaces */
	parseElemStr = (function () {
		var ETX = '\x03', /* 0x03 (ETX, end of text) */
			US  = '\x1F', /* 0x1F (US, unit separator) */
			WSP = ' \t\r\n\f\x0B\xA0', /* some whitespace */
			MODE_END     = ETX,
			MODE_TAGNAME = '$',
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
		modeChars[MODE_TAGNAME] = {};
		modeChars[MODE_END]     = {};
		modeChars[MODE_CLASS]   = {attrName: 'class', unique: false};
		modeChars[MODE_ID]      = {attrName: 'id'};
		modeChars[MODE_NAME]    = {attrName: 'name'};
		modeChars[MODE_TYPE]    = {attrName: 'type'};
		modeChars[MODE_VALUE]   = {attrName: 'value', stop: false};
		/*eslint-enable no-multi-spaces */

		for (pr in modeChars) {
			if (hasOP(modeChars, pr)) {
				moc += pr;
			}
		}

		/* mode and illegal chars.
			This is not a RegExp; multichar sequences like \s \b \w will not work  */
		stopChars = moc + US + WSP + '%<>*\'"/|\\?^!§&()[]{}+:,;';

		/* wrapper for parser errors */
		function pError(str) {
			throw new dError('Parser error: ' + str);
		}

		/* callback for [].filter: remove duplicate elements in array */
		function removeDupes(cn, ix, arr) {
			return ix === arr.indexOf(cn);
		}

		/* */
		function isStopMode(mo) {
			return !mo || !hasOP(modeChars, mo) || !hasOP(modeChars[mo], 'stop') ||
				modeChars[mo].stop !== false;
		}

		/** join class names from extended syntax and className property, remove
			duplicates

			@param {object}    dcl    element declaration
			@param {Array}     cArr   array with class names from parse
			@returns {string}         space separated class names as string
		*/
		function joinClassNames(dcl, cArr) {
			if (hasOP(dcl, 'className')) {
				cArr = cArr.concat(dcl.className.split(/\s+/));
			}
			return (cArr.length > 1)
				? cArr.filter(removeDupes).join(' ')
				: cArr[0];
		}

		/** parseElemStr()
			parse element string for id, name, class names, value and type and create
			correlating properties

			@param dcl {object}
				current element tree declaration object
			@returns {object}
				altered element tree declaration object
			@function
			@name parseElemStr
		*/
		return function (dcl) {
			var mode = MODE_TAGNAME, /* default mode: string starts with tagname */
				str = dcl.element, /* string to parse */
				part = '', /* parsed word */
				clNames = [], /* collects class names */
				i = 0,
				cnt = {},
				stop = true, /* wether to stop on one of stopChars */
				ch, /* current char */
				mcc, len;

			/* init counters */
			for (mcc in modeChars) {
				if (hasOP(modeChars, mcc)) {
					cnt[mcc] = 0;
				}
			}

			/* remove possible ETX, leading and trailing whitespace in string
				and append ETX end marker */
			str = str.replace(/^\s*(.*)\s*$/g, '$1').replace(ETX, '') + ETX;
			len = str.length;

			/* if first char is in modeChars, "str" doesn't start with element name */
			ch = str.charAt(0);
			if (hasOP(modeChars, ch)) {
				mode = ch;
				i++;
				if (!((/\$[a-z][a-z1-6]?/i).test(str))) { /* tag name not defined*/
					pError('extended syntax without element node name definition\n"' +
						str + '"');
				}
			}

			while (mode !== MODE_END) {
				ch = str.charAt(i);
				i++;

				/* ignore whitespace unless it's within a no stop declaration */
				if (WSP.indexOf(ch) >= 0 && isStopMode(mode)) {
					continue;
				}

				/* when in a no stop mode:
					restore stop mode if ETX or US char is found or if end of string
					and ignore everything until mode change char is detected
				*/
				if (stop === false && (ch === US || ch === ETX || i >= len)) {
					stop = true;

					/* ignore all chars until the next mode changing char appears or
						the string ends */
					while (i < len && !(ch in modeChars)) {
						ch = str.charAt(i);
						i++;
					}
				}

				/* if "ch" is not a stopchar or a no stop mode is activated, append "ch"
					to "part" and continue with next char */
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
					dcl.element = part;
					cnt[MODE_TAGNAME]++;
					break;
				case MODE_CLASS:
					clNames.push(part);
					break;
				default:
					/* find matching attribute name, create property and set its value */
					if (hasOP(modeChars, mode) && hasOP(modeChars[mode], 'attrName')) {
						dcl[modeChars[mode].attrName] = part;
					}
					else {
						pError('mode not supported: "' + mode + '"');
					}
					break;
				}
				part = '';

				/* set new mode based on stop char or throw Error on illegal char */
				if (hasOP(modeChars, ch)) {
					mcc = modeChars[ch];

					/* count the usage of each attribute declaration. if 'unique' is set,
						the count may not exceed 1 */
					cnt[ch]++;
					if (cnt[ch] > 1 && (!hasOP(mcc, 'unique') || mcc.unique !== false)) {
						if (ch === MODE_TAGNAME) {
							pr = ' tag name';
						}
						else if (hasOP(mcc, 'attrName')) {
							pr = mcc.attrName;
						}
						else {
							pr = ' (unknown property)';
						}
						pError('element may not have more than one ' + ch + pr +
							'.\n\t"' + str + '"');
					}

					mode = ch;
					stop = !hasOP(mcc, 'stop') || !!mcc.stop;
				}
				else {
					pError('Illegal char: "' + ch + '" (' + ch.charCodeAt(0) +
						') in "' + str.slice(0, -1) + '" at position ' + i);
				}
			} /* while (mode...) */

			/* combine class names and remove dupes */
			if (clNames.length > 0) {
				dcl.className = joinClassNames(dcl, clNames);
			}

			/* altered declaration */
			return dcl;
		};
	})();

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

	/** convert HTML string (as used with innerHTML) to DOM node tree.
		@function */
	strToNodes = (function () {
		var el = document.createElement('template'),
			isTmpl = 'content' in el,
			createParent;

		if (isTmpl) {
			/* use HTML <template> element if available */
			createParent = function () {
				return document.createElement('template');
			};
		}
		else {
			/* if HTML element 'template' is not available, determine best matching
				parent element or use 'div' otherwise */
			createParent = (function (str) {
				var elp = 'div',
					m;

				m = str.match(/\<\s*([a-z][a-z1-6]*)/i);
				if (m && m.length > 1 && hasOP(this, m[1])) {
					elp = this[m[1]];
				}
				return document.createElement(elp);
			}).bind({
				/* define parent elements for some element types. */
				tr: 'tbody', tbody: 'table', thead: 'table', th: 'tr', td: 'tr',
				tfoot: 'table', caption: 'table', 'option': 'select', li: 'ul',
				dd: 'dl', dt: 'dl', optgroup: 'select', figcaption: 'figure',
				menuitem: 'menu', legend: 'fieldset', summary: 'details'
			});
		}

		return function (hstr) {
			var d = createParent(hstr),
				txt = '',
				frg, fc;

			/* Sadly, applying innerHTML directly to an fragment doesn't work. Using a
				dummy element and then moving it's child nodes to the fragment does the
				trick.
			*/
			try {
				d.innerHTML = hstr;

				/* if 'el' is a <template> element, it's 'content' property already
					references a documentFragment, so we're done */
				if (isTmpl) {
					frg = d.content;
				}
				else {
					/* move all elements to fragment */
					frg = document.createDocumentFragment();
					while ((fc = d.firstChild)) {
						frg.appendChild(fc);
					}
				}
			}
			catch (ex) {
				/*	assigning "str" with innerHTML will fail if content-type of document
					is application/xhtml+xml AND either named entities other than &gt, &lt,
					&amp, &quot, &apos are used OR if "str" contains certain illegal HTML
				*/
				if (ex.code === 12) {
					txt = 'ERROR.\nHTML string most likely contains illegal HTML or ' +
						'uses named entities (restricted when using content-type ' +
						'application/xhtml+xml.\nuse numeric entities instead)\n\n';
				}
				throw new dError(
					txt + 'Error code: ' + ex.code + '\nError message: ' + ex.message +
						'\nContent (leading 200 chars):\n"' + hstr.substring(0, 200) + '…"'
				);
			}

			/* return fragment with children */
			return frg;
		};
	})();

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
			throw new dError('illegal type of property (' + item + ')');
		}
		return el;
	}

	/** create DOM tree and append to object
		expects parent element as 'this', e.g. by calling it:
		appendTree.call(el, dcl) */
	function appendTree(dcl) {
		var s = createTree(dcl);

		if (s) {
			this.appendChild(s);
		}
		return s;
	}

	/** append child nodes */
	function appendChildNodes(el, sp) {
		if (Array.isArray(sp)) {
			sp.forEach(appendChildNodes.bind(null, el));
		}
		else if (isAppendable(sp)) {
			el.appendChild(sp);
		}
		else if (isObj(sp)) {
			appendTree.call(el, sp);
		}
		else {
			el.appendChild(textNode(sp));
		}
	}

	/** clone a node(tree) or a declaration */
	function cloneObject(s) {
		var scl, el,
			clo = hasOP(s, 'clone');

		if (clo && hasOP(s, 'clonetop')) {
			throw new dError('only one of "clone" or "clonetop" may be used.');
		}
		scl = s.clone || s.clonetop;
		if (isAppendable(scl) && isMeth(scl, 'cloneNode')) {
			el = scl.cloneNode(clo); /* clone: true, clonetop: false */
		}
		else if (isObj(scl)) {
			el = createTree(scl);
		}
		if (!isAppendable(el)) {
			throw new dError('this object can\'t be cloned: ' + scl);
		}
		return el;
	}

	/** test for declaration of child nodes for an empty content type element */
	function testVoidAppend(s) {
		var pp = ['text', 'html', 'child'],
			prop, lcProp;

		/* eslint-disable guard-for-in */
		for (prop in s) {
			lcProp = mapMultiProps(prop.toLowerCase());
			if (pp.indexOf(lcProp) > -1) {
				throw new dError('content model of element "' + s.element.toUpperCase() +
				'" is "empty". This element may not contain any child nodes');
			}
		}
		/* eslint-enable guard-for-in */
	}

	/** if a declaration "s" doesn't contain a property "element", then there has to be
		a property "html", "text" or "comment".

		@param    s       declaration object
		@returns          document fragment containing nodes/node tree
		@throws   dError  if neither of the required properties are declared
		@private
	*/
	function noElementDeclaration(s) {
		var frg = document.createDocumentFragment(),
			c = 0,
			prop, lcProp;

		/* eslint-disable guard-for-in, default-case */
		/* handle multi properties 'text', 'comment' and 'html' */
		for (prop in s) {
			lcProp = mapMultiProps(prop.toLowerCase());
			switch (lcProp) {
			case 'text':
				frg.appendChild(textNode(s[prop]));
				break;
			case 'html':
				addNodes(frg, s[prop]);
				c++;
				break;
			case 'comment':
				addComment(frg, s[prop]);
				c++;
				break;
			}
		} /* eslint-enable guard-for-in, default-case */

		/* throw error, if no required property has been defined in s, but skip, if
			either "comm(ent)" or "html" is the only property of "s" and html is empty or
			comment couldn't be added (fragment still empty) */
		if (!frg.hasChildNodes() && c !== 1) {
			throw new dError(
				'Every (sub)declaration object requires at least one of the following ' +
				'properties: "element", "text", "clone", "clonetop", "comment" or "html".'
			);
		}

		/*  return, if documentFragment has childNodes */
		return frg;
	}

	/** walk declaration object (recursive) and create element tree */
	function createTree(s) {
		var frg, lcProp, newEl, prop, sp;

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

		/* s is text string or numeric */
		if (isStr(s) || !isNaN(s)) {
			return textNode(s);
		}

		/* return cloned node */
		if (hasOP(s, 'clone') || hasOP(s, 'clonetop')) {
			return cloneObject(s);
		}

		/* loop: duplicate elements n times and replace placeholder */
		if (hasOP(s, 'loop') || hasOP(s, 'loopdeep')) {
			return loopDecl(s);
		}

		/* normalize shortcut keywords */
		s = mapNames(s, {
			cond: 'condition',
			comm: 'comment',
			attrib: 'attribute',
			attr: 'attribute'
		});

		/* stop processing if property 'condition' exist and it's value is falsy */
		if (hasOP(s, 'condition') && !s.condition) {
			return null;
		}

		/* init or unset reference declaration data */
		if (s.elrefs === null) {
			refs = null;
		}
		else if (isObj(s.elrefs)) {
			refs = s.elrefs;
			refs.i = refs.i || {}; /* collect elements with id */
			refs.n = refs.n || {}; /* collect elements with name */
		}
		delete s.elrefs;

		/*  if a declaration object doesn't include a property named 'element' then
			one of either 'text', 'html', 'comment', 'clone', 'clonetop' MUST be defined.
			'clone' and 'clonetop' are processed above; this part takes care of
			'html', 'text', 'comment'. */
		if (!hasOP(s, 'element')) {
			return noElementDeclaration(s);
		}

		/* s.element holds the name of the element to be created */
		if (!isStr(s.element)) {
			throw new dError('type of property "element" must be string');
		}

		/* uses string parser if value of "s.element" contains chars other than a-z1-6 */
		if ((/[^a-z1-6]/i).test(s.element)) {
			s = parseElemStr(s);
		}

		/* test for declaration of child nodes for empty content type elements */
		if (K345.voidElements.indexOf(s.element) > -1) {
			testVoidAppend(s);
		}

		/** create Element and set certain properties before main loop to avoid some
			browser bugs.

			Bug in IE8 and Opera <= 12: If "type" is not assigned as
			first property on "input" (and maybe other) elements, the "value" property
			might be lost.
		*/
		newEl = document.createElement(s.element);
		formProps.forEach(function (pr) {
			if (hasOP(s, pr)) {
				setProp(newEl, pr, s[pr]);
				delete s[pr];
			}
		});

		/* loop all properties */
		/* eslint-disable guard-for-in */
		for (prop in s) {
			lcProp = prop.toLowerCase();

			/* save element reference when prop is in saveProps */
			if (isObj(refs) && saveProps.indexOf(lcProp) > -1) {
				refs = saveRefs(refs, {
					s: s,
					el: newEl,
					p: prop,
					lp: lcProp
				});
			}

			/*  skip props 'element', 'elrefs', 'clone', 'clonetop' */
			if (skipProps.indexOf(lcProp) > -1) {
				continue;
			}

			/* handle name of a multi-property */
			lcProp = mapMultiProps(lcProp);

			sp = s[prop];

			/* handle property value according to property name */
			switch (lcProp) {

			/* collect element references */
			case 'collect':
				collectElRef(sp, newEl);
				break;

			/* create a text node */
			case 'text':
				newEl.appendChild(textNode(sp));
				break;

			/* create a comment node */
			case 'comment':
				addComment(newEl, sp);
				break;

			/* process sub declaration object or declaration array */
			case 'child':
				appendChildNodes(newEl, sp);
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
				setAttribs(newEl, sp);
				break;

			/* css styles */
			case 'style':
				setStyles(newEl, sp);
				break;

			/* set property on condition */
			case 'setif':
				setPropIf(newEl, sp);
				break;

			/* init functions */
			case 'init':
				pushInit(newEl, sp);
				break;

			/* anything else will be treated as property/attribute of newEl */
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
		@returns {Element|null}
			node tree or fragment or null
	*/
	K345.dElement = function (decl) {
		var dtree;

		if (!Array.isArray(decl) && !isObj(decl)) {
			throw new dError('Parameter has been omitted or is not an object/array');
		}
		/** collect events
			@type Array */
		eventStack = [];

		/** collect init functions
			@type Array */
		initStack = [];

		/** collect element references
			@type Object */
		refs = null;

		dtree = createTree(decl);
		if (dtree) {
			eventStack.forEach(setEvent);
			initStack.forEach(callInit, dtree);
		}
		return dtree || null;
	};

	/** dAppend: create node tree and append it to an existing element

		@param {Element|string} elem
			element reference or id as string

		@param {object} dcl
			element declaration object (see dElement)

		@param {number} [mode=K345.DAPPEND_APPEND]
			possible values for mode:<br>
		'beforeEnd' or<br>
		K345.DAPPEND_LAST or<br>
		K345.DAPPEND_APPEND  -> append to elem (default)<br>
		'beforeBegin' or<br>
		K345.DAPPEND_BEFORE  -> insert before elem<br>
		'afterEnd' or<br>
		K345.DAPPEND_AFTER   -> insert after elem<br>
		'replaceElement' or<br>
		K345.DAPPEND_REPLACE -> replace existing element<br>
		'afterBegin' or<br>
		K345.DAPPEND_FIRST   -> append as first child of element<br>
		'wipeContent' or<br>
		K345.DAPPEND_WIPE    -> wipe existing child elements and append as child of
		element<br><br>

		mode values may *not* be combined!

		@returns {object|null}
			node tree or null

	*/
	K345.dAppend = function (elem, dcl, mode) {
		var nodes = null,
			elc;

		if (isStr(elem)) {
			elem = document.getElementById(elem);
		}

		if (isNode(elem)) {
			nodes = K345.dElement(dcl);
			if (!nodes) {
				return null;
			}

			switch (mode) {

			case 'beforeBegin':
			case K345.DAPPEND_BEFORE:
				elem.parentNode.insertBefore(nodes, elem);
				break;

			case 'afterEnd':
			case K345.DAPPEND_AFTER:
				elem.parentNode.insertBefore(nodes, elem.nextSibling);
				break;

			case 'replaceElement':
			case K345.DAPPEND_REPLACE:
				elem.parentNode.replaceChild(nodes, elem);
				break;

			case 'afterBegin':
			case K345.DAPPEND_FIRST:
				elem.insertBefore(nodes, elem.firstChild);
				break;

			case 'wipeContent':
			case K345.DAPPEND_WIPE:
				while ((elc = elem.lastChild)) {
					elem.removeChild(elc);
				}
				/*jsl:fallthru*/ /* eslint-disable-next-line no-fallthrough */
			case 'beforeEnd':
			case K345.DAPPEND_APPEND:
			case K345.DAPPEND_LAST:
			default:
				elem.appendChild(nodes);
				break;
			}
		}
		return nodes;
	};

	/** append as last child of element (default).
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_APPEND = 0;

	/** append as last child of element (default).
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_LAST = 0;

	/** insert before element.
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_BEFORE = 1;

	/** insert after element.
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_AFTER = 2;

	/** replace element.
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_REPLACE = 3;

	/** append as first child.
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_FIRST = 4;

	/** wipe all existing child nodes and append.
		mode flag for {@link K345.dAppend()}
		@type Constant
	*/
	K345.DAPPEND_WIPE = 5;
})();

/* @@CODEEND DELEM */

/* %% devel on %% */
if ('registerScript' in K345) {
	K345.registerScript('delement');
}
/* %% devel off %% */

/* EOF */
