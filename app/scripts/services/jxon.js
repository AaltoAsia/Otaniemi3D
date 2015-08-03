'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.JXON
 * @description
 * JXON framework - Copyleft 2011 by Mozilla Developer Network
 * Revision #1 - September 5, 2014
 * https://developer.mozilla.org/en-US/docs/JXON
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 */
angular.module('otaniemi3dApp')
  .service('JXON', function () {

    var sValProp = 'keyValue',
        sAttrProp = 'keyAttributes',
        sAttrsPref = '@';

    function loadObjTree (oXMLDoc, oParentEl, oParentObj) {

      var vValue, oChild;

      if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
        oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
        if (oParentObj === oParentObj.valueOf()) { return; }
      } else if (oParentObj.constructor === Date) {
        oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
      }

      for (var sName in oParentObj) {
        vValue = oParentObj[sName];
        if (isFinite(sName) || vValue instanceof Function) { continue; } /* verbosity level is 0 */
        if (sName === sValProp) {
          if (vValue !== null && vValue !== true) { oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
        } else if (sName === sAttrProp) { /* verbosity level is 3 */
          for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
        } else if (sName.charAt(0) === sAttrsPref) {
          oParentEl.setAttribute(sName.slice(1), vValue);
        } else if (vValue.constructor === Array) {
          for (var nItem = 0; nItem < vValue.length; nItem++) {
            oChild = oXMLDoc.createElement(sName);
            loadObjTree(oXMLDoc, oChild, vValue[nItem]);
            oParentEl.appendChild(oChild);
          }
        } else {
          oChild = oXMLDoc.createElement(sName);
          if (vValue instanceof Object) {
            loadObjTree(oXMLDoc, oChild, vValue);
          } else if (vValue !== null && vValue !== true) {
            oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
          }
          oParentEl.appendChild(oChild);
        }
      }

    }

    Element.prototype.appendJXON = function (oObjTree) {
      loadObjTree(document, this, oObjTree);
      return this;
    };

    this.createXML = function (oObjTree, sNamespaceURI,
        sQualifiedName, oDocumentType) {
      var oNewDoc = document.implementation.createDocument(sNamespaceURI || null, sQualifiedName || '', oDocumentType || null);
      loadObjTree(oNewDoc, oNewDoc, oObjTree);
      return oNewDoc;
    };

});
