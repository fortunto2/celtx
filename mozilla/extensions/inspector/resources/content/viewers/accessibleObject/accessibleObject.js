/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is DOM Inspector.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Alexander Surkov <surkov.alexander@gmail.com> (original author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/***************************************************************
* AccessibleObjectViewer --------------------------------------------
*  The viewer for the accessible object.
* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
* REQUIRED IMPORTS:
*   chrome://inspector/content/jsutil/events/ObserverManager.js
****************************************************************/

///////////////////////////////////////////////////////////////////////////////
//// Global Variables

var viewer;
var bundle;
var accService;

///////////////////////////////////////////////////////////////////////////////
//// Global Constants

const kAccessibleRetrievalCID = "@mozilla.org/accessibleRetrieval;1";

const nsIAccessibleRetrieval = Components.interfaces.nsIAccessibleRetrieval;
const nsIAccessible = Components.interfaces.nsIAccessible;

///////////////////////////////////////////////////////////////////////////////
//// Initialization/Destruction

window.addEventListener("load", AccessibleObjectViewer_initialize, false);

function AccessibleObjectViewer_initialize()
{
  bundle = document.getElementById("inspector-bundle");
  accService = XPCU.getService(kAccessibleRetrievalCID, nsIAccessibleRetrieval);

  viewer = new JSObjectViewer();

  viewer.__defineGetter__(
    "uid",
    function uidGetter()
    {
      return "accessibleObject";
    }
  );

  viewer.__defineSetter__(
    "subject",
    function subjectSetter(aObject)
    {
      var accObject = null;
      try {
        accObject = aObject.getUserData("accessible");
        if (accObject)
          XPCU.QI(accObject, nsIAccessible);
        else
          accObject = accService.getAccessibleFor(aObject);
      } catch(e) {
        dump("Failed to get accessible object for node.");
      }

      this.mSubject = accObject;
      this.emptyTree(this.mTreeKids);
      var ti = this.addTreeItem(this.mTreeKids,
                                bundle.getString("root.title"),
                                accObject,
                                accObject);
      ti.setAttribute("open", "true");

      this.mObsMan.dispatchEvent("subjectChange", { subject: accObject });
    }
   );

  viewer.initialize(parent.FrameExchange.receiveData(window));
}
