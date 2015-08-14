/*
    krpanoJS javascript plugin example / template
*/

var krpanoplugin = function()
{
    var local = this;   // save the 'this' pointer from the current plugin object

    var krpano = null;  // the krpano and plugin interface objects
    var plugin = null;

    var plugincanvas = null;        // optionally - a canvas object for graphic content
    var plugincanvascontext = null;


    // registerplugin - startup point for the plugin (required)
    // - krpanointerface = krpano interface object
    // - pluginpath = string with the krpano path of the plugin (e.g. "plugin[pluginname]")
    // - pluginobject = the plugin object itself (the same as: pluginobject = krpano.get(pluginpath) )
    local.registerplugin = function(krpanointerface, pluginpath, pluginobject)
    {
        krpano = krpanointerface;
        plugin = pluginobject;

        // add plugin attributes and functions
        // some example attributes:
        plugin.registerattribute("attr1", "defaultvalue");
        plugin.registerattribute("attr2", 123.456);
        plugin.registerattribute("attr3", false);
        plugin.registerattribute("attr4", 10, attr4_setter, attr4_getter);
        // add a from xml callable functions:
        plugin.testfunction1 = testfunction1;
        plugin.testfunction2 = testfunction2;
        plugin.testfunction3 = testfunction3;

        // say hello
        krpano.trace(1,"hello from plugin[" + plugin.name + "]");

        // add plugin graphic content (optionally)
        var havegraphiccontent = false;
        if (havegraphiccontent) // this code here is only an example for how-to add addtional graphical content!
        {
            // register the size of the plugin content
            // e.g. to set the plugin source size to 256x256 pixels:
            plugin.registercontentsize(256,256);

            plugincanvas = document.createElement("canvas");
            plugincanvas.width  = 256;
            plugincanvas.height = 256;
            plugincanvas.style.width  = "100%";  // automatic scale with parent
            plugincanvas.style.height = "100%";
            plugincanvas.onselectstart = function() { return false; };  // fix select mouse cursor

            // the plugin "sprite" variable holds the visible html element
            // - it can be used to add elements or events
            plugin.sprite.appendChild(plugincanvas);

            // draw something on the canvas
            // ...
        }
    }

    // unloadplugin - end point for the plugin (optionally)
    // - will be called from krpano when the plugin will be removed
    // - everything that was added by the plugin (objects,intervals,...) should be removed here
    local.unloadplugin = function()
    {
        plugin = null;
        krpano = null;
    }

    // hittest - test for clicks on the plugin (optionally)
    // - when the plugin has a graphical irregular shape then it's possible to check here for mouse clicks on it
    // - the typical usage is to check for a hit on the canvas element
    local.hittest = function(x,y)
    {
        if (plugincanvascontext)
        {
            return plugincanvascontext.isPointInPath(x,y);
        }

        return false;
    }

    // onresize - the plugin was resized from xml krpano (optionally)
    // - width,height = the new size for the plugin
    // - when not defined then only the parent html element will be scaled
    local.onresize = function(width,height)
    {
        // not used in this example

        return false;
    }


    // private plugin functions:

    // example setter/getter function and plugin functions:
    var attr4 = 10.0;

    function attr4_setter(newvalue)
    {
        krpano.trace(1,"attr4 will be changed from " + attr4 + " to " + newvalue);
        attr4 = newvalue;
    }

    function attr4_getter()
    {
        return attr4;
    }

    function testfunction1()
    {
        // trace the given arguments
        krpano.trace(1,"testfunction1() called with " + arguments.length + " arguments:");
        for (var i=0; i<arguments.length; i++)
            krpano.trace(1,"argument" + (i+1) + "=" + arguments[i]);

        // trace the current viewing direction and fov
        krpano.trace(1,"current view:");
        krpano.trace(1,"hlookat = " + krpano.view.hlookat);
        krpano.trace(1,"vlookat = " + krpano.view.vlookat);
        krpano.trace(1,"fov = " + krpano.view.fov);
    }

    function testfunction2()
    {
        // change the current fov to 120
        krpano.view.fov = 120.0;
    }

    function testfunction3()
    {
        // call krpano actions
        krpano.call("lookto(0,0,90); wait(2); lookto(90,0,90);");
    }
};