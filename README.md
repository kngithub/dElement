
Sorry, no real docs yet :(

for now:
* read the (mostly) [german doc](http://javascript.knrs.de/K345/delement/)
  (maybe with a little help of a translation service)
* view delement-test.html for usage examples.  (**caution**! it's a test page, includes invalid test cases)
* read the comments in delement.js


# dElement()
Create DOM node tree.

the main advantage of dElement comes with more complicated / nested structures or loops

## Ok, here's  a _very_ basic example

```javascript
var a = K345.dElement({
    element: 'a',
    href: '/',
    title: 'Home',
    child: {
        element: 'span',
        className: 'noo',
        child: [{ // array because span has more than one child
            element: 'img',
            src: 'foo.png',
            width: 458,
            alt: 'fooooo me'
        }, {
            text: 'Hello!'
        }, {
            element: 'span',
            text: 'Naaaa'
        }]
    }
});
```
HTML representation of above tree would be (minus line breaks and indentation):

```html
<a href="/" title="Home">
    <span class="noo">
        <img src="foo.png" width="458" alt="fooooo me">
        Hello!
        <span>Naaaa</span>
    </span>
</a>
```

same node tree with vanilla code:

```javascript
var a    = document.createElement('a'),
    im   = document.createElement('img'),
    sp1  = document.createElement('span'),
    sp2  = document.createElement('span'),
    txt1 = document.createTextNode('Hello!'),
    txt2 = document.createTextNode('Naaaa');

a.href = '/';
a.title = 'Go home';
im.src = 'foo.png';
im.width = 458;
im.alt = 'fooooo me';
sp2.appendChild(txt2);
sp1.className = 'noo';
sp1.appendChild(im);
sp1.appendChild(txt1);
sp1.appendChild(sp2);
a.appendChild(sp1);
```
already gets slightly confusing here.

## another example:

a select element with 3 options plus simple javascript change event handling.
also watch the similar example in the loop section!

```javascript
var sel = K345.dElement({
    element: 'select',
    id: 'sel1',
    onchange: function() {
        console.log(this.value);
    },
    child: [{ // array for sibling child nodes of select
        // sibling 1
        element: 'option',
        value: 'foo 1',
        child: 'Option 1'
    }, {
        // sibling 2
        element: 'option',
        selected: true,
        value: 'foo 2',
        text: 'Option 2'
    }, {
        // sibling 3
        element: 'option',
        value: 'foo 3',
        child: 'Option 3'
    }]
});
```

## extended syntax
```javascript
// a button
var inp = K345.dElement({
    element: 'input @button .foo #mybutton .bar'
});

// input field with predefined value
var inp2 = K345.dElement({
    element: 'input @text .foo #myinput =my.name@example.org'
});

// code to append elements to DOM tree goes here
...
```
```html
<input type="button" class="foo bar" id="mybutton">
<input type="text" class="foo" id="myinput" value="my.name@example.org">
```

## create multiple elements by loop (including placeholder)
```javascript
var ul2 = K345.dElement({
    element: 'ul',
    child: {
        element: 'li',
        id: 'item-!!n+1!!',
        loop: 5,
        text: '!!n!! times 2 plus 1 equals <b>!!2n+1!!</b>'
    }
});
```
```html
<ul>
    <li id="item-1">0 times 2 plus 1 equals <b>1</b></li>
    <li id="item-2">1 times 2 plus 1 equals <b>3</b></li>
    <li id="item-3">2 times 2 plus 1 equals <b>5</b></li>
    <li id="item-4">3 times 2 plus 1 equals <b>7</b></li>
    <li id="item-5">4 times 2 plus 1 equals <b>9</b></li>
</ul>
```

here's the "three option select" example from above again
```javascript
var sel = K345.dElement({
    element: 'select',
    id: 'sel1',
    onchange: function() {
        console.log(this.value);
    },
    child: {
        element: 'option',
        loop: {count: 3, start: 1}, // start sets loop to 1,2,3 instead of 0,1,2
        value: 'foo !!n!!',
        child: 'Option !!n!!'
    }
});
```

### todo list
- [X] allow multiple properies
- [X] test multiple properties
- [X] test new "condition" keyword
- [X] create elements in loops
- [ ] remove all bugs (yeah, sure)
- [ ] write docs (dream on)


# dAppend()
helper function

dAppend calls dElement and appends created elements to DOM tree.

```javascript
// usage
K345.dAppend(
    String <id> | Node <reference to element>,
    Object <declaration>
    [, Const <appendmode> = K345.DAPPEND_APPEND ]
);
```

where &lt;appendmode> is one of the following "constants" or string values:

* __K345.DAPPEND_APPEND__  or __'beforeEnd'__
    append created element(s) as _last_ child of element (__default__)

* __K345.DAPPEND_FIRST__   or __'afterBegin'__
    append created element(s) as _first_ child of element

* __K345.DAPPEND_BEFORE__  or __'beforeBegin'__
    insert created element(s) _before_ given element

* __K345.DAPPEND_AFTER__   or __'afterEnd'__
    insert created element(s) _after_ given element

* __K345.DAPPEND_REPLACE__ or __'replaceElement'__
    _replace_ element with created element(s)

* __K345.DAPPEND_WIPE__    or __'wipeContent'__
    _wipe all children_ of element and append created element(s)



