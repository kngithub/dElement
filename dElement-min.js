/*!
	delement.js ö
	K345 2006-2018
*/
var K345=K345||{};"use strict";if("requireScript" in K345){K345.requireScript("array16","function")}K345.attrNames=K345.attrNames||{acceptcharset:"acceptCharset",accesskey:"accessKey",alink:"aLink",bgcolor:"bgColor",cellindex:"cellIndex",cellpadding:"cellPadding",cellspacing:"cellSpacing",charoff:"chOff","class":"className",codebase:"codeBase",codetype:"codeType",colspan:"colSpan",datetime:"dateTime","for":"htmlFor",frameborder:"frameBorder",framespacing:"frameSpacing",ismap:"isMap",longdesc:"longDesc",marginheight:"marginHeight",marginwidth:"marginWidth",maxlength:"maxLength",nohref:"noHref",noresize:"noResize",nowrap:"noWrap",readonly:"readOnly",rowindex:"rowIndex",rowspan:"rowSpan",tabindex:"tabIndex",usemap:"useMap",valign:"vAlign",vlink:"vLink"};K345.voidElements=K345.voidElements||["area","base","basefont","br","col","command","embed","frame","hr","img","input","isindex","keygen","link","meta","param","source","track","wbr"];(function(){var s,v,P,B,C,q,Q,F,j,M,h,c,u,p,D,r,x,i;if(!z(Array,"isArray")||!z(Function.prototype,"bind")||!z(Array.prototype,"indexOf")||!z(Array.prototype,"forEach")||!z(Array.prototype,"filter")||!z(Array.prototype,"map")||!z(document,"createDocumentFragment")||!k(K345.attrNames)||!Array.isArray(K345.voidElements)){M("A required methods/property is missing or an external value is of wrong type.")}r=(function(){var U=Object.prototype.hasOwnProperty;return function(W,V){return U.call(W,V)}})();function K(U){return k(U)&&"nodeType" in U&&this.indexOf(U.nodeType)>-1}c=K.bind([1]);h=K.bind([1,11]);u=K.bind([1,3,8,11]);p=K.bind([3]);function n(U){return U.replace(/\-./g,function(V){return V.substr(1).toUpperCase()})}function H(U){return typeof U==="string"}function k(U){return U!==null&&typeof U==="object"&&!Array.isArray(U)}function z(W,U){var V=typeof W[U];return("function|unknown".indexOf(V)>-1)||(V==="object"&&!!W[U])}D=(z(Object,"create")&&(Object.create({a:3})).a===3)?function(U){return Object.create(U)}:function(V){function U(){}U.prototype=V;return new U()};M=(function(){var U=z(console,"error");return function(V){V="dElement Error:\n"+V+"\n";if(U){console.error(V)}throw new Error(V)}})();function m(V,U){var W;for(W in U){if(r(V,W)){V[U[W]]=V[W];delete V[W]}}return V}Q=["type","name","value","checked","selected"];C=["element","elrefs","clone","clonetop"];B=["text","event","attribute","setif","html","child","comment","collect"];q=["id","name"];s=null;P=0;F=["checked","compact","declare","defer","disabled","ismap","multiple","nohref","noresize","noshade","nowrap","readonly","selected"];function J(U){var V,X,Y=U.val,W=U.el;Y=m(Y,{"function":"func","arguments":"args"});if(!k(Y)||!r(Y,"args")){M("Not a valid event declaration")}if(Array.isArray(Y.args)){if(typeof Y.func==="function"){V=Y.args.indexOf("#el#");if(V<0){V=Y.args.indexOf("#elp#");if(V>=0){if(!W.parentNode){return}W=W.parentNode}else{V=Y.args.indexOf("#elpp#");if(V>=0){if(!W.parentNode||!W.parentNode.parentNode){return}W=W.parentNode.parentNode}}}if(V<0){Y.args.unshift(W)}else{Y.args.splice(V,1,W)}Y.func.apply(W,Y.args)}else{Y.func=Y.func||"addEventListener";X=W[String(Y.func)];if(typeof X==="function"){X.apply(W,Y.args)}}}}function f(V,U){if(!Array.isArray(U)){U=[U]}U.forEach(function(W){s.push({el:V,val:W})})}function L(W,Z,Y){var U=Z.toLowerCase(),X;if(U.indexOf("data-")===0){if(U!==Z||U.indexOf("data-xml")>-1||U.indexOf(";")>-1){M('data-* property/attribute name may not start with "xml" or contain any semicolon or uppercase chars')}Y=String(Y);if("dataset" in W&&k(W.dataset)){W.dataset[n(U.substring(5))]=Y;return W}X=U}else{if(F.indexOf(U)>-1){if(Y===true||(H(Y)&&Y.toLowerCase()===U)){Y=true}else{if(Y===false||Y===""){return W}else{M('switch attribute "'+Z+'" has an invalid value of "'+Y+"\".\nValue may be the attribute's name or boolean true only.")}}X=U}else{X=l(Z);if((X==="className"&&Y==="")||(typeof Y==="boolean"&&!Y)){return W}}}try{W[X]=Y;if(W[X]!==Y&&U!=="href"){throw new Error("value type mismatch in property "+Z)}}catch(V){W.setAttribute(X,Y)}return W}function T(V,U){if(k(U)&&r(U,"name")&&r(U,"value")){if(r(U,"condition")&&!!U.condition){if(U.name!=="child"){L(V,U.name,U.value)}else{if(k(U.value)){t.call(V,U.value)}}}}}function w(W){var U=W.indexOf("_"),V;if(U>0){V=W.substring(0,U);if(B.indexOf(V)>-1){W=V}}return W}function o(V,U){if(Array.isArray(U)){U=U.join(";")}if(V.style.cssText!==undefined){V.style.cssText=U}else{V.setAttribute("style",U)}return V}function d(U){if(Array.isArray(U)){U.forEach(d,this)}else{U=" "+U+" ";if(z(document,"createComment")){this.appendChild(document.createComment(U))}else{if(z(this,"insertAdjacentHTML")){this.insertAdjacentHTML("beforeEnd","<!--"+U+"-->")}}}}function e(ae){var Z=1,W=0,aa=1,U=0,V=r(ae,"loopdeep"),Y,ac,X,ad,ab;if(r(ae,"loop")&&V){M('You may use only one of "loop" OR "loopdeep", not both.');return null}ad=(V)?"loopdeep":"loop";ab=ae[ad];delete ae[ad];if(k(ab)&&r(ab,"count")&&!isNaN(ab.count)){aa=Number(ab.count);if(r(ab,"step")&&!isNaN(ab.step)){Z=Number(ab.step);if(Z===0){Z=1}}if(r(ab,"start")&&!isNaN(ab.start)){W=Number(ab.start)}if(r(ab,"values")){if(!Array.isArray(ab.values)){M('loop property "values" has to be an array')}if(!r(ab,"valuesrepeat")&&ab.values.length<ab.count){M('"values" array has less elements ('+ab.values.length+") than loop count ("+ab.count+")")}}}else{if(!isNaN(ab)){aa=Number(ab)}}aa=Math.abs(Math.round(aa));Y=document.createDocumentFragment();for(ac=W;ac<(W+(Z*aa));ac+=Z){if(Math.floor(ac)!==ac){ac=parseFloat(ac.toFixed(8),10)}X=y(ae,ac,U,V,ab);t.call(Y,X);U++}ae[ad]=ab;return Y}function y(ag,ab,ae,U,Y){var W,Z,aa,V,af,ad,ac,X,ah;W=D(ag);Z=/\!\![^v!\s]+\!\!/gi;aa=/\!\!(?:(\-?\d+(?:\.\d+)?)[•\*]?)?(n|c)([+-]\d+(?:\.\d+)?)?\!\!/i;if(r(Y,"values")){ah=Y.values;X=(r(Y,"valuesrepeat"))?ae%ah.length:ae}for(V in W){if(H(W[V])){ac=W[V];if(Array.isArray(ah)&&ac.indexOf("!!v!!")>-1){ac=ac.replace(/\!\!v\!\!/gi,ah[X])}while((ad=Z.exec(W[V]))!==null){af=ad[0].match(aa);if(Array.isArray(af)&&af.length>3){ac=A(ac,(af[2]==="c"?ae:ab),af)}}W[V]=ac}else{if(V==="child"&&k(W.child)&&!r(W.child,"loop")&&!r(W.child,"loopdeep")&&!r(W.child,"loopstop")&&(U||P<1)){P++;W.child=y(W.child,ab,ae,U,Y);P--}}}return W}function A(V,U,Y){var X=Number(Y[1]),W=Number(Y[3]);if(!isNaN(X)&&X!==0){U*=X}if(!isNaN(W)){U+=W}return V.replace(Y[0],U)}function g(V,U){if(Array.isArray(V)){V.push(U)}else{if(k(V)&&r(V,"obj")&&r(V,"name")&&k(V.obj)){if(V.obj[V.name]===undefined){V.obj[V.name]=U}else{M("duplicate declaration of "+V.name+' in property "collect"')}}else{M('Value of property "collect" must be an array or an object containing the properties "obj" and "name".')}}}function S(U){var V=U.s[U.p];if(U.lp==="id"){this.i[V]=U.el}else{if(U.lp==="name"){if(Array.isArray(this.n[V])){this.n[V].push(U.el)}else{this.n[V]=[U.el]}}}}function l(V){var U=V.toLowerCase();return(U in K345.attrNames)?K345.attrNames[U]:n(V)}function E(U){var V=this;if(Array.isArray(U)){U.forEach(E,V)}else{if(h(V)&&k(U)&&r(U,"name")&&r(U,"value")&&H(U.name)){if(U.name.toLowerCase()==="style"){o(V,U.value)}else{V.setAttribute(U.name,U.value)}}}return V}x=(function(){var aj="\x03",ag="\x1F",ac=" \t\r\n\f\x0B\xA0",W=aj,aa="$",Z="#",Y=".",ai="~",ab="@",ad="=",U={},ae="",ah,V;U[aa]={};U[W]={};U[Y]={attrName:"class",unique:false};U[Z]={attrName:"id"};U[ai]={attrName:"name"};U[ab]={attrName:"type"};U[ad]={attrName:"value",stop:false};for(V in U){if(r(U,V)){ae+=V}}ah=ae+ag+ac+"%<>*'\"/|\\?^!§&()[]{}+:,;";function af(ak){M("parser: "+ak)}function X(ak){return !ak||!r(U,ak)||!r(U[ak],"stop")||U[ak].stop!==false}return function(al){var aq=aa,at=al.element,am="",ao=[],ap=0,an={},au=true,ak,av,ar;for(av in U){if(r(U,av)){an[av]=0}}at=at.replace(/^\s*(.*)\s*$/g,"$1").replace(aj,"")+aj;ar=at.length;ak=at.charAt(0);if(r(U,ak)){aq=ak;ap++;if(!(/\$[a-z][a-z1-6]?/i.test(at))){af('extended syntax without element node name definition\n"'+at+'"')}}while(aq!==W){ak=at.charAt(ap);ap++;if(ac.indexOf(ak)>=0&&X(aq)){continue}if(au===false&&(ak===ag||ak===aj||ap>=ar)){au=true;while(ap<ar&&!(ak in U)){ak=at.charAt(ap);ap++}}if(ah.indexOf(ak)<0||au===false){am+=ak;continue}if(am.length===0){af('empty value in mode "'+aq+'" "'+at.slice(0,-1)+'"')}switch(aq){case aa:al.element=am;an[aa]++;break;case Y:ao.push(am);break;default:if(r(U,aq)&&r(U[aq],"attrName")){al[U[aq].attrName]=am}else{af('mode not supported: "'+aq+'"')}break}am="";if(r(U,ak)){av=U[ak];an[ak]++;if(an[ak]>1&&(!r(av,"unique")||av.unique!==false)){if(ak===aa){V=" tag name"}else{if(r(av,"attrName")){V=av.attrName}else{V=" (unknown property)"}}af("element may not have more than one "+ak+V+'.\n\t"'+at+'"')}aq=ak;au=!r(av,"stop")||!!av.stop}else{af('Illegal char: "'+ak+'" ('+ak.charCodeAt(0)+') in "'+at.slice(0,-1)+'" at position '+ap)}}if(ao.length>0){al.className=ao.join(" ")}return al}})();function R(U){if(Array.isArray(U)){return document.createTextNode(U.join(""))}return p(U)?U:document.createTextNode(U)}i=(function(){var W=document.createElement("template"),V="content" in W,U;if(V){U=function(){return document.createElement("template")}}else{U=(function(Z){var Y="div",X;X=Z.match(/\<\s*([a-z][a-z1-6]*)/i);if(X&&X.length>1&&r(this,X[1])){Y=this[X[1]]}return document.createElement(Y)}).bind({tr:"tbody",tbody:"table",thead:"table",th:"tr",td:"tr",tfoot:"table",caption:"table",option:"select",li:"ul",dd:"dl",dt:"dl",optgroup:"select",figcaption:"figure",menuitem:"menu",legend:"fieldset",summary:"details"})}return function(ac){var ab=U(ac),X="",Y,aa;try{ab.innerHTML=ac;if(V){Y=ab.content}else{Y=document.createDocumentFragment();while((aa=ab.firstChild)){Y.appendChild(aa)}}}catch(Z){if(Z.code===12){X="ERROR.\nHTML string most likely contains illegal HTML or uses named entities (restricted when using content-type application/xhtml+xml.\nuse numeric entities instead)\n\n"}M(X+"Error code: "+Z.code+"\nError message: "+Z.message+'\nContent (leading 200 chars):\n"'+ac.substring(0,200)+'…"')}return Y}})();function O(U,V){if(u(V)){U.appendChild(V)}else{if(H(V)){if(V===""){return U}if(c(U)){U.insertAdjacentHTML("beforeend",V)}else{if(z(U,"appendChild")){U.appendChild(i(V))}}}else{if(Array.isArray(V)){V.forEach(O.bind(null,U))}else{M("illegal type of property ("+V+")")}}}return U}function t(V){var U=G(V);if(U){this.appendChild(U)}return U}function N(U){if(Array.isArray(U)){U.forEach(t,this)}else{if(u(U)){this.appendChild(U)}else{if(k(U)){t.call(this,U)}else{this.appendChild(R(U))}}}}function a(W){var U,X,V=r(W,"clone");if(V&&r(W,"clonetop")){M('only one of "clone" or "clonetop" may be used.')}U=W.clone||W.clonetop;if(u(U)&&z(U,"cloneNode")){X=U.cloneNode(V)}else{if(k(U)){X=G(U)}}if(!u(X)){M("this object can't be cloned: "+U)}return X}function I(W){var V=["text","html","child"],X,U;for(X in W){U=w(X.toLowerCase());if(V.indexOf(U)>-1){M('content model of element "'+W.element.toUpperCase()+'" is "empty". This element may not contain any child nodes')}}}j=(function(){function U(V){if(r(this.decl,V)){L(this.el,V,this.decl[V])}}return function(W){var V=document.createElement(W.element);Q.forEach(U,{el:V,decl:W});return V}})();function b(W){var V=document.createDocumentFragment(),Y=0,X,U;for(X in W){U=w(X.toLowerCase());switch(U){case"text":V.appendChild(R(W[X]));break;case"html":O(V,W[X]);Y++;break;case"comment":d.call(V,W[X]);Y++;break}}if(!V.hasChildNodes()&&Y!==1){M('Every (sub)declaration object requires at least one of the following properties: "element", "text", "clone", "clonetop", "comment" or "html".')}return V}function G(W){var V,U,Y,Z,X;if(Array.isArray(W)){V=document.createDocumentFragment();W.forEach(t,V);return V}if(u(W)){return W}if(H(W)){return R(W)}if(r(W,"clone")||r(W,"clonetop")){return a(W)}if(r(W,"loop")||r(W,"loopdeep")){return e(W)}W=m(W,{cond:"condition",comm:"comment",attrib:"attribute",attr:"attribute"});if(r(W,"condition")&&!W.condition){return null}if(W.elrefs===null){v=null}else{if(k(W.elrefs)){v=W.elrefs;v.i=v.i||{};v.n=v.n||{}}}delete W.elrefs;if(!r(W,"element")){return b(W)}if(!H(W.element)){M('type of property "element" must be string')}if((/[^a-z1-6]/i).test(W.element)){W=x(W)}if(K345.voidElements.indexOf(W.element)>-1){I(W)}Y=j(W);if(!Y){M("can't create element \""+W.element+'".')}for(Z in W){U=Z.toLowerCase();if(k(v)&&q.indexOf(U)>-1){S.call(v,{s:W,el:Y,p:Z,lp:U})}if(C.indexOf(U)>-1||Q.indexOf(U)>-1){continue}U=w(U);X=W[Z];switch(U){case"collect":g(X,Y);break;case"text":Y.appendChild(R(X));break;case"comment":d.call(Y,X);break;case"child":N.call(Y,X);break;case"event":f(Y,X);break;case"html":O(Y,X);break;case"attribute":E.call(Y,X);break;case"style":o(Y,X);break;case"setif":T(Y,X);break;default:L(Y,Z,X);break}}return Y}K345.dElement=function(U){var V;if(!Array.isArray(U)&&!k(U)){M("Parameter has been omitted or is not an object/array")}s=[];v=null;V=G(U);if(V){s.forEach(J)}return V||null};K345.dAppend=function(V,W,Y){var U=null,X;if(H(V)){V=document.getElementById(V)}if(h(V)){U=K345.dElement(W);if(!U){return null}switch(Y){case"beforeBegin":case K345.DAPPEND_BEFORE:V.parentNode.insertBefore(U,V);break;case"afterEnd":case K345.DAPPEND_AFTER:V.parentNode.insertBefore(U,V.nextSibling);break;case"replaceElement":case K345.DAPPEND_REPLACE:V.parentNode.replaceChild(U,V);break;case"afterBegin":case K345.DAPPEND_FIRST:V.insertBefore(U,V.firstChild);break;case"wipeContent":case K345.DAPPEND_WIPE:while((X=V.lastChild)){V.removeChild(X)}case"beforeEnd":case K345.DAPPEND_APPEND:case K345.DAPPEND_LAST:default:V.appendChild(U);break}}return U};K345.DAPPEND_APPEND=0;K345.DAPPEND_LAST=0;K345.DAPPEND_BEFORE=1;K345.DAPPEND_AFTER=2;K345.DAPPEND_REPLACE=3;K345.DAPPEND_FIRST=4;K345.DAPPEND_WIPE=5})();if("registerScript" in K345){K345.registerScript("delement")};