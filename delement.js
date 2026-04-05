/*!
	delement.js
	K345 2006-2022, 2025-2026 ö

	dElement() http://js.knrs.de

*/
'use strict';

/* %% devel on %% */
	/* eslint-disable -- internal stuff */
	/*global K345, document*/
	/** @namespace */
	var K345 = K345 || {};
	/* eslint-enable */

	/* eslint new-cap: ["error", { "newIsCapExceptions": ["dError"] }] */

/* %% devel off %% */

/* @@CODESTART DATTR "Javascript" */

/** conversion table for HTML-attribute names
	@type {object} */
K345.attributeNames = K345.attrNames || {
	acceptcharset: 'acceptCharset', accesskey: 'accessKey', alink: 'aLink',
	bgcolor: 'bgColor', cellindex: 'cellIndex', cellpadding: 'cellPadding',
	cellspacing: 'cellSpacing', charoff: 'chOff', 'class': 'className',
	codebase: 'codeBase', codetype: 'codeType', colspan: 'colSpan',
	datetime: 'dateTime', 'for': 'htmlFor', frameborder: 'frameBorder',
	framespacing: 'frameSpacing', ismap: 'isMap', longdesc: 'longDesc',
	marginheight: 'marginHeight', marginwidth: 'marginWidth', maxlength: 'maxLength',
	nohref: 'noHref', noresize: 'noResize', nowrap: 'noWrap',
	readonly: 'readOnly', rowindex: 'rowIndex', rowspan: 'rowSpan',
	tabindex: 'tabIndex', usemap: 'useMap', valign: 'vAlign', vlink: 'vLink'};

/* @@CODEEND DATTR */

/** names of HTML elements with content type "void"
	@type {Array} */
K345.voidElementNames = K345.voidElements || ['area', 'base', 'basefont', 'br', 'col',
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
(function (glob, attrNames, voidElems) {
	/* internal vars */
	var dAppend_regex = (/[#\.=\[\]:\s]+/),
		isInLoop = false,
		eventStack, initStack, refs, loopdepth, ldec, extcount,

		/* predefined data */
		skipProps, saveProps, formProps, boolProps, multiProps,

		/* functions */
		hasOwn, isNode, isEl, isAppendable, isTextNode, parseElemStr;

	/* ==============  COMMON FUNCTIONS  ================= */

	/** test if object 'obj' has own property 'prop'
		@param {object} obj
			Object to test
		@param {string} prop
			Property which must be in 'obj'
		@returns {boolean}
			true, if 'prop' is a native property of 'obj'
		@function
	*/
	hasOwn = (isMeth(Object, 'hasOwn'))

		/* browsers supporting Object.hasOwn() */
		? function (obj, prop) {
			return Object.hasOwn(obj, prop);
		}

		/* fallback for browsers without Object.hasOwn support */
		: function (obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		};

	/** test if el is a nodeElement and has a specific nodeType
		@param {HTMLElement} el
			Element to test
		@returns {boolean}
			true, if nodetype matches item in array '@this'.
		@this {Array} allowed nodeTypes to test against
	*/
	function nodeTest (el) {
		/* "nodeType" in el must NOT be replaced by call to hasOwnProperty! */
		return isObj(el) && 'nodeType' in el && this.indexOf(el.nodeType) > -1;
	}

	/** test: is 'el' a DOM element?
		@function
		@name isEl
		@param {HTMLElement} el
			Element to test
		@returns {boolean}
			true if 'el' is a nodeElement(1)
	*/
	isEl = nodeTest.bind([
		Node.ELEMENT_NODE
	]);

	/** test: is 'el' a DOM element or a documentFragment?
		@function
		@name isNode
		@param {HTMLElement} el
			Element to test
		@returns {boolean}
			true if 'el' is a nodeElement(1) or a documentFragment(11)
	*/
	isNode = nodeTest.bind([
		Node.ELEMENT_NODE,
		Node.DOCUMENT_FRAGMENT_NODE
	]);

	/** test: can 'el' be appended to nodeElements?
		@function
		@name isAppendable
		@param {HTMLElement} el
			Element to test
		@returns {boolean}
			true if 'el' is a nodeElement(1), a documentFragment(11),
			a comment(8) or a textNode(3)
	*/
	isAppendable = nodeTest.bind([
		Node.ELEMENT_NODE,
		Node.TEXT_NODE,
		Node.COMMENT_NODE,
		Node.DOCUMENT_FRAGMENT_NODE
	]);

	/** test: is 'el' a text node?
		@function
		@name isTextNode
		@param {HTMLElement} el
			Element to test
		@returns {boolean}
			true if 'el' is a textNode(3)
	*/
	isTextNode = nodeTest.bind([
		Node.TEXT_NODE
	]);

	/**
		remove dash(es) (-), dots (.) and underscores (_) from a string and convert the
		following char to uppercase
		( no-text => noText  it-is_fine => itIsFine)

		@param {string} str
			original string
		@returns {string}
			modified string
	*/
	function camelCase (str) {
		return str.replace(/[-_\.]./g, function (s) {
			return s.substr(1).toUpperCase();
		});
	}

	/**
		test: is item a string?
		@param {mixed} item
			given item to test against
		@returns {boolean}
			true, if type of given item is 'string'
	*/
	function isStr (item) {
		return typeof item === 'string';
	}

	/**
		test: is o an object but not null or Array object? (simple test)
		@param {mixed} item
			given item to test against
		@returns {boolean}
			true, if type of given item is 'object'
	*/
	function isObj (item) {
		return item !== null && !Array.isArray(item) && typeof item === 'object';
	}

	/**
		test: is "m" a method of "o"?
		@param {object} o
			the given object
		@param {string} m
			method name which should be found in object "o"
		@returns {boolean}
			true, if object "o" contains a method "m"
	*/
	function isMeth (o, m) {
		var t = typeof o[m];

		return ('function|unknown'.indexOf(t) > -1) || (t === 'object' && Boolean(o[m]));
	}

	/**
		create deep copy of an object.
		IMPORTANT: Simplified, because it will only be used for
			dElement declaration objects
		@param {object} o
			object to be cloned
		@returns {object}
			the cloned copy of o
	*/
	function oCpy (o) {
		var no, p;

		try {
			return glob.structuredClone(o); // will fail on e.g. functions
		}
		catch (exc) {
			if (Array.isArray(o)) {
				return o.map(function (itm) {
					return oCpy(itm);
				});
			}
			else if (isObj(o)) {
				no = {};
				for (p in o) {
					if (hasOwn(o, p)) {
						no[p] = oCpy(o[p]);
					}
				}
				return no;
			}
			return o;
		}
	}

	/** throw error
		@param {string} message error message
		@name dError */
	function dError (message) {
		var err;

		if (!this || !(this instanceof Error)) {
			throw new dError(message);
		}

		this.message = 'dElement Error:\n' + message + '\n';
		this.name = 'dError';
		err = new Error(this.message);
		err.name = this.name;
		this.stack = err.stack;
		console.error(this.message);
	}
	dError.prototype = Object.create(Error.prototype);

	/** map property names of an object.

		@param {object} o
			object to be changed
		@param {object} nmap
			description object of property names to change in 'o'
			"oldname": "newname"
		@returns {object}
			changed object
		@example
			var o = {a: 1, b: 42, c: 'hey'}; // before
			o = mapNames(o, {a: 'one', c: 'greet'});
			// o is now {one: 1, b: 42, greet: 'hey'}
	*/
	function mapNames (o, nmap) {
		var pr;

		for (pr in nmap) {
			if (hasOwn(o, pr)) {
				o[nmap[pr]] = o[pr];
				delete o[pr];
			}
		}
		return o;
	}

	/* ================  VARIABLES AND DATA  ================= */

	/** these properties are processed ahead of any remaining properties to avoid
		browser bugs (mainly IE of course). Retain order!
		@type {Array} */
	formProps = ['type', 'name', 'value', 'checked', 'selected'];

	/** skip the following internal properties in createTree() property loop
		@type {Array} */
	skipProps = ['element', 'elrefs', 'clone', 'clonetop'];

	/** multi-properties. These properties may appear multiple times inside a object
		declaration, postfixed by an underscore and an unique identifier
		@type {Array} */
	multiProps = ['text', 'event', 'attribute', 'setif', 'setifelse', 'html', 'child',
		'comment', 'collect'];

	/** save element reference if one of these props appears
		@type {Array} */
	saveProps = ['id', 'name'];

	/** recursion counter for variable replacement depth in loop
		@type {number} */
	loopdepth = 0;

	/** attributes of 'boolean' type. value may be either empty or the attribute name
		@type {Array} */
	boolProps = [
		'checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple',
		'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected'
	];

	/* ==============  EVENTS  ================= */

	/**
		attach event handler(s) to an element

		@param {object} evtDcl
			An object with event data
		@param {HTMLElement} evtDcl.el
			target element to attach element to
		@param {object} evtDcl.val
			object with function/function name and arguments
		@param {string|Function} evtDcl.val.func
			function reference or function name of the event handler
		@param {Array} evtDcl.val.args
			arguments to pass to event handler function
	*/
	function setEvent (evtDcl) {
		var ix, fn,
			o = evtDcl.val,
			el = evtDcl.el;

		o = mapNames(o, {
			'function': 'func',
			'arguments': 'args'
		});

		if (!isObj(o) || !hasOwn(o, 'args')) {
			throw new dError('Not a valid event declaration', o);
		}

		if (!Array.isArray(o.args)) {
			throw new dError('Expected o.args to be array', o.args);
		}

		/* call external, e.g. cross browser event handling
			o.func is a function reference */

		/* o.func is not defined or a string */
		if (typeof o.func !== 'function') {
			/* call method "o.func" of el (defaults to "addEventListener") */
			o.func = o.func || 'addEventListener';
			fn = el[String(o.func)];
			if (typeof fn !== 'function') {
				throw new dError('eventhandler is not a function/method of element', o);
			}
			fn.apply(el, o.args);
			return;
		}

		ix = o.args.indexOf('#el#');

		/* placeholder #el# not found, try to find #elp# */
		if (ix < 0) {
			ix = o.args.indexOf('#elp#');

			/* placeholder #elp# found */
			if (ix >= 0) {
				if (!el.parentNode) {
					throw new dError('placeholder #elp# found, but element ' +
						'has no parent node', evtDcl);
				}
				el = el.parentNode;
			}
			else {
				ix = o.args.indexOf('#elpp#');

				/* placeholder #elpp# found */
				if (ix >= 0) {
					if (!el.parentNode || !el.parentNode.parentNode) {
						throw new dError('placeholder #elpp# found, but element ' +
							'has no grandparent node', evtDcl);
					}
					el = el.parentNode.parentNode;
				}
			}
		}

		/* none of the placeholders was found */
		if (ix < 0) {
			/* insert element reference as first argument */
			o.args.unshift(el);
		}

		/* a placeholder was found */
		else {
			/* insert element reference at defined position */
			o.args.splice(ix, 1, el);
		}

		/* call event set function */
		o.func.apply(el, o.args);
	}

	/**
		add event(s) to event stack

		@param {HTMLElement} el

		@param {Array} eo
	*/
	function pushEvt (el, eo) {
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

	/**
		Set a property "prop" of el to "val".
		Falls back to setAttribute if prop set fails

		@param el {NodeElement}
			Reference to an element to set a property to
		@param prop {string}
			Name of the property/attribute to set
		@param val {mixed}
			The property/attribute value
		@returns {NodeElement}
			The element reference
	*/
	function setProp (el, prop, val) {
		var lcProp = prop.toLowerCase(),
			rProp;

		if (lcProp.indexOf('data-') === 0) {
			/* throw error if data attribute starts with 'data-xml' or contains
				uppercase letters or semicolon */
			if (
				lcProp !== prop || /* has uppercase */
				lcProp.indexOf('data-xml') > -1 || /* starts with xml */
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

		/*
			set a property, fallback to setAttribute if assignment fails.
			some old browsers misbehave on "data-" attributes, even in bracket
			notation
		*/
		try {
			el[rProp] = val;

			/*
				Check if re-read value is the same as 'val'.
				skip 'href' and 'src'; they may differ when expanded to a real path
			*/ /* eslint-disable-next-line eqeqeq */
			if (el[rProp] != val && lcProp !== 'href' && lcProp !== 'src') {
				/* throw error => move to 'catch' branch */
				throw new dError('value type mismatch in property ' + prop);
			}
		}
		catch (ex) {
			setAttribs(el, {name: rProp, value: val});
		}
		return el;
	}

	/**
		set a property if a condition in declaration object is truthy

		@param {nodeElement} el
			Reference to an element to set a property to
		@param {object} pobj
			Object with properties 'name', 'value' and 'condition'
		@param {string} pobj.name
			Property to set if condition is met
		@param {mixed} pobj.value
			Property value to set if condition is met
		@param {boolean} pobj.condition
			Value or expression which is truthy / falsy
	*/
	function setPropIf (el, pobj) {
		if (!isObj(pobj)) { return; }

		pobj = mapNames(pobj, {cond: 'condition'});

		if (
			checkProperties(pobj, ['name', 'value', 'condition']) &&
			pobj.condition === true
		) {
			if (pobj.name !== 'child') {
				setProp(el, pobj.name, pobj.value);
			}
			else if (isObj(pobj.value)) {
				appendTree.call(el, pobj.value);
			}
		}
	}

	/**
		set a property value if a condition in declaration object is truthy
		otherwise set a different property value.
		Note that this sets the property either way (unlike setPropIf) unless
		„condition“ is set to NULL

		@param {nodeElement} el
			Reference to an element to set a property to
		@param {object} pobj
			Object with properties 'name', 'value_true', 'value_false' and 'condition'
		@param {string} pobj.name
			Property name to set (always)
		@param {mixed} pobj.value_true
			Property value to set if condition is met
		@param {mixed} pobj.value_false
			Property value to set if condition is NOT met
		@param {boolean} pobj.condition
			Value or expression which is truthy / falsy
	*/
	function setPropValueIf (el, pobj) {
		var val;

		if (!isObj(pobj)) { return; }

		pobj = mapNames(pobj, {cond: 'condition'});

		if (
			checkProperties(
				pobj,
				['name', 'value_true', 'value_false', 'condition']
			) &&
			pobj.condition !== null
		) {
			val = (pobj.condition === true)
				? pobj.value_true
				: pobj.value_false;

			if (pobj.name !== 'child') {
				setProp(el, pobj.name, val);
			}
			else if (isObj(val)) {
				appendTree.call(el, val);
			}
		}
	}

	/**
		check if ALL properties in 'props' are existant in 'obj'
	*/
	function checkProperties (obj, props) {
		if (!isObj(obj) || !Array.isArray(props)) {
			throw new TypeError('checkProperties: "obj" or "props" of wrong type');
		}
		return props.every(function (item) {
			return hasOwn(obj, item);
		});
	}

	/**
		map property names. returns base name of 'multi' properties
	*/
	function mapMultiProps (p) {
		var base = p.split('_', 1)[0];
		if (multiProps.indexOf(base) > -1) {
			p = base;
		}
		return p;
	}

	/* ==============  MISC  ================= */

	/**
		set element styles
	*/
	function setStyles (el, sty) {
		if (Array.isArray(sty)) {
			sty = sty.join(';');
		}

		/* Prefer element.style.cssText if available. */
		if (el.style.cssText !== undefined) {
			el.style.cssText = sty;
		}
		else {
			el.setAttribute('style', sty);
		}
		return el;
	}

	/**
		create HTML comment node

		If document.createComment() is not available, this function adds comment nodes
		to node elements only
	*/
	function addComment (el, comm) {
		if (Array.isArray(comm)) {
			comm.forEach(addComment.bind(null, el));
		}
		else {
			if (isMeth(document, 'createComment')) { /* node element and fragment */
				el.appendChild(document.createComment(comm));
			}
			else if (isMeth(el, 'insertAdjacentHTML')) { /* node element only, no fragment */
				el.insertAdjacentHTML('beforeEnd', '<!--' + comm + '-->');
			}
		}
	}

	/**
		push function reference from init property and element reference to init stack
	*/
	function pushInit (el, val) {
		if (typeof val === 'function') {
			initStack.push({
				el: el,
				func: val
			});
		}
	}

	/**
		call functions from init stack
		'this' is a reference to the created element tree
	*/
	function callInit (fobj) {
		fobj.func.call(fobj.el, this);
	}

	/* ==============  LOOPS  ================= */

	/**
		loop element creation and replace placeholders
	*/
	function loopDecl (s) {
		var step = 1,
			start = 0,
			cnt = 1,
			pArr = ['chk', 'sel'],
			isdeep = hasOwn(s, 'loopdeep'),
			frg, i, o, lprop, lobj, lcnt;

		if (hasOwn(s, 'loop') && isdeep) {
			throw new dError('You may use only one of "loop" OR "loopdeep", not both.');
		}
		lprop = (isdeep) ? 'loopdeep' : 'loop';
		lobj = s[lprop];
		delete s[lprop];

		/* check if lobj is either a valid object or a numeric value */
		if (
			isObj(lobj) && (
				(hasOwn(lobj, 'count') && !isNaN(lobj.count)) ||
				(hasOwn(lobj, 'values') && Array.isArray(lobj.values))
			)
		) {

			/*
				set property 'count' from array length of 'values' if it was omitted
				or if count value is greater than array length; but not, if property
				'valuesrepeat' is set (would force set 'count' to array length otherwise)
			*/
			if (Array.isArray(lobj.values) && (
				isNaN(lobj.count) ||
				(lobj.count > lobj.values.length && !hasOwn(lobj, 'valuesrepeat'))
			)) {
				lobj.count = lobj.values.length;
			}

			/* validate loop values count, step and start */
			cnt = Number(lobj.count);
			if (hasOwn(lobj, 'step') && !isNaN(lobj.step)) {
				step = Number(lobj.step);
				if (step === 0) {
					step = 1;
				}
			}
			if (hasOwn(lobj, 'start') && !isNaN(lobj.start)) {
				start = Number(lobj.start);
			}

			/* validate 'values' array (for "v" placeholder) */
			if (hasOwn(lobj, 'values')) {
				if (!Array.isArray(lobj.values)) {
					throw new dError('loop property "values" has to be an array');
				}

				if (!hasOwn(lobj, 'valuesrepeat') && lobj.values.length < lobj.count) {
					throw new dError(
						'"values" array has less elements (' + lobj.values.length +
						') than loop count (' + lobj.count + ').\nAdd more items to' +
						' the array or set "valuesrepeat" mode.'
					);
				}
			}

			/* validate chk/sel properties (checked or selected elements) */
			pArr.forEach(function (item) {
				if (hasOwn(lobj, item)) {
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
			o = replaceCounter({
				declaration: s,
				value: i,
				counter: lcnt,
				recursive: isdeep,
				config: lobj
			});

			/* make values available to outside */
			extcount = {
				c: lcnt,
				n: i
			};

			/* set checked/selected if one of the properties from "pArr" exists */
			if (pArr.some(hasOwn.bind(null, lobj))) {
				o = setCSFlags({
					declaration: o,
					config: lobj,
					loopcount: lcnt,
					properties: pArr
				});
			}

			/* create element tree and append to fragment */
			appendTree.call(frg, o);
			lcnt++;
		}

		/* write it back to s */
		s[lprop] = lobj;
		return frg;
	}

	/**
		find placeholders and replace them with committed values

		@param   {object}  argObj
			object with required values
		@param   {object}  argObj.declaration
			dElement declaration object
		@param   {number}  argObj.value
			calculated value
		@param   {number} argObj.counter
			loop counter
		@param   {boolean} argObj.recursive
			recursive replace in subdeclarations
		@param   {object}  argObj.config
			loop configuration object
		@returns {object}
			declaration with replaced values
	*/
	function replaceCounter (argObj) {
		var i = argObj.value,
			c = argObj.counter,
			isdeep = argObj.recursive,
			lobj = argObj.config,
			o = oCpy(argObj.declaration), /* create copy of declaration */
			phreg, p, cc, v;

		/* RegExp to match all parts of "n" and "c" placeholders */
		phreg = /\!\!(?:([+-]?\d+(?:\.\d+)?)[·•\*]?)?(n|c)([+-]\d+(?:\.\d+)?)?\!\!/gi;
				/*  !!  |   mul number     |mul sign | nc | add/sub number  |  !!  */
				/*      |      [1]         |optional | [2]|      [3]        |      */

		/* handle array index if "values" propery is an array */
		if (hasOwn(lobj, 'values')) {
			v = lobj.values;
			cc = (hasOwn(lobj, 'valuesrepeat'))
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
					loopReplace.bind(null, c, i)
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
				!hasOwn(o.child, 'loop') &&
				!hasOwn(o.child, 'loopdeep') &&
				!hasOwn(o.child, 'loopstop') &&
				(isdeep || loopdepth < 1)
			) {
				loopdepth++; /* increase depth counter */
				o.child = replaceCounter({
					declaration: o.child,
					value: i,
					counter: c,
					recursive: isdeep,
					config: lobj
				});
				loopdepth--;
			}
		}
		return o;
	}

	/**
		callback for op.replace in function replaceCounter:
		calculate value of placeholder and replace it.

		@param {number} cnt
			loop counter
		@param {number} val
			loop value
		@param {string} matched
			matched string (not used)
		@param {string} mul
			multiplier (can include leading "+" or "-")
		@param {string} ptype
			placeholder type (n or c for loop value or counter)
		@param {string} add
			sum to add (can include leading "+" or "-")
		@return {number}
			final calculated value for placeholder replacement
	*/ /* eslint-disable-next-line max-params */
	function loopReplace (cnt, val, matched, mul, ptype, add) {
		/* determine type of value */
		var cv = (ptype.toLowerCase() === 'c')
			? cnt /* loop counter */
			: val; /* calculated value */

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
		set checked or selected property in declaration

		@param {object} argObj.declaration
			original dElement declaration object
		@param {object} argObj.config
			loop configuration object
		@param {number} argObj.loopcount
			loop counter
		@param {array}  argObj.properties
			array of property names to process
		@returns    {object}
			declaration object with replaced values
	*/
	function setCSFlags (argObj) {
		var o = argObj.declaration,
			lobj = argObj.config,
			lc = argObj.loopcount,
			arr = argObj.properties,
			i = arr.length,
			c = lc + 1,
			item, prp;

		while (i--) {
			item = arr[i];
			if (hasOwn(lobj, item) && (
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

	/**
		add current element reference to collection

		@param {array|object} sc
			reference to collection array or object
		@param {NodeElement} el
			reference to newly created Element
	*/
	function collectElRef (sc, el) {
		if (Array.isArray(sc)) {
			sc.push(el);
		}
		else if (isObj(sc) && checkProperties(sc, ['obj', 'name']) && isObj(sc.obj)) {
			if (sc.obj[sc.name] !== undefined) {
				throw new dError(
					'duplicate declaration of ' + sc.name + ' in property "collect"'
				);
			}
			sc.obj[sc.name] = el;
		}
		else {
			throw new dError('Value of property "collect" must be an array or an object' +
				' containing the properties "obj" and "name".');
		}
	}

	/**
		save references of elements with name or id property
	*/
	function saveRefs (rObj, sdata) {
		var pr = sdata.s[sdata.p];

		if (sdata.lp === 'id') {
			rObj.i[pr] = sdata.el;
		}

		if (sdata.lp === 'name') {
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

	/**
		replace special property names
	*/
	function replaceAttrName (atn) {
		var lcAtt = atn.toLowerCase();

		return (lcAtt in attrNames)
			? attrNames[lcAtt]
			: camelCase(atn);
	}

	/**
		set attributes with setAttribute(). will be used only when enforced by property
		attr|attrib|attribute or with certain problematic properties

		value has to be either
			- an object containing properties value and name
				e.g.  attribute: {name: 'foo', value: 'bar'}
			- an array with objects as described above
	*/
	function setAttribs (el, att) {
		if (Array.isArray(att)) {
			att.forEach(setAttribs.bind(null, el));
		}
		else if (
			isNode(el) && isObj(att) && checkProperties(att, ['name', 'value']) &&
			isStr(att.name)
		) {
			if (att.name.toLowerCase() === 'style') {
				/* setAttribute with "style" fails in some browsers, handle it */
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

		for (pr in modeChars) {
			if (hasOwn(modeChars, pr)) {
				moc += pr;
			}
		}

		/** mode and illegal chars.
			This is not a RegExp; multichar sequences like \s \b \w will not work  */
		stopChars = moc + US + WSP + '%<>*\'"/|\\?^!§&()[]{}+:,;';

		/** wrapper for parser errors */
		function pError (str) {
			throw new dError('Parser error: ' + str);
		}

		/**
			callback for [].filter in joinClassNames():
			detect duplicate elements in array

			@param {$_TYPE_$} cn

			@param {$_TYPE_$} ix

			@param {$_TYPE_$} arr

			@returns {boolean}

		*/
		function removeDupes (cn, ix, arr) {
			return ix === arr.indexOf(cn);
		}

		/** */
		function isStopMode (mo) {
			return !mo || !hasOwn(modeChars, mo) || !hasOwn(modeChars[mo], 'stop') ||
				modeChars[mo].stop !== false;
		}

		/** join class names from extended syntax and className property, remove
			duplicates

			@param {object}    dcl    element declaration
			@param {Array}     cArr   array with class names from parse
			@returns {string}         space separated class names as string
		*/
		function joinClassNames (dcl, cArr) {
			if (hasOwn(dcl, 'className')) {
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
				if (hasOwn(modeChars, mcc)) {
					cnt[mcc] = 0;
				}
			}

			/* remove possible enclosed ETX, leading and trailing whitespace in string
				and append ETX end marker */
			str = str.trim().replace(ETX, '') + ETX;
			len = str.length;

			/* if first char is in modeChars, "str" doesn't start with element name */
			ch = str.charAt(0);
			if (hasOwn(modeChars, ch)) {
				mode = ch;
				i++;

				if (!((/\$\s*[a-z][a-z1-6]?/i).test(str))) { /* tag name not defined */
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
					if (hasOwn(modeChars, mode) && hasOwn(modeChars[mode], 'attrName')) {
						dcl[modeChars[mode].attrName] = part;
					}
					else {
						pError('mode not supported: "' + mode + '"');
					}
					break;
				}
				part = '';

				/* set new mode based on stop char or throw Error on illegal char */
				if (hasOwn(modeChars, ch)) {
					mcc = modeChars[ch];

					/* count the usage of each attribute declaration. if 'unique' is set,
						the count may not exceed 1 */
					cnt[ch]++;
					if (cnt[ch] > 1 && (!hasOwn(mcc, 'unique') || mcc.unique !== false)) {
						if (ch === MODE_TAGNAME) {
							pr = ' tag name';
						}
						else if (hasOwn(mcc, 'attrName')) {
							pr = mcc.attrName;
						}
						else {
							pr = ' (unknown property)';
						}
						pError('element may not have more than one ' + ch + pr +
							'.\n\t"' + str + '"');
					}

					mode = ch;
					stop = !hasOwn(mcc, 'stop') || Boolean(mcc.stop);
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
	function textNode (txt, addspc) {
		var spc = (addspc) ? ' ' : '';

		if (Array.isArray(txt)) {
			return document.createTextNode(txt.join(spc) + spc);
		}
		else if (typeof txt === 'string' || typeof txt === 'number') {
			return document.createTextNode(txt + spc);
		}
		else if (isTextNode(txt)) {
			if (addspc) { txt.nodeValue += spc; }
			return txt;
		}
		throw new TypeError('textnode: unsupported type. ' + JSON.stringify(txt));
	}

	/**
		convert HTML string (as used with innerHTML) to DOM node tree.
		@function
		@param {string} htmlstr
			(hopefully valid) HTML string
		@returns {documentFragment}
			created DOM documentFragment with child nodes
	*/
	function strToNodes (htmlstr) {
		var txt = '',
			tmpl;

		try {
			tmpl = document.createElement('template');
			tmpl.innerHTML = htmlstr;

			/* the 'content' property of the template element already
				references a documentFragment, so we're done */
			return tmpl.content;
		}
		catch (ex) {
			/* assigning "htmlstr" with innerHTML will fail if content-type of document
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
					'\nContent (leading 200 chars):\n"' + htmlstr.substring(0, 200) + '…"'
			);
		}
	}

	/** appends elements, DOM tree or HTML string to a given parent
		node element.

		@param {HTMLElement} el
		@param {*} item
		@returns {HTMLElement}
		@throws {dError}
			if type of item to be added is not allowed
	*/
	function addNodes (el, item) {
		if (isAppendable(item)) {
			el.appendChild(item);
		}
		else if (isStr(item)) {
			/* handle HTML string */
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
		appendTree.call(el, dcl)

		@param {object} dcl
			a dElement declaration object
		@returns {HTMLElement}
			created element or element array
		@this {HTMLElement}
			Element to append created element(s) to.
	*/
	function appendTree (dcl) {
		var s = createTree(dcl);
		if (s) {
			this.appendChild(s);
		}
		return s;
	}

	/** append child nodes to an element.

		@param {HTMLElement} el
			root element to append created content to
		@param {*} sp
			content to append. Can be an element(tree), a dElement declaration object,
			a text or an array of all of the former.
	*/
	function appendChildNodes (el, sp) {
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

	/**
		clone a node(tree) or a declaration^

		@param {object} s
			dElement declaration object or node tree
		@throws dError
			if cloning failed
	*/
	function cloneObject (s) {
		var scl, el,
			clo = hasOwn(s, 'clone');

		if (clo && hasOwn(s, 'clonetop')) {
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

	/**
		test for declaration of children for an empty content type element

		@param {object} s
			dElement declaration object
		@throws dError
			if a empty element has children
	*/
	function testVoidAppend (s) {
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

	/**
		if a declaration "s" does not contain a property "element", then there MUST be
		a property "html", "text" or "comment".

		@param {object} s
			declaration object
		@returns {DocumentFragment}
			document fragment containing nodes/node tree
		@throws dError
			if neither of the required properties are declared
	*/
	function noElementDeclaration (s) {
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
			case 'text-ws':
				frg.appendChild(textNode(s[prop], true));
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
				'properties:\n"element", "text", "clone", "clonetop", "comment" or "html".'
			);
		}

		/*  return, if documentFragment has childNodes */
		return frg;
	}

	/**
		process declaration object (recursive) and create element tree

		@param {object} s
			declaration object
		@returns {HTMLElement|DocumentFragment|Text|Comment}
			created node(s)/node tree
		@throws dError
			in case of an unrecoverable error.
	*/
	function createTree (s) {
		var frg, lcProp, newEl, prop;

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
		if (hasOwn(s, 'clone') || hasOwn(s, 'clonetop')) {
			return cloneObject(s);
		}

		/* loop: duplicate elements n times and replace placeholder */
		if (hasOwn(s, 'loop') || hasOwn(s, 'loopdeep')) {
			isInLoop = true;
			ldec = loopDecl(s);
			isInLoop = false;
			return ldec;
		}

		/* normalize shortcut keywords */
		s = mapNames(s, {
			cond: 'condition',
			comm: 'comment',
			attrib: 'attribute',
			attr: 'attribute'
		});

		/* stop processing if property 'condition' exist and it's value is falsy */
		if (hasOwn(s, 'condition') && !s.condition) {
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
		if (!hasOwn(s, 'element')) {
			return noElementDeclaration(s);
		}

		/* s.element holds the name of the element to be created */
		if (!isStr(s.element)) {
			throw new dError('type of property "element" must be string');
		}

		/* uses string parser if value of "s.element" contains chars other than
			"a-z", "0-9" or "-" */
		if ((/[^a-z0-9\-]/i).test(s.element)) {
			s = parseElemStr(s);
		}

		/* test for declaration of child nodes for empty content type elements */
		if (voidElems.indexOf(s.element) > -1) {
			testVoidAppend(s);
		}

		/** create element and set certain properties before main loop to avoid some
			browser bugs.

			Bug in IE8 and Opera <= 12: If "type" is not assigned as
			first property on "input" (and maybe other) elements, the "value" property
			might be lost.
		*/
		newEl = document.createElement(s.element);

		formProps.forEach(function (pr) {
			if (hasOwn(s, pr)) {
				setProp(this, pr, s[pr]);
				delete s[pr];
			}
		}, newEl);

		/* loop all properties */
		/* eslint-disable guard-for-in */
		for (prop in s) {
			lcProp = prop.toLowerCase();

			/* save element reference when prop is in saveProps */
			if (isObj(refs) && saveProps.indexOf(lcProp) > -1) {
				if (isInLoop) {
					throw new dError('can\'t use "elrefs" in a loop for now.');
				}

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

			/* handle property value according to property name */
			switch (lcProp) {

			/* collect element references */
			case 'collect':
				if (isInLoop) {
					throw new dError('can\'t use "collect" in a loop for now.');
				}

				collectElRef(s[prop], newEl);
				break;

			/* create a text node */
			case 'text':
				newEl.appendChild(textNode(s[prop]));
				break;

			/* create a text node with trailing whitespace */
			case 'text-ws':
				newEl.appendChild(textNode(s[prop], true));
				break;

			/* create a comment node */
			case 'comment':
				addComment(newEl, s[prop]);
				break;

			/* process sub declaration object or declaration array */
			case 'child':
				appendChildNodes(newEl, s[prop]);
				break;

			/* add eventhandler to current element */
			case 'event':
				pushEvt(newEl, s[prop]);
				break;

			/* process html string */
			case 'html':
				addNodes(newEl, s[prop]);
				break;

			/*  enforced usage of setAttribute() */
			case 'attribute':
				setAttribs(newEl, s[prop]);
				break;

			/* css styles */
			case 'style':
				setStyles(newEl, s[prop]);
				break;

			/* set a property on condition */
			case 'setif':
				setPropIf(newEl, s[prop]);
				break;

			/* set a property value on condition */
			case 'setifelse':
				setPropValueIf(newEl, s[prop]);
				break;

			/* init functions */
			case 'init':
			case 'initnorun':
				pushInit(newEl, s[prop]);
				break;

			/* anything else will be treated as property/attribute of newEl */
			default:
				setProp(newEl, prop, s[prop]);
				break;
			}
		}

		/* eslint-enable guard-for-in */
		return newEl;
	}

	/* ==============  dElement() & dAppend()  ================= */
	/**
		dElement: create node tree from declaration object

		@param {object} decl
			element declaration object
		@returns {HTMLElement|DocumentFragment|null}
			node tree or fragment or null
	*/
	K345.dElement = function (decl) {
		var dtree;

		if (!Array.isArray(decl) && !isObj(decl)) {
			throw new dError('Declaration has been omitted or value is not an object/array');
		}
		/** collect events
			@type {Array} */
		eventStack = [];

		/** collect init functions
			@type {Array} */
		initStack = [];

		/** collect element references
			@type {object} */
		refs = null;

		dtree = createTree(decl);
		if (dtree) {
			eventStack.forEach(setEvent);
			initStack.forEach(callInit, dtree);
		}
		return dtree || null;
	};

	/**
		dAppend: create node tree and append it to an existing element

		@param {HTMLElement|string} elem
			element reference or id as string

		@param {object} decl
			element declaration object (see dElement)

		@param {string|number} [mode=K345.DAPPEND_APPEND]
			set append mode

		<pre>
		possible values for mode:

		'beforeEnd' or
		K345.DAPPEND_LAST or
		K345.DAPPEND_LASTCHILD or
		K345.DAPPEND_APPEND  => append to 'elem' (default)

		'beforeBegin' or
		K345.DAPPEND_BEFORE  => insert before 'elem'

		'afterEnd' or
		K345.DAPPEND_AFTER   => insert after 'elem'

		'replaceElement' or
		K345.DAPPEND_REPLACE => replace existing element

		'afterBegin' or
		K345.DAPPEND_FIRST   => append as first child of 'elem'

		'wipeContent' or
		K345.DAPPEND_WIPE    => wipe existing child elements and append as child of
		'elem'

		mode values MAY NOT be combined!</pre>

		@returns {HTMLElement|DocumentFragment|null}
			node tree or null

	*/
	K345.dAppend = function (elem, decl, mode) {
		var nodes = null,
			elc;

		if (isStr(elem)) {
			/* if one of the regex test chars is found in "elem" string, it's not
				a id string. might be a css like selector */
			elem = (dAppend_regex.test(elem))
				? document.querySelector(elem)
				: document.getElementById(elem);
		}

		if (isNode(elem)) {
			nodes = K345.dElement(decl);
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
				/* eslint-disable-next-line spaced-comment */
				/*jsl:fallthru*/
			case 'beforeEnd':
			case K345.DAPPEND_APPEND:
			case K345.DAPPEND_LAST:
			case K345.DAPPEND_LASTCHILD:
			default:
				elem.appendChild(nodes);
				break;
			}
		}
		return nodes;
	};

	/** append as last child of element (default).
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_APPEND = 0;

	/** append as last child of element (default).
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_LAST = 0;

	/** append as last child of element (default).
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_LASTCHILD = 0;

	/** insert before element.
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_BEFORE = 1;

	/** insert after element.
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_AFTER = 2;

	/** replace element.
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_REPLACE = 3;

	/** append as first child.
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_FIRST = 4;

	/** wipe all existing child nodes and append.
		mode flag for {@link K345.dAppend()}
		@constant
	*/
	K345.DAPPEND_WIPE = 5;

})(this, K345.attributeNames, K345.voidElementNames);

/* @@CODEEND DELEM */

/* %% devel on %% */
if ('registerScript' in K345) {
	K345.registerScript('delement');
}
/* %% devel off %% */

/* EOF */
