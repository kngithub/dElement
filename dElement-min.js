/*!
	delement.js ö
	K345 2006-2018
*/
var K345=K345||{};if("requireScript" in K345){K345.requireScript("array16","function");}K345.attrNames=K345.attrNames||{acceptcharset:"acceptCharset",accesskey:"accessKey",alink:"aLink",bgcolor:"bgColor",cellindex:"cellIndex",cellpadding:"cellPadding",cellspacing:"cellSpacing",charoff:"chOff","class":"className",codebase:"codeBase",codetype:"codeType",colspan:"colSpan",datetime:"dateTime","for":"htmlFor",frameborder:"frameBorder",framespacing:"frameSpacing",ismap:"isMap",longdesc:"longDesc",marginheight:"marginHeight",marginwidth:"marginWidth",maxlength:"maxLength",nohref:"noHref",noresize:"noResize",nowrap:"noWrap",readonly:"readOnly",rowindex:"rowIndex",rowspan:"rowSpan",tabindex:"tabIndex",usemap:"useMap",valign:"vAlign",vlink:"vLink"};K345.voidElements=K345.voidElements||["area","base","basefont","br","col","command","embed","frame","hr","img","input","isindex","keygen","link","meta","param","source","track","wbr"];(function(){"use strict";var s,D,v,S,F,q,T,H,E,P,i,d,u,p,r,x,j;if(!A(Array,"isArray")||!A(Array.prototype,"filter")||!A(Array.prototype,"forEach")||!A(Array.prototype,"indexOf")||!A(Array.prototype,"some")||!A(Function.prototype,"bind")||!A(document,"createDocumentFragment")||!k(K345.attrNames)||!Array.isArray(K345.voidElements)){P("A required methods/property is missing or an external value is of wrong type.");}r=(function(){var X=Object.prototype.hasOwnProperty;return function(Z,Y){return X.call(Z,Y);};})();function M(X){return k(X)&&"nodeType" in X&&this.indexOf(X.nodeType)>-1;}d=M.bind([1]);i=M.bind([1,11]);u=M.bind([1,3,8,11]);p=M.bind([3]);function n(X){return X.replace(/\-./g,function(Y){return Y.substr(1).toUpperCase();});}function J(X){return typeof X==="string";}function k(X){return X!==null&&typeof X==="object"&&!Array.isArray(X);}function A(Z,X){var Y=typeof Z[X];return("function|unknown".indexOf(Y)>-1)||(Y==="object"&&!!Z[X]);}function y(Z){var Y={},X,aa;for(X in Z){if(r(Z,X)){aa=Z[X];if(Array.isArray(aa)){Y[X]=Array.prototype.slice.call(aa,0);}else{if(k(aa)){Y[X]=y(aa);}else{Y[X]=aa;}}}}return Y;}P=(function(){var X=A(console,"error");return function(Y){Y="dElement Error:\n"+Y+"\n";if(X){console.error(Y);}throw new Error(Y);};})();function m(Y,X){var Z;for(Z in X){if(r(Y,Z)){Y[X[Z]]=Y[Z];delete Y[Z];}}return Y;}T=["type","name","value","checked","selected"];F=["element","elrefs","clone","clonetop"];E=["text","event","attribute","setif","html","child","comment","collect"];q=["id","name"];S=0;H=["checked","compact","declare","defer","disabled","ismap","multiple","nohref","noresize","noshade","nowrap","readonly","selected"];function L(Y){var X,aa,ab=Y.val,Z=Y.el;ab=m(ab,{"function":"func","arguments":"args"});if(!k(ab)||!r(ab,"args")){P("Not a valid event declaration");}if(Array.isArray(ab.args)){if(typeof ab.func==="function"){X=ab.args.indexOf("#el#");if(X<0){X=ab.args.indexOf("#elp#");if(X>=0){if(!Z.parentNode){return;}Z=Z.parentNode;}else{X=ab.args.indexOf("#elpp#");if(X>=0){if(!Z.parentNode||!Z.parentNode.parentNode){return;}Z=Z.parentNode.parentNode;}}}if(X<0){ab.args.unshift(Z);}else{ab.args.splice(X,1,Z);}ab.func.apply(Z,ab.args);}else{ab.func=ab.func||"addEventListener";aa=Z[String(ab.func)];if(typeof aa==="function"){aa.apply(Z,ab.args);}}}}function g(Y,X){if(!Array.isArray(X)){X=[X];}X.forEach(function(Z){s.push({el:Y,val:Z});});}function N(Z,ac,ab){var X=ac.toLowerCase(),aa;if(X.indexOf("data-")===0){if(X!==ac||X.indexOf("data-xml")>-1||X.indexOf(";")>-1){P('data-* property/attribute name may not start with "xml" or contain any semicolon or uppercase chars');}ab=String(ab);if("dataset" in Z&&k(Z.dataset)){Z.dataset[n(X.substring(5))]=ab;return Z;}aa=X;}else{if(H.indexOf(X)>-1){if(ab===true||(J(ab)&&ab.toLowerCase()===X)){ab=true;}else{if(ab===false||ab===""){return Z;}else{P('switch attribute "'+ac+'" has an invalid value of "'+ab+"\".\nValue may be the attribute's name or boolean true only.");}}aa=X;}else{aa=l(ac);if((aa==="className"&&ab==="")||(typeof ab==="boolean"&&!ab)){return Z;}}}try{Z[aa]=ab;if(Z[aa]!==ab&&X!=="href"){throw new Error("value type mismatch in property "+ac);}}catch(Y){Z.setAttribute(aa,ab);}return Z;}function W(Y,X){if(k(X)&&r(X,"name")&&r(X,"value")){if(r(X,"condition")&&!!X.condition){if(X.name!=="child"){N(Y,X.name,X.value);}else{if(k(X.value)){t.call(Y,X.value);}}}}}function w(Z){var X=Z.indexOf("_"),Y;if(X>0){Y=Z.substring(0,X);if(E.indexOf(Y)>-1){Z=Y;}}return Z;}function o(Y,X){if(Array.isArray(X)){X=X.join(";");}if(Y.style.cssText!==undefined){Y.style.cssText=X;}else{Y.setAttribute("style",X);}return Y;}function e(X){if(Array.isArray(X)){X.forEach(e,this);}else{X=" "+X+" ";if(A(document,"createComment")){this.appendChild(document.createComment(X));}else{if(A(this,"insertAdjacentHTML")){this.insertAdjacentHTML("beforeEnd","<!--"+X+"-->");}}}}function B(X,Y){if(typeof Y==="function"){D.push({el:X,func:Y});}}function O(X){X.func.call(X.el,this);}function f(ai){var ac=1,aa=0,ad=1,af=["chk","sel"],Z=r(ai,"loopdeep"),Y,ag,ab,ah,ae,X;if(r(ai,"loop")&&Z){P('You may use only one of "loop" OR "loopdeep", not both.');return null;}ah=(Z)?"loopdeep":"loop";ae=ai[ah];delete ai[ah];if(k(ae)&&r(ae,"count")&&!isNaN(ae.count)){ad=Number(ae.count);if(r(ae,"step")&&!isNaN(ae.step)){ac=Number(ae.step);if(ac===0){ac=1;}}if(r(ae,"start")&&!isNaN(ae.start)){aa=Number(ae.start);}if(r(ae,"values")){if(!Array.isArray(ae.values)){P('loop property "values" has to be an array');}if(!r(ae,"valuesrepeat")&&ae.values.length<ae.count){P('"values" array has less elements ('+ae.values.length+") than loop count ("+ae.count+")");}}af.forEach(function(aj){if(r(ae,aj)){if(!Array.isArray(ae[aj])&&isNaN(ae[aj])){P('type of loop property "'+aj+'" must be array or number');}}});}else{if(!isNaN(ae)){ad=Number(ae);}}ad=Math.abs(Math.round(ad));Y=document.createDocumentFragment();X=0;for(ag=aa;ag<(aa+(ac*ad));ag+=ac){if(Math.floor(ag)!==ag){ag=parseFloat(ag.toFixed(8),10);}ab=z(ai,ag,X,Z,ae);if(af.some(r.bind(null,ae))){ab=c(ab,ae,X,af);}t.call(Y,ab);X++;}return Y;}function z(ag,ad,af,X,ab){var Z,ac,Y,ae,aa,ah;Z=y(ag);ac=/\!\!(?:(\-?\d+(?:\.\d+)?)[•\*]?)?(n|c)([+-]\d+(?:\.\d+)?)?\!\!/gi;if(r(ab,"values")){ah=ab.values;aa=(r(ab,"valuesrepeat"))?af%ah.length:af;}for(Y in Z){if(J(Z[Y])){ae=Z[Y];if(Array.isArray(ah)&&ae.indexOf("!!v!!")>-1){ae=ae.replace(/\!\!v\!\!/gi,ah[aa]);}ae=ae.replace(ac,C.bind(null,af,ad));Z[Y]=ae;}else{if(Y==="child"&&k(Z.child)&&!r(Z.child,"loop")&&!r(Z.child,"loopdeep")&&!r(Z.child,"loopstop")&&(X||S<1)){S++;Z.child=z(Z.child,ad,af,X,ab);S--;}}}return Z;}function C(ad,Z,ac,ab,X,aa){var Y=(X==="c")?ad:Z;ab=Number(ab);if(!isNaN(ab)){Y*=ab;}aa=Number(aa);if(!isNaN(aa)){Y+=aa;}return Y;}function c(ad,Y,ab,X){var Z=X.length,ae=ab+1,aa,ac;while(Z--){aa=X[Z];if(r(Y,aa)&&(ae===Y[aa]||(Array.isArray(Y[aa])&&Y[aa].indexOf(ae)>-1))){ac=(aa==="sel")?"selected":"checked";ad[ac]=true;}}return ad;}function h(Y,X){if(Array.isArray(Y)){Y.push(X);}else{if(k(Y)&&r(Y,"obj")&&r(Y,"name")&&k(Y.obj)){if(Y.obj[Y.name]===undefined){Y.obj[Y.name]=X;}else{P("duplicate declaration of "+Y.name+' in property "collect"');}}else{P('Value of property "collect" must be an array or an object containing the properties "obj" and "name".');}}}function V(X){var Y=X.s[X.p];if(X.lp==="id"){this.i[Y]=X.el;}else{if(X.lp==="name"){if(Array.isArray(this.n[Y])){this.n[Y].push(X.el);}else{this.n[Y]=[X.el];}}}}function l(Y){var X=Y.toLowerCase();return(X in K345.attrNames)?K345.attrNames[X]:n(Y);}function G(X){var Y=this;if(Array.isArray(X)){X.forEach(G,Y);}else{if(i(Y)&&k(X)&&r(X,"name")&&r(X,"value")&&J(X.name)){if(X.name.toLowerCase()==="style"){o(Y,X.value);}else{Y.setAttribute(X.name,X.value);}}}return Y;}x=(function(){var am="\x03",Y="\x1F",ah=" \t\r\n\f\x0B\xA0",ae=am,ab="$",ac="#",Z=".",ak="~",ao="@",ad="=",af={},an="",ag,ai;af[ab]={};af[ae]={};af[Z]={attrName:"class",unique:false};af[ac]={attrName:"id"};af[ak]={attrName:"name"};af[ao]={attrName:"type"};af[ad]={attrName:"value",stop:false};for(ai in af){if(r(af,ai)){an+=ai;}}ag=an+Y+ah+"%<>*'\"/|\\?^!§&()[]{}+:,;";function aj(ap){P("parser: "+ap);}function X(ar,aq,ap){return aq===ap.indexOf(ar);}function aa(ap){return !ap||!r(af,ap)||!r(af[ap],"stop")||af[ap].stop!==false;}function al(aq,ap){if(r(aq,"className")){ap=ap.concat(aq.className.split(/\s+/));}return(ap.length>1)?ap.filter(X).join(" "):ap[0];}return function(ax){var av=ab,ay=ax.element,aq="",at=[],au=0,ar={},az=true,ap,aA,aw;for(aA in af){if(r(af,aA)){ar[aA]=0;}}ay=ay.replace(/^\s*(.*)\s*$/g,"$1").replace(am,"")+am;aw=ay.length;ap=ay.charAt(0);if(r(af,ap)){av=ap;au++;if(!(/\$[a-z][a-z1-6]?/i.test(ay))){aj('extended syntax without element node name definition\n"'+ay+'"');}}while(av!==ae){ap=ay.charAt(au);au++;if(ah.indexOf(ap)>=0&&aa(av)){continue;}if(az===false&&(ap===Y||ap===am||au>=aw)){az=true;while(au<aw&&!(ap in af)){ap=ay.charAt(au);au++;}}if(ag.indexOf(ap)<0||az===false){aq+=ap;continue;}if(aq.length===0){aj('empty value in mode "'+av+'" "'+ay.slice(0,-1)+'"');}switch(av){case ab:ax.element=aq;ar[ab]++;break;case Z:at.push(aq);break;default:if(r(af,av)&&r(af[av],"attrName")){ax[af[av].attrName]=aq;}else{aj('mode not supported: "'+av+'"');}break;}aq="";if(r(af,ap)){aA=af[ap];ar[ap]++;if(ar[ap]>1&&(!r(aA,"unique")||aA.unique!==false)){if(ap===ab){ai=" tag name";}else{if(r(aA,"attrName")){ai=aA.attrName;}else{ai=" (unknown property)";}}aj("element may not have more than one "+ap+ai+'.\n\t"'+ay+'"');}av=ap;az=!r(aA,"stop")||!!aA.stop;}else{aj('Illegal char: "'+ap+'" ('+ap.charCodeAt(0)+') in "'+ay.slice(0,-1)+'" at position '+au);}}if(at.length>0){ax.className=al(ax,at);}return ax;};})();function U(X){if(Array.isArray(X)){return document.createTextNode(X.join(""));}return p(X)?X:document.createTextNode(X);}j=(function(){var Z=document.createElement("template"),Y="content" in Z,X;if(Y){X=function(){return document.createElement("template");};}else{X=(function(ac){var ab="div",aa;aa=ac.match(/\<\s*([a-z][a-z1-6]*)/i);if(aa&&aa.length>1&&r(this,aa[1])){ab=this[aa[1]];}return document.createElement(ab);}).bind({tr:"tbody",tbody:"table",thead:"table",th:"tr",td:"tr",tfoot:"table",caption:"table",option:"select",li:"ul",dd:"dl",dt:"dl",optgroup:"select",figcaption:"figure",menuitem:"menu",legend:"fieldset",summary:"details"});}return function(ae){var af=X(ae),aa="",ab,ad;try{af.innerHTML=ae;if(Y){ab=af.content;}else{ab=document.createDocumentFragment();while((ad=af.firstChild)){ab.appendChild(ad);}}}catch(ac){if(ac.code===12){aa="ERROR.\nHTML string most likely contains illegal HTML or uses named entities (restricted when using content-type application/xhtml+xml.\nuse numeric entities instead)\n\n";}P(aa+"Error code: "+ac.code+"\nError message: "+ac.message+'\nContent (leading 200 chars):\n"'+ae.substring(0,200)+'…"');}return ab;};})();function R(X,Y){if(u(Y)){X.appendChild(Y);}else{if(J(Y)){if(Y===""){return X;}if(d(X)){X.insertAdjacentHTML("beforeend",Y);}else{if(A(X,"appendChild")){X.appendChild(j(Y));}}}else{if(Array.isArray(Y)){Y.forEach(R.bind(null,X));}else{P("illegal type of property ("+Y+")");}}}return X;}function t(Y){var X=I(Y);if(X){this.appendChild(X);}return X;}function Q(X){if(Array.isArray(X)){X.forEach(t,this);}else{if(u(X)){this.appendChild(X);}else{if(k(X)){t.call(this,X);}else{this.appendChild(U(X));}}}}function a(aa){var X,Z,Y=r(aa,"clone");if(Y&&r(aa,"clonetop")){P('only one of "clone" or "clonetop" may be used.');}X=aa.clone||aa.clonetop;if(u(X)&&A(X,"cloneNode")){Z=X.cloneNode(Y);}else{if(k(X)){Z=I(X);}}if(!u(Z)){P("this object can't be cloned: "+X);}return Z;}function K(Z){var Y=["text","html","child"],aa,X;for(aa in Z){X=w(aa.toLowerCase());if(Y.indexOf(X)>-1){P('content model of element "'+Z.element.toUpperCase()+'" is "empty". This element may not contain any child nodes');}}}function b(Z){var Y=document.createDocumentFragment(),ab=0,aa,X;for(aa in Z){X=w(aa.toLowerCase());switch(X){case"text":Y.appendChild(U(Z[aa]));break;case"html":R(Y,Z[aa]);ab++;break;case"comment":e.call(Y,Z[aa]);ab++;break;}}if(!Y.hasChildNodes()&&ab!==1){P('Every (sub)declaration object requires at least one of the following properties: "element", "text", "clone", "clonetop", "comment" or "html".');}return Y;}function I(Z){var Y,X,ab,ac,aa;if(Array.isArray(Z)){Y=document.createDocumentFragment();Z.forEach(t,Y);return Y;}if(u(Z)){return Z;}if(J(Z)||!isNaN(Z)){return U(Z);}if(r(Z,"clone")||r(Z,"clonetop")){return a(Z);}if(r(Z,"loop")||r(Z,"loopdeep")){return f(Z);}Z=m(Z,{cond:"condition",comm:"comment",attrib:"attribute",attr:"attribute"});if(r(Z,"condition")&&!Z.condition){return null;}if(Z.elrefs===null){v=null;}else{if(k(Z.elrefs)){v=Z.elrefs;v.i=v.i||{};v.n=v.n||{};}}delete Z.elrefs;if(!r(Z,"element")){return b(Z);}if(!J(Z.element)){P('type of property "element" must be string');}if((/[^a-z1-6]/i).test(Z.element)){Z=x(Z);}if(K345.voidElements.indexOf(Z.element)>-1){K(Z);}ab=document.createElement(Z.element);T.forEach(function(ad){if(r(Z,ad)){N(ab,ad,Z[ad]);delete Z[ad];}});for(ac in Z){X=ac.toLowerCase();if(k(v)&&q.indexOf(X)>-1){V.call(v,{s:Z,el:ab,p:ac,lp:X});}if(F.indexOf(X)>-1){continue;}X=w(X);aa=Z[ac];switch(X){case"collect":h(aa,ab);break;case"text":ab.appendChild(U(aa));break;case"comment":e.call(ab,aa);break;case"child":Q.call(ab,aa);break;case"event":g(ab,aa);break;case"html":R(ab,aa);break;case"attribute":G.call(ab,aa);break;case"style":o(ab,aa);break;case"setif":W(ab,aa);break;case"init":B(ab,aa);break;default:N(ab,ac,aa);break;}}return ab;}K345.dElement=function(X){var Y;if(!Array.isArray(X)&&!k(X)){P("Parameter has been omitted or is not an object/array");}s=[];D=[];v=null;Y=I(X);if(Y){s.forEach(L);D.forEach(O,Y);}return Y||null;};K345.dAppend=function(Y,Z,ab){var X=null,aa;if(J(Y)){Y=document.getElementById(Y);}if(i(Y)){X=K345.dElement(Z);if(!X){return null;}switch(ab){case"beforeBegin":case K345.DAPPEND_BEFORE:Y.parentNode.insertBefore(X,Y);break;case"afterEnd":case K345.DAPPEND_AFTER:Y.parentNode.insertBefore(X,Y.nextSibling);break;case"replaceElement":case K345.DAPPEND_REPLACE:Y.parentNode.replaceChild(X,Y);break;case"afterBegin":case K345.DAPPEND_FIRST:Y.insertBefore(X,Y.firstChild);break;case"wipeContent":case K345.DAPPEND_WIPE:while((aa=Y.lastChild)){Y.removeChild(aa);}case"beforeEnd":case K345.DAPPEND_APPEND:case K345.DAPPEND_LAST:default:Y.appendChild(X);break;}}return X;};K345.DAPPEND_APPEND=0;K345.DAPPEND_LAST=0;K345.DAPPEND_BEFORE=1;K345.DAPPEND_AFTER=2;K345.DAPPEND_REPLACE=3;K345.DAPPEND_FIRST=4;K345.DAPPEND_WIPE=5;})();if("registerScript" in K345){K345.registerScript("delement");}